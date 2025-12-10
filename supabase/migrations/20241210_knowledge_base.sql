-- Knowledge Base Persistence Schema
-- Supports the AI Agent knowledge management system

-- ============================================
-- KNOWLEDGE ITEMS TABLE
-- Stores custom knowledge items added through admin dashboard
-- ============================================
CREATE TABLE IF NOT EXISTS knowledge_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100) NOT NULL,
    topic VARCHAR(200) NOT NULL,
    title VARCHAR(300) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT NOT NULL,
    keywords TEXT[] NOT NULL DEFAULT '{}',
    intent_patterns TEXT[] NOT NULL DEFAULT '{}',
    response_template TEXT,
    requires_disclaimer BOOLEAN DEFAULT false,
    legal_disclaimer TEXT,
    advice_level VARCHAR(20) DEFAULT 'general' CHECK (advice_level IN ('general', 'educational', 'specific')),
    confidence_level INTEGER DEFAULT 7 CHECK (confidence_level >= 1 AND confidence_level <= 10),
    related_products TEXT[] DEFAULT '{}',
    xp_reward INTEGER DEFAULT 10,
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    version INTEGER DEFAULT 1
);

-- ============================================
-- KNOWLEDGE USAGE STATS TABLE
-- Tracks how often each knowledge item is used
-- ============================================
CREATE TABLE IF NOT EXISTS knowledge_usage_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id VARCHAR(100) NOT NULL, -- Can be UUID or static knowledge ID
    hit_count INTEGER DEFAULT 0,
    last_used TIMESTAMPTZ,
    average_confidence NUMERIC(3,2) DEFAULT 0,
    user_satisfaction_score NUMERIC(3,2) DEFAULT 0,
    feedback_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(item_id)
);

-- ============================================
-- KNOWLEDGE FEEDBACK TABLE
-- Stores user feedback on knowledge responses
-- ============================================
CREATE TABLE IF NOT EXISTS knowledge_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id VARCHAR(100) NOT NULL,
    message_id VARCHAR(100) NOT NULL,
    session_id VARCHAR(100),
    rating VARCHAR(20) NOT NULL CHECK (rating IN ('helpful', 'not_helpful', 'needs_improvement')),
    comment TEXT,
    suggested_improvement TEXT,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- KNOWLEDGE GAPS TABLE
-- Tracks unmatched queries that need new knowledge items
-- ============================================
CREATE TABLE IF NOT EXISTS knowledge_gaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query TEXT NOT NULL,
    detected_intent VARCHAR(100),
    suggested_category VARCHAR(100),
    frequency INTEGER DEFAULT 1,
    priority VARCHAR(10) DEFAULT 'low' CHECK (priority IN ('high', 'medium', 'low')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'addressed', 'dismissed')),
    addressed_by_item_id UUID REFERENCES knowledge_items(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- KNOWLEDGE QUERY LOG TABLE
-- Logs all queries for analytics
-- ============================================
CREATE TABLE IF NOT EXISTS knowledge_query_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query TEXT NOT NULL,
    matched BOOLEAN DEFAULT false,
    matched_items TEXT[] DEFAULT '{}',
    detected_intent VARCHAR(100),
    session_id VARCHAR(100),
    user_id UUID REFERENCES auth.users(id),
    response_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_knowledge_items_category ON knowledge_items(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_subcategory ON knowledge_items(subcategory);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_active ON knowledge_items(is_active);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_keywords ON knowledge_items USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_intent_patterns ON knowledge_items USING GIN(intent_patterns);

CREATE INDEX IF NOT EXISTS idx_knowledge_usage_item ON knowledge_usage_stats(item_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_usage_hits ON knowledge_usage_stats(hit_count DESC);

CREATE INDEX IF NOT EXISTS idx_knowledge_feedback_item ON knowledge_feedback(item_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_feedback_rating ON knowledge_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_knowledge_feedback_created ON knowledge_feedback(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_knowledge_gaps_priority ON knowledge_gaps(priority);
CREATE INDEX IF NOT EXISTS idx_knowledge_gaps_status ON knowledge_gaps(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_gaps_frequency ON knowledge_gaps(frequency DESC);

CREATE INDEX IF NOT EXISTS idx_knowledge_query_log_created ON knowledge_query_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_query_log_matched ON knowledge_query_log(matched);
CREATE INDEX IF NOT EXISTS idx_knowledge_query_log_intent ON knowledge_query_log(detected_intent);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update usage stats
CREATE OR REPLACE FUNCTION update_knowledge_usage(
    p_item_id VARCHAR(100)
)
RETURNS void AS $$
BEGIN
    INSERT INTO knowledge_usage_stats (item_id, hit_count, last_used, updated_at)
    VALUES (p_item_id, 1, NOW(), NOW())
    ON CONFLICT (item_id)
    DO UPDATE SET
        hit_count = knowledge_usage_stats.hit_count + 1,
        last_used = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to record or increment a gap
CREATE OR REPLACE FUNCTION record_knowledge_gap(
    p_query TEXT,
    p_intent VARCHAR(100),
    p_category VARCHAR(100)
)
RETURNS UUID AS $$
DECLARE
    v_existing_id UUID;
    v_new_frequency INTEGER;
    v_new_priority VARCHAR(10);
BEGIN
    -- Check for similar existing gap (simple substring match)
    SELECT id, frequency INTO v_existing_id, v_new_frequency
    FROM knowledge_gaps
    WHERE status = 'open'
      AND (
          LOWER(query) LIKE '%' || LOWER(LEFT(p_query, 20)) || '%'
          OR LOWER(p_query) LIKE '%' || LOWER(LEFT(query, 20)) || '%'
      )
    LIMIT 1;

    IF v_existing_id IS NOT NULL THEN
        -- Update existing gap
        v_new_frequency := v_new_frequency + 1;

        -- Calculate new priority
        IF v_new_frequency >= 5 THEN
            v_new_priority := 'high';
        ELSIF v_new_frequency >= 3 THEN
            v_new_priority := 'medium';
        ELSE
            v_new_priority := 'low';
        END IF;

        UPDATE knowledge_gaps
        SET frequency = v_new_frequency,
            priority = v_new_priority,
            updated_at = NOW()
        WHERE id = v_existing_id;

        RETURN v_existing_id;
    ELSE
        -- Create new gap
        INSERT INTO knowledge_gaps (query, detected_intent, suggested_category)
        VALUES (p_query, p_intent, p_category)
        RETURNING id INTO v_existing_id;

        RETURN v_existing_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update satisfaction score
CREATE OR REPLACE FUNCTION update_satisfaction_score(
    p_item_id VARCHAR(100),
    p_rating VARCHAR(20)
)
RETURNS void AS $$
DECLARE
    v_rating_value NUMERIC(3,2);
    v_current_score NUMERIC(3,2);
    v_current_count INTEGER;
    v_new_score NUMERIC(3,2);
BEGIN
    -- Convert rating to numeric value
    v_rating_value := CASE p_rating
        WHEN 'helpful' THEN 1.0
        WHEN 'needs_improvement' THEN 0.5
        ELSE 0.0
    END;

    -- Get current stats
    SELECT user_satisfaction_score, feedback_count
    INTO v_current_score, v_current_count
    FROM knowledge_usage_stats
    WHERE item_id = p_item_id;

    IF v_current_count IS NULL THEN
        v_current_count := 0;
        v_current_score := 0;
    END IF;

    -- Calculate new weighted average
    v_new_score := ((v_current_score * v_current_count) + v_rating_value) / (v_current_count + 1);

    -- Update or insert
    INSERT INTO knowledge_usage_stats (item_id, feedback_count, user_satisfaction_score, updated_at)
    VALUES (p_item_id, 1, v_rating_value, NOW())
    ON CONFLICT (item_id)
    DO UPDATE SET
        feedback_count = knowledge_usage_stats.feedback_count + 1,
        user_satisfaction_score = v_new_score,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE knowledge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_query_log ENABLE ROW LEVEL SECURITY;

-- Public read access for knowledge items (they're meant to be public)
CREATE POLICY "Anyone can read active knowledge items"
    ON knowledge_items FOR SELECT
    USING (is_active = true);

-- Only authenticated users can insert/update/delete
CREATE POLICY "Authenticated users can manage knowledge items"
    ON knowledge_items FOR ALL
    USING (auth.role() = 'authenticated');

-- Public read for usage stats
CREATE POLICY "Anyone can read usage stats"
    ON knowledge_usage_stats FOR SELECT
    USING (true);

-- Service role can update stats
CREATE POLICY "Service can update usage stats"
    ON knowledge_usage_stats FOR ALL
    USING (true);

-- Anyone can submit feedback
CREATE POLICY "Anyone can submit feedback"
    ON knowledge_feedback FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Authenticated users can read feedback"
    ON knowledge_feedback FOR SELECT
    USING (auth.role() = 'authenticated');

-- Public read for gaps (for admin dashboard)
CREATE POLICY "Authenticated users can manage gaps"
    ON knowledge_gaps FOR ALL
    USING (auth.role() = 'authenticated');

-- Query log - service role only
CREATE POLICY "Service can manage query log"
    ON knowledge_query_log FOR ALL
    USING (true);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER knowledge_items_updated_at
    BEFORE UPDATE ON knowledge_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER knowledge_gaps_updated_at
    BEFORE UPDATE ON knowledge_gaps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER knowledge_usage_stats_updated_at
    BEFORE UPDATE ON knowledge_usage_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
