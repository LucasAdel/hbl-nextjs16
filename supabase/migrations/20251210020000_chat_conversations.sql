-- ============================================
-- Chat Conversations & Messages
-- Stores all Bailey AI chat interactions for analytics and admin dashboard
-- ============================================

-- Chat Conversations Table (session-level metadata)
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    message_count INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    lead_score INTEGER DEFAULT 0,
    lead_category VARCHAR(10) CHECK (lead_category IN ('hot', 'warm', 'cold')),
    primary_intent VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages Table (individual messages in conversations)
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    intent VARCHAR(100),
    knowledge_items_used TEXT[] DEFAULT '{}',
    xp_awarded INTEGER DEFAULT 0,
    confidence_score NUMERIC(3,2),
    response_time_ms INTEGER,
    source VARCHAR(50), -- 'ai', 'knowledge_base', 'fallback'
    model_used VARCHAR(100),
    actions JSONB DEFAULT '[]',
    show_disclaimer BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES for Performance
-- ============================================

-- Conversation indexes
CREATE INDEX IF NOT EXISTS idx_chat_conv_session ON chat_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_conv_user ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conv_status ON chat_conversations(status);
CREATE INDEX IF NOT EXISTS idx_chat_conv_lead_category ON chat_conversations(lead_category);
CREATE INDEX IF NOT EXISTS idx_chat_conv_created ON chat_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conv_primary_intent ON chat_conversations(primary_intent);

-- Message indexes
CREATE INDEX IF NOT EXISTS idx_chat_msg_conv ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_msg_created ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_msg_role ON chat_messages(role);
CREATE INDEX IF NOT EXISTS idx_chat_msg_intent ON chat_messages(intent);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update conversation stats when message is added
CREATE OR REPLACE FUNCTION update_conversation_stats()
RETURNS TRIGGER AS $$
DECLARE
    msg_count INTEGER;
    total_xp INTEGER;
    latest_intent VARCHAR(100);
BEGIN
    -- Calculate stats
    SELECT
        COUNT(*),
        COALESCE(SUM(xp_awarded), 0),
        (SELECT intent FROM chat_messages WHERE conversation_id = NEW.conversation_id AND intent IS NOT NULL ORDER BY created_at DESC LIMIT 1)
    INTO msg_count, total_xp, latest_intent
    FROM chat_messages
    WHERE conversation_id = NEW.conversation_id;

    -- Update conversation
    UPDATE chat_conversations
    SET
        message_count = msg_count,
        xp_earned = total_xp,
        primary_intent = COALESCE(primary_intent, latest_intent),
        updated_at = NOW()
    WHERE id = NEW.conversation_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for message inserts
DROP TRIGGER IF EXISTS update_conv_stats_on_message ON chat_messages;
CREATE TRIGGER update_conv_stats_on_message
    AFTER INSERT ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_stats();

-- Function to calculate lead score based on conversation behavior
CREATE OR REPLACE FUNCTION calculate_lead_score(conv_id UUID)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    conv RECORD;
    booking_mentioned BOOLEAN := FALSE;
    contact_mentioned BOOLEAN := FALSE;
    high_value_intents TEXT[] := ARRAY['booking', 'pricing', 'tenant_doctor', 'payroll_tax', 'urgent'];
BEGIN
    -- Get conversation details
    SELECT * INTO conv FROM chat_conversations WHERE id = conv_id;
    IF NOT FOUND THEN RETURN 0; END IF;

    -- Base score from message count (engagement)
    score := LEAST(conv.message_count * 5, 30); -- Max 30 points from messages

    -- XP earned indicates quality interactions
    score := score + LEAST(conv.xp_earned / 5, 20); -- Max 20 points from XP

    -- Check for high-value intents
    IF conv.primary_intent = ANY(high_value_intents) THEN
        score := score + 20;
    END IF;

    -- Check message content for booking/contact signals
    SELECT
        EXISTS(SELECT 1 FROM chat_messages WHERE conversation_id = conv_id AND LOWER(content) ~ '(book|appointment|consultation|schedule)'),
        EXISTS(SELECT 1 FROM chat_messages WHERE conversation_id = conv_id AND LOWER(content) ~ '(call|phone|email|contact)')
    INTO booking_mentioned, contact_mentioned;

    IF booking_mentioned THEN score := score + 25; END IF;
    IF contact_mentioned THEN score := score + 15; END IF;

    -- Check for user email (more committed lead)
    IF conv.user_email IS NOT NULL THEN
        score := score + 10;
    END IF;

    -- Cap at 100
    RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- Function to update lead score and category
CREATE OR REPLACE FUNCTION update_lead_score(conv_id UUID)
RETURNS VOID AS $$
DECLARE
    score INTEGER;
    category VARCHAR(10);
BEGIN
    score := calculate_lead_score(conv_id);

    -- Determine category
    IF score >= 80 THEN
        category := 'hot';
    ELSIF score >= 50 THEN
        category := 'warm';
    ELSE
        category := 'cold';
    END IF;

    -- Update conversation
    UPDATE chat_conversations
    SET
        lead_score = score,
        lead_category = category,
        updated_at = NOW()
    WHERE id = conv_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to recalculate lead score on message insert
CREATE OR REPLACE FUNCTION trigger_update_lead_score()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_lead_score(NEW.conversation_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_lead_score_on_message ON chat_messages;
CREATE TRIGGER update_lead_score_on_message
    AFTER INSERT ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION trigger_update_lead_score();

-- ============================================
-- HELPER FUNCTIONS for API
-- ============================================

-- Get or create conversation
CREATE OR REPLACE FUNCTION get_or_create_conversation(
    p_session_id VARCHAR(100),
    p_user_id UUID DEFAULT NULL,
    p_user_email VARCHAR(255) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    conv_id UUID;
BEGIN
    -- Try to find existing conversation
    SELECT id INTO conv_id
    FROM chat_conversations
    WHERE session_id = p_session_id;

    IF FOUND THEN
        -- Update user info if provided
        IF p_user_id IS NOT NULL OR p_user_email IS NOT NULL THEN
            UPDATE chat_conversations
            SET
                user_id = COALESCE(p_user_id, user_id),
                user_email = COALESCE(p_user_email, user_email),
                updated_at = NOW()
            WHERE id = conv_id;
        END IF;
        RETURN conv_id;
    END IF;

    -- Create new conversation
    INSERT INTO chat_conversations (session_id, user_id, user_email)
    VALUES (p_session_id, p_user_id, p_user_email)
    RETURNING id INTO conv_id;

    RETURN conv_id;
END;
$$ LANGUAGE plpgsql;

-- Get conversation analytics summary
CREATE OR REPLACE FUNCTION get_conversation_analytics(
    p_date_from TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    p_date_to TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    total_conversations BIGINT,
    total_messages BIGINT,
    avg_messages_per_conv NUMERIC,
    hot_leads BIGINT,
    warm_leads BIGINT,
    cold_leads BIGINT,
    avg_lead_score NUMERIC,
    avg_xp_earned NUMERIC,
    top_intents JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(DISTINCT c.id)::BIGINT as total_conversations,
        COUNT(m.id)::BIGINT as total_messages,
        ROUND(AVG(c.message_count)::NUMERIC, 1) as avg_messages_per_conv,
        COUNT(CASE WHEN c.lead_category = 'hot' THEN 1 END)::BIGINT as hot_leads,
        COUNT(CASE WHEN c.lead_category = 'warm' THEN 1 END)::BIGINT as warm_leads,
        COUNT(CASE WHEN c.lead_category = 'cold' THEN 1 END)::BIGINT as cold_leads,
        ROUND(AVG(c.lead_score)::NUMERIC, 1) as avg_lead_score,
        ROUND(AVG(c.xp_earned)::NUMERIC, 1) as avg_xp_earned,
        (
            SELECT jsonb_agg(jsonb_build_object('intent', intent, 'count', cnt))
            FROM (
                SELECT primary_intent as intent, COUNT(*) as cnt
                FROM chat_conversations
                WHERE created_at BETWEEN p_date_from AND p_date_to
                AND primary_intent IS NOT NULL
                GROUP BY primary_intent
                ORDER BY cnt DESC
                LIMIT 5
            ) top
        ) as top_intents
    FROM chat_conversations c
    LEFT JOIN chat_messages m ON m.conversation_id = c.id
    WHERE c.created_at BETWEEN p_date_from AND p_date_to;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for chat_conversations
-- Service role can do everything
CREATE POLICY "Service role full access to conversations"
    ON chat_conversations FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Authenticated users can view their own conversations
CREATE POLICY "Users can view own conversations"
    ON chat_conversations FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR user_id IS NULL);

-- Anonymous can create (session-based)
CREATE POLICY "Anyone can create conversations"
    ON chat_conversations FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Policies for chat_messages
CREATE POLICY "Service role full access to messages"
    ON chat_messages FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can view messages in own conversations"
    ON chat_messages FOR SELECT
    TO authenticated
    USING (
        conversation_id IN (
            SELECT id FROM chat_conversations WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can create messages"
    ON chat_messages FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- ============================================
-- SAMPLE DATA (for testing - optional)
-- ============================================

-- Uncomment to insert test data:
/*
INSERT INTO chat_conversations (session_id, user_email, lead_score, lead_category, primary_intent, message_count, xp_earned)
VALUES
    ('test-session-001', 'john@example.com', 85, 'hot', 'booking', 8, 45),
    ('test-session-002', 'jane@example.com', 60, 'warm', 'pricing', 5, 25),
    ('test-session-003', NULL, 30, 'cold', 'general_inquiry', 2, 10);

INSERT INTO chat_messages (conversation_id, role, content, intent, xp_awarded)
SELECT
    id,
    'user',
    'I need help with tenant doctor arrangements for my medical practice',
    'tenant_doctor',
    0
FROM chat_conversations WHERE session_id = 'test-session-001';

INSERT INTO chat_messages (conversation_id, role, content, intent, knowledge_items_used, xp_awarded, source)
SELECT
    id,
    'assistant',
    'Hamilton Bailey is the exclusive owner of the Tenant Doctor trademark...',
    'tenant_doctor',
    ARRAY['tenant-doctor'],
    15,
    'knowledge_base'
FROM chat_conversations WHERE session_id = 'test-session-001';
*/
