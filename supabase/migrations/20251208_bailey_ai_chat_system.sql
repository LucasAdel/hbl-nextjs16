-- =============================================================================
-- BAILEY AI CHAT SYSTEM - COMPREHENSIVE DATABASE SCHEMA
-- =============================================================================
-- This migration creates the complete database infrastructure for the enhanced
-- AI chatbot system, including conversation persistence, knowledge base management,
-- user preferences tracking, and analytics.
-- =============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABLE: chat_conversations
-- =============================================================================
-- Stores conversation sessions with full metadata for persistence and analytics
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    summary TEXT,
    lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
    lead_category TEXT CHECK (lead_category IN ('hot', 'warm', 'cold')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for chat_conversations
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON public.chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_session_id ON public.chat_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON public.chat_conversations(status);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_lead_score ON public.chat_conversations(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_last_message ON public.chat_conversations(last_message_at DESC);

-- RLS Policies for chat_conversations
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
    ON public.chat_conversations FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own conversations"
    ON public.chat_conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own conversations"
    ON public.chat_conversations FOR UPDATE
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Service role has full access to conversations"
    ON public.chat_conversations FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================================================
-- TABLE: chat_messages
-- =============================================================================
-- Stores individual messages within conversations
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    confidence_score NUMERIC(4,3) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    knowledge_items_used TEXT[],
    intent_detected TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON public.chat_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_chat_messages_role ON public.chat_messages(role);

-- RLS Policies for chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages from their conversations"
    ON public.chat_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.chat_conversations
            WHERE id = chat_messages.conversation_id
            AND (user_id = auth.uid() OR user_id IS NULL)
        )
    );

CREATE POLICY "Users can insert messages to their conversations"
    ON public.chat_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.chat_conversations
            WHERE id = conversation_id
            AND (user_id = auth.uid() OR user_id IS NULL)
        )
    );

CREATE POLICY "Service role has full access to messages"
    ON public.chat_messages FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================================================
-- TABLE: bailey_knowledge_base
-- =============================================================================
-- Stores knowledge items for AI responses with rich metadata
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.bailey_knowledge_base (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL,
    subcategory TEXT,
    topic TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT NOT NULL,
    keywords TEXT[] NOT NULL DEFAULT '{}',
    intent_patterns TEXT[] NOT NULL DEFAULT '{}',
    response_template TEXT,
    requires_disclaimer BOOLEAN DEFAULT FALSE,
    legal_disclaimer TEXT,
    advice_level TEXT DEFAULT 'general' CHECK (advice_level IN ('general', 'informational', 'specific', 'referral_only')),
    confidence_level INTEGER DEFAULT 5 CHECK (confidence_level >= 1 AND confidence_level <= 10),
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    success_rate NUMERIC(4,3) DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for bailey_knowledge_base
CREATE INDEX IF NOT EXISTS idx_bailey_kb_category ON public.bailey_knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_bailey_kb_is_active ON public.bailey_knowledge_base(is_active);
CREATE INDEX IF NOT EXISTS idx_bailey_kb_priority ON public.bailey_knowledge_base(priority DESC);
CREATE INDEX IF NOT EXISTS idx_bailey_kb_keywords ON public.bailey_knowledge_base USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_bailey_kb_intent ON public.bailey_knowledge_base USING GIN(intent_patterns);

-- RLS Policies for bailey_knowledge_base
ALTER TABLE public.bailey_knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active knowledge items"
    ON public.bailey_knowledge_base FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "Only admins can modify knowledge base"
    ON public.bailey_knowledge_base FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'staff')
        )
    );

CREATE POLICY "Service role has full access to knowledge base"
    ON public.bailey_knowledge_base FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================================================
-- TABLE: bailey_analytics
-- =============================================================================
-- Stores analytics data for conversation performance tracking
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.bailey_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE SET NULL,
    user_message TEXT NOT NULL,
    bailey_response TEXT NOT NULL,
    knowledge_items_used TEXT[],
    confidence_score NUMERIC(4,3),
    response_time_ms INTEGER,
    page_url TEXT,
    user_agent TEXT,
    user_feedback INTEGER CHECK (user_feedback >= 1 AND user_feedback <= 5),
    escalated_to_human BOOLEAN DEFAULT FALSE,
    objection_detected TEXT,
    intent_category TEXT,
    lead_score_delta INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for bailey_analytics
CREATE INDEX IF NOT EXISTS idx_bailey_analytics_session ON public.bailey_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_bailey_analytics_conversation ON public.bailey_analytics(conversation_id);
CREATE INDEX IF NOT EXISTS idx_bailey_analytics_created ON public.bailey_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bailey_analytics_escalated ON public.bailey_analytics(escalated_to_human);
CREATE INDEX IF NOT EXISTS idx_bailey_analytics_intent ON public.bailey_analytics(intent_category);

-- RLS Policies for bailey_analytics
ALTER TABLE public.bailey_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view analytics"
    ON public.bailey_analytics FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'staff')
        )
    );

CREATE POLICY "Anyone can insert analytics"
    ON public.bailey_analytics FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "Service role has full access to analytics"
    ON public.bailey_analytics FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================================================
-- TABLE: chat_user_preferences
-- =============================================================================
-- Stores learned user preferences from conversation analysis
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.chat_user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_fingerprint TEXT,
    practice_type TEXT CHECK (practice_type IN ('medical', 'dental', 'pharmacy', 'allied_health', 'veterinary', 'other')),
    business_size TEXT CHECK (business_size IN ('solo', 'small', 'medium', 'large')),
    communication_style TEXT DEFAULT 'standard' CHECK (communication_style IN ('urgent', 'detailed', 'concise', 'standard')),
    urgency_level TEXT DEFAULT 'low' CHECK (urgency_level IN ('high', 'medium', 'low')),
    topic_interests TEXT[] DEFAULT '{}',
    preferred_time_slots TEXT[] DEFAULT '{}',
    total_interactions INTEGER DEFAULT 0,
    last_interaction TIMESTAMPTZ,
    average_sentiment TEXT DEFAULT 'neutral' CHECK (average_sentiment IN ('positive', 'neutral', 'negative')),
    conversion_potential TEXT DEFAULT 'unknown' CHECK (conversion_potential IN ('high', 'medium', 'low', 'unknown')),
    objections_raised TEXT[] DEFAULT '{}',
    booking_history JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id),
    UNIQUE(session_fingerprint)
);

-- Indexes for chat_user_preferences
CREATE INDEX IF NOT EXISTS idx_chat_prefs_user_id ON public.chat_user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_prefs_fingerprint ON public.chat_user_preferences(session_fingerprint);
CREATE INDEX IF NOT EXISTS idx_chat_prefs_practice ON public.chat_user_preferences(practice_type);
CREATE INDEX IF NOT EXISTS idx_chat_prefs_conversion ON public.chat_user_preferences(conversion_potential);

-- RLS Policies for chat_user_preferences
ALTER TABLE public.chat_user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
    ON public.chat_user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
    ON public.chat_user_preferences FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert preferences"
    ON public.chat_user_preferences FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "Service role has full access to preferences"
    ON public.chat_user_preferences FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for chat_conversations
DROP TRIGGER IF EXISTS update_chat_conversations_updated_at ON public.chat_conversations;
CREATE TRIGGER update_chat_conversations_updated_at
    BEFORE UPDATE ON public.chat_conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for bailey_knowledge_base
DROP TRIGGER IF EXISTS update_bailey_kb_updated_at ON public.bailey_knowledge_base;
CREATE TRIGGER update_bailey_kb_updated_at
    BEFORE UPDATE ON public.bailey_knowledge_base
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for chat_user_preferences
DROP TRIGGER IF EXISTS update_chat_prefs_updated_at ON public.chat_user_preferences;
CREATE TRIGGER update_chat_prefs_updated_at
    BEFORE UPDATE ON public.chat_user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to increment knowledge item usage count
CREATE OR REPLACE FUNCTION public.increment_knowledge_usage(item_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.bailey_knowledge_base
    SET usage_count = usage_count + 1
    WHERE id = item_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate conversation analytics
CREATE OR REPLACE FUNCTION public.get_bailey_analytics_summary(
    start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    total_conversations BIGINT,
    avg_confidence NUMERIC,
    escalation_rate NUMERIC,
    avg_response_time NUMERIC,
    positive_feedback_rate NUMERIC,
    top_intents JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(DISTINCT session_id)::BIGINT as total_conversations,
        ROUND(AVG(confidence_score)::NUMERIC, 3) as avg_confidence,
        ROUND((COUNT(*) FILTER (WHERE escalated_to_human = TRUE)::NUMERIC / NULLIF(COUNT(*)::NUMERIC, 0)) * 100, 2) as escalation_rate,
        ROUND(AVG(response_time_ms)::NUMERIC, 0) as avg_response_time,
        ROUND((COUNT(*) FILTER (WHERE user_feedback >= 4)::NUMERIC / NULLIF(COUNT(*) FILTER (WHERE user_feedback IS NOT NULL)::NUMERIC, 0)) * 100, 2) as positive_feedback_rate,
        (
            SELECT jsonb_agg(intent_data ORDER BY count DESC)
            FROM (
                SELECT jsonb_build_object('intent', intent_category, 'count', COUNT(*)) as intent_data, COUNT(*) as count
                FROM public.bailey_analytics
                WHERE created_at BETWEEN start_date AND end_date
                AND intent_category IS NOT NULL
                GROUP BY intent_category
                LIMIT 10
            ) sub
        ) as top_intents
    FROM public.bailey_analytics
    WHERE created_at BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- INITIAL KNOWLEDGE BASE SEED DATA
-- =============================================================================

INSERT INTO public.bailey_knowledge_base (
    category, subcategory, topic, title, content, summary, keywords, intent_patterns,
    response_template, requires_disclaimer, advice_level, confidence_level, priority, is_active
) VALUES
-- AHPRA Compliance
(
    'compliance',
    'ahpra',
    'Advertising Guidelines',
    'AHPRA Advertising Compliance',
    'AHPRA (Australian Health Practitioner Regulation Agency) has strict guidelines about how healthcare practitioners can advertise their services. Key requirements include: no misleading claims, no testimonials in certain contexts, clear identification of qualifications, and accurate representation of services. Violations can result in significant penalties and disciplinary action.',
    'Essential AHPRA advertising guidelines for healthcare practitioners to ensure compliant marketing.',
    ARRAY['ahpra', 'advertising', 'compliance', 'healthcare marketing', 'medical advertising', 'practitioner advertising'],
    ARRAY['ahpra advertising', 'can i advertise', 'healthcare marketing rules', 'medical practice advertising'],
    E'**AHPRA Advertising Compliance**\n\nAHPRA has strict guidelines for healthcare advertising:\n\n**Key Requirements:**\n• No misleading or deceptive claims\n• Testimonials must comply with specific rules\n• Qualifications must be accurately stated\n• Services must be truthfully represented\n\n**Risks of Non-Compliance:**\n• Fines up to $60,000 for individuals\n• Professional disciplinary action\n• Reputation damage\n\nWould you like help reviewing your current advertising materials?',
    true,
    'informational',
    9,
    9,
    true
),

-- Telehealth Consent
(
    'compliance',
    'telehealth',
    'Patient Consent',
    'Telehealth Consent Requirements',
    'Telehealth services require specific patient consent protocols including: informed consent about technology limitations, privacy considerations for digital consultations, Medicare billing requirements for telehealth, and documentation standards. Proper consent protects both practitioners and patients.',
    'Comprehensive telehealth consent requirements for compliant virtual healthcare delivery.',
    ARRAY['telehealth', 'consent', 'virtual consultation', 'online healthcare', 'digital health', 'medicare telehealth'],
    ARRAY['telehealth consent', 'online consultation requirements', 'virtual appointment consent', 'telehealth rules'],
    E'**Telehealth Consent Requirements**\n\nTelehealth consultations require proper consent covering:\n\n**Essential Elements:**\n• Patient identity verification\n• Technology limitations explained\n• Privacy and security measures\n• Alternative consultation options\n• Medicare billing eligibility\n\n**Documentation Required:**\n• Written or recorded verbal consent\n• Consent refresh for ongoing care\n• Privacy policy acknowledgment\n\nNeed a telehealth consent template for your practice?',
    true,
    'specific',
    9,
    8,
    true
),

-- Employment Contracts
(
    'documents',
    'employment',
    'Medical Staff Contracts',
    'Medical Practice Employment Contracts',
    'Employment contracts for medical practices must address unique requirements including: AHPRA registration maintenance, professional indemnity insurance, restraint of trade clauses specific to healthcare, Medicare compliance obligations, and on-call arrangements. Our templates are specifically designed for the healthcare sector.',
    'Specialized employment contracts designed for medical practices with healthcare-specific provisions.',
    ARRAY['employment contract', 'staff contract', 'medical employment', 'healthcare staff', 'doctor employment', 'nurse contract'],
    ARRAY['employment contract', 'staff agreement', 'hire a doctor', 'employing medical staff', 'employment template'],
    E'**Medical Practice Employment Contracts**\n\nOur healthcare-specific employment contracts include:\n\n**Standard Provisions:**\n• Position description and duties\n• Remuneration and benefits\n• Leave entitlements\n• Termination provisions\n\n**Healthcare-Specific Clauses:**\n• AHPRA registration requirements\n• Professional indemnity insurance\n• Medicare compliance obligations\n• Confidentiality and privacy\n• Restraint of trade (healthcare-appropriate)\n\n**Pricing:** From $495 for standard templates\n\nWould you like a quote for your specific needs?',
    true,
    'general',
    9,
    8,
    true
),

-- Privacy Policy
(
    'documents',
    'privacy',
    'Healthcare Privacy',
    'Healthcare Privacy Policy',
    'Medical practices must maintain comprehensive privacy policies compliant with the Privacy Act 1988, Australian Privacy Principles, and My Health Records Act. Healthcare privacy has additional requirements including: health information handling, patient access rights, disclosure limitations, and breach notification procedures.',
    'Compliant privacy policies specifically designed for healthcare organizations handling sensitive health information.',
    ARRAY['privacy policy', 'privacy act', 'patient privacy', 'health records', 'data protection', 'app privacy'],
    ARRAY['privacy policy', 'patient data protection', 'health information privacy', 'privacy requirements'],
    E'**Healthcare Privacy Policy**\n\nOur healthcare privacy policies ensure compliance with:\n\n**Legal Framework:**\n• Privacy Act 1988\n• Australian Privacy Principles (APPs)\n• My Health Records Act 2012\n• State health records legislation\n\n**Key Inclusions:**\n• Collection and use of health information\n• Patient access and correction rights\n• Third-party disclosure rules\n• Data breach response procedures\n• Digital health considerations\n\n**Pricing:** From $395 for standard template\n\nWould you like a privacy policy review?',
    true,
    'general',
    9,
    8,
    true
),

-- Tenant Doctor Arrangements
(
    'services',
    'tenant-doctor',
    'Tenant Doctor Arrangements',
    'Tenant Doctor Service Agreements',
    'Tenant Doctor arrangements allow medical practitioners to operate independently within a practice, paying fees for facilities and services rather than being employees. This structure helps with payroll tax optimization, contractor compliance, and Fair Work considerations. Proper documentation is essential to maintain the arrangement.',
    'Expert Tenant Doctor arrangements ensuring payroll tax efficiency and regulatory compliance.',
    ARRAY['tenant doctor', 'service agreement', 'contractor arrangement', 'payroll tax', 'independent practitioner'],
    ARRAY['tenant doctor', 'doctor contractor', 'practitioner arrangement', 'payroll tax medical', 'service agreement doctor'],
    E'**Tenant Doctor™ Arrangements**\n\nOur Tenant Doctor™ structure provides:\n\n**Key Benefits:**\n• Payroll tax optimization\n• Clear contractor relationship\n• Fair Work Act compliance\n• Flexible practice arrangements\n• Professional independence\n\n**Risk Mitigation:**\n• Avoid $250,000+ payroll tax exposures\n• Proper documentation for audits\n• Compliant fee structures\n• Regular arrangement reviews\n\n**Our Service:**\n• Full arrangement documentation\n• Compliance audit support\n• Ongoing updates as laws change\n\nBook a consultation to discuss your practice structure.',
    true,
    'specific',
    10,
    10,
    true
),

-- Contact Information
(
    'contact',
    'general',
    'Contact Details',
    'Hamilton Bailey Legal Contact Information',
    'Hamilton Bailey Legal can be contacted via phone, email, or by visiting our office. We offer consultations for medical practice law, commercial law, and document services. Initial consultations are available to discuss your specific legal needs.',
    'Contact Hamilton Bailey Legal for expert medical practice law and commercial legal services.',
    ARRAY['contact', 'phone', 'email', 'office', 'consultation', 'appointment', 'location', 'address'],
    ARRAY['contact', 'phone number', 'email address', 'book appointment', 'speak to someone', 'get in touch', 'how to reach'],
    E'**Contact Hamilton Bailey Legal**\n\n📞 **Phone:** (08) 8121 5167\n📧 **Email:** admin@hamiltonbailey.com.au\n🏢 **Address:** Level 1, 147 Pirie Street, Adelaide SA 5000\n\n**Office Hours:**\nMonday - Friday: 9:00 AM - 5:00 PM\n\n**Services:**\n• Medical Practice Law\n• Commercial Law\n• Document Services\n• Regulatory Compliance\n\nWould you like to book a consultation?',
    false,
    'general',
    10,
    10,
    true
),

-- Pricing Information
(
    'pricing',
    'documents',
    'Document Pricing',
    'Legal Document Pricing Guide',
    'We offer transparent fixed-fee pricing for our legal documents. Employment contracts from $495, privacy policies from $395, service agreements from $595, and comprehensive compliance packages from $1,495. All documents are customized to your specific needs and include updates for 12 months.',
    'Transparent fixed-fee pricing for legal documents with 12-month update guarantee.',
    ARRAY['pricing', 'cost', 'fees', 'price', 'how much', 'document cost', 'quote'],
    ARRAY['how much', 'pricing', 'cost of', 'fees for', 'price list', 'quote for'],
    E'**Legal Document Pricing**\n\n**Individual Documents:**\n• Employment Contract: From $495\n• Privacy Policy: From $395\n• Service Agreement: From $595\n• Consent Forms: From $295\n• Lease Review: From $695\n\n**Compliance Packages:**\n• Starter Pack (3 docs): $995\n• Standard Pack (5 docs): $1,495\n• Premium Pack (8 docs): $2,295\n\n**All packages include:**\n✓ Customization for your practice\n✓ 12-month update guarantee\n✓ Implementation support\n\nWould you like a detailed quote?',
    false,
    'general',
    10,
    9,
    true
),

-- Payroll Tax Risk
(
    'compliance',
    'payroll-tax',
    'Payroll Tax Risk Management',
    'Medical Practice Payroll Tax Compliance',
    'Medical practices face significant payroll tax risks when contractor arrangements are not properly structured. State Revenue Offices actively audit medical practices for payroll tax compliance. Retrospective assessments can exceed $250,000 with penalties and interest. Key risk factors include control over practitioners, exclusive arrangements, and terminology used.',
    'Critical payroll tax compliance guidance to avoid retrospective assessments exceeding $250,000.',
    ARRAY['payroll tax', 'state revenue', 'tax audit', 'contractor tax', 'employment tax', 'tax compliance'],
    ARRAY['payroll tax', 'tax audit', 'state revenue', 'contractor tax risk', 'payroll tax assessment'],
    E'**Payroll Tax Risk Management**\n\n⚠️ **Critical Risk Area for Medical Practices**\n\n**Risk Indicators:**\n• Using "our doctors" or "staff doctors" language\n• Exclusive practitioner arrangements\n• Practice-controlled scheduling\n• Uniform or branding requirements\n• Practice-mandated procedures\n\n**Potential Exposure:**\n• Retrospective assessments $250,000+\n• Penalties up to 90% of tax owed\n• Interest accruing daily\n• Reputation damage\n\n**Our Solution:**\n• Comprehensive compliance review\n• Arrangement restructuring\n• Audit defense support\n• Ongoing monitoring\n\nBook an urgent review if you have concerns.',
    true,
    'specific',
    10,
    10,
    true
),

-- Fair Work Compliance
(
    'compliance',
    'fair-work',
    'Fair Work Act Compliance',
    'Fair Work Act Obligations for Medical Practices',
    'The Fair Work Act imposes significant obligations on medical practices including proper classification of workers, minimum entitlements for employees, and contractor arrangement compliance. Sham contracting can result in back-pay claims, penalties, and personal liability for directors.',
    'Essential Fair Work Act compliance guidance for medical practices to avoid costly penalties.',
    ARRAY['fair work', 'employment law', 'contractor', 'employee rights', 'workplace law', 'sham contracting'],
    ARRAY['fair work', 'employee or contractor', 'employment classification', 'sham contracting', 'workplace compliance'],
    E'**Fair Work Act Compliance**\n\n**Key Obligations:**\n• Correct worker classification\n• Minimum wage compliance\n• Leave entitlements (employees)\n• Notice and redundancy\n• Unfair dismissal protections\n\n**Risk Areas:**\n• Sham contracting arrangements\n• Underpayment claims\n• Penalties up to $66,600/breach\n• Personal liability for directors\n\n**Our Services:**\n• Classification assessment\n• Employment contract review\n• Contractor arrangement audit\n• Dispute resolution support\n\nWould you like a compliance assessment?',
    true,
    'specific',
    9,
    9,
    true
),

-- Booking Prompt
(
    'services',
    'booking',
    'Consultation Booking',
    'Book a Legal Consultation',
    'Book a consultation with our experienced legal team to discuss your specific needs. We offer initial consultations to understand your situation and provide tailored advice. Consultations available in-person, via phone, or video conference.',
    'Book a consultation with Hamilton Bailey Legal for personalized legal advice.',
    ARRAY['book', 'appointment', 'consultation', 'meeting', 'schedule', 'speak to lawyer'],
    ARRAY['book', 'appointment', 'consultation', 'schedule', 'speak to', 'meet with', 'arrange a call'],
    E'**Book a Consultation**\n\nI''d be happy to help you schedule a consultation with our legal team.\n\n**Consultation Options:**\n• In-person at our Adelaide office\n• Phone consultation\n• Video conference (Zoom/Teams)\n\n**What to Expect:**\n• Discuss your specific situation\n• Understand your legal options\n• Receive tailored recommendations\n• Get a clear fee estimate\n\n**Initial Consultation:** Complimentary for new clients\n\nClick below to book your preferred time.',
    false,
    'general',
    10,
    10,
    true
),

-- Practice Setup
(
    'services',
    'practice-setup',
    'New Practice Establishment',
    'Setting Up a New Medical Practice',
    'Starting a new medical practice requires careful planning across legal, regulatory, and operational areas. Key considerations include: business structure selection, AHPRA compliance, Medicare provider requirements, lease negotiations, staff contracts, and insurance arrangements. We provide comprehensive support for new practice establishment.',
    'Complete legal support for establishing new medical practices with all regulatory requirements.',
    ARRAY['new practice', 'start practice', 'establish clinic', 'open medical practice', 'practice setup'],
    ARRAY['start a practice', 'new medical practice', 'opening a clinic', 'establish practice', 'setup medical'],
    E'**New Medical Practice Setup**\n\nEstablishing a new practice requires:\n\n**Legal Structure:**\n• Business structure advice\n• Company/trust formation\n• Partnership agreements\n• Shareholder arrangements\n\n**Regulatory Compliance:**\n• AHPRA requirements\n• Medicare provider setup\n• Privacy compliance\n• Insurance arrangements\n\n**Operational Documents:**\n• Lease negotiation\n• Staff contracts\n• Patient forms\n• Policies and procedures\n\n**Our Package:** From $3,995\n\nBook a consultation to discuss your new practice.',
    true,
    'general',
    9,
    8,
    true
),

-- Partnership Agreements
(
    'documents',
    'partnerships',
    'Medical Partnership Agreements',
    'Medical Practice Partnership Agreements',
    'Partnership agreements for medical practices must address unique healthcare considerations including: profit sharing based on billings, locum arrangements, retirement and exit provisions, goodwill valuation, non-compete clauses, and succession planning. Generic partnership templates are not suitable for medical practices.',
    'Healthcare-specific partnership agreements addressing medical practice unique requirements.',
    ARRAY['partnership', 'partner agreement', 'medical partnership', 'practice partner', 'buy-in', 'joint practice'],
    ARRAY['partnership agreement', 'become a partner', 'partner buy-in', 'medical partnership', 'joint ownership'],
    E'**Medical Partnership Agreements**\n\nOur healthcare-specific partnership agreements cover:\n\n**Financial Provisions:**\n• Capital contributions\n• Profit/loss sharing\n• Billing allocations\n• Drawings and distributions\n\n**Operational Terms:**\n• Decision-making processes\n• Meeting requirements\n• Locum arrangements\n• Leave policies\n\n**Exit Provisions:**\n• Retirement planning\n• Buy-out mechanisms\n• Goodwill valuation\n• Non-compete terms\n\n**Pricing:** From $1,995\n\nWould you like to discuss partnership structuring?',
    true,
    'specific',
    9,
    8,
    true
)

ON CONFLICT DO NOTHING;

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Grant table permissions
GRANT SELECT ON public.bailey_knowledge_base TO anon, authenticated;
GRANT SELECT, INSERT ON public.chat_conversations TO anon, authenticated;
GRANT UPDATE ON public.chat_conversations TO authenticated;
GRANT SELECT, INSERT ON public.chat_messages TO anon, authenticated;
GRANT INSERT ON public.bailey_analytics TO anon, authenticated;
GRANT SELECT ON public.bailey_analytics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.chat_user_preferences TO anon, authenticated;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE public.chat_conversations IS 'Stores chat conversation sessions for persistence and analytics';
COMMENT ON TABLE public.chat_messages IS 'Stores individual messages within conversations';
COMMENT ON TABLE public.bailey_knowledge_base IS 'AI chatbot knowledge base with response templates';
COMMENT ON TABLE public.bailey_analytics IS 'Analytics data for conversation performance tracking';
COMMENT ON TABLE public.chat_user_preferences IS 'Learned user preferences from conversation analysis';
