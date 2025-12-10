-- Production Hardening Migration
-- Creates tables for: purchases, integrations, chat, reviews, wishlist, referrals

-- ============================================
-- 1. Document Purchases (from Stripe webhooks)
-- ============================================
CREATE TABLE IF NOT EXISTS document_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_email TEXT NOT NULL,
  stripe_session_id TEXT UNIQUE NOT NULL,
  stripe_payment_intent TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal INTEGER NOT NULL,
  discount INTEGER DEFAULT 0,
  gst INTEGER NOT NULL,
  total INTEGER NOT NULL,
  coupon_code TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_purchases_user ON document_purchases(user_email);
CREATE INDEX IF NOT EXISTS idx_document_purchases_session ON document_purchases(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_document_purchases_status ON document_purchases(status);
CREATE INDEX IF NOT EXISTS idx_document_purchases_created ON document_purchases(created_at DESC);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_document_purchases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_document_purchases_updated_at ON document_purchases;
CREATE TRIGGER trigger_document_purchases_updated_at
  BEFORE UPDATE ON document_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_document_purchases_updated_at();

-- RLS
ALTER TABLE document_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role access for document_purchases" ON document_purchases;
CREATE POLICY "Service role access for document_purchases" ON document_purchases
  FOR ALL USING (true) WITH CHECK (true);


-- ============================================
-- 2. Integration Tokens (OAuth for Xero/Google)
-- ============================================
CREATE TABLE IF NOT EXISTS user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_email TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('xero', 'google_calendar', 'google_drive', 'outlook')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expiry TIMESTAMPTZ,
  tenant_id TEXT,
  scopes TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_email, provider)
);

CREATE INDEX IF NOT EXISTS idx_user_integrations_email ON user_integrations(user_email);
CREATE INDEX IF NOT EXISTS idx_user_integrations_provider ON user_integrations(provider);
CREATE INDEX IF NOT EXISTS idx_user_integrations_active ON user_integrations(is_active);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_integrations_updated_at ON user_integrations;
CREATE TRIGGER trigger_user_integrations_updated_at
  BEFORE UPDATE ON user_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_user_integrations_updated_at();

-- RLS
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role access for user_integrations" ON user_integrations;
CREATE POLICY "Service role access for user_integrations" ON user_integrations
  FOR ALL USING (true) WITH CHECK (true);


-- ============================================
-- 3. Chat Conversations
-- ============================================
-- Note: chat_conversations table is created in bailey_ai_chat_system.sql
-- This migration adds columns that may be missing

DO $$
BEGIN
  -- Add user_email column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_conversations' AND column_name = 'user_email'
  ) THEN
    ALTER TABLE chat_conversations ADD COLUMN user_email TEXT;
  END IF;

  -- Add messages column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_conversations' AND column_name = 'messages'
  ) THEN
    ALTER TABLE chat_conversations ADD COLUMN messages JSONB NOT NULL DEFAULT '[]'::jsonb;
  END IF;

  -- Add xp_earned column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_conversations' AND column_name = 'xp_earned'
  ) THEN
    ALTER TABLE chat_conversations ADD COLUMN xp_earned INTEGER NOT NULL DEFAULT 0;
  END IF;

  -- Add intent column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_conversations' AND column_name = 'intent'
  ) THEN
    ALTER TABLE chat_conversations ADD COLUMN intent TEXT;
  END IF;

  -- Add message_count column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_conversations' AND column_name = 'message_count'
  ) THEN
    ALTER TABLE chat_conversations ADD COLUMN message_count INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_chat_conversations_session ON chat_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user ON chat_conversations(user_email);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_created ON chat_conversations(created_at DESC);

-- Note: updated_at trigger already created in bailey_ai_chat_system.sql
-- Note: RLS policies already created in bailey_ai_chat_system.sql


-- ============================================
-- 4. Product Reviews
-- ============================================
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  user_id UUID,
  user_email TEXT NOT NULL,
  user_name TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  is_approved BOOLEAN NOT NULL DEFAULT true,
  admin_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user ON product_reviews(user_email);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_product_reviews_approved ON product_reviews(is_approved);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_product_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_product_reviews_updated_at ON product_reviews;
CREATE TRIGGER trigger_product_reviews_updated_at
  BEFORE UPDATE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_reviews_updated_at();

-- RLS
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role access for product_reviews" ON product_reviews;
CREATE POLICY "Service role access for product_reviews" ON product_reviews
  FOR ALL USING (true) WITH CHECK (true);


-- ============================================
-- 5. Wishlist Items
-- ============================================
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_email TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT,
  price_at_add INTEGER,
  alert_price INTEGER,
  priority INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_email, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_items_user ON wishlist_items(user_email);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_product ON wishlist_items(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_priority ON wishlist_items(priority DESC);

-- RLS
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role access for wishlist_items" ON wishlist_items;
CREATE POLICY "Service role access for wishlist_items" ON wishlist_items
  FOR ALL USING (true) WITH CHECK (true);


-- ============================================
-- 6. Referrals
-- ============================================
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID,
  referrer_email TEXT NOT NULL,
  referrer_name TEXT,
  referred_email TEXT NOT NULL,
  referred_user_id UUID,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'purchased', 'expired')),
  signup_xp_awarded INTEGER DEFAULT 0,
  purchase_xp_awarded INTEGER DEFAULT 0,
  total_xp_awarded INTEGER GENERATED ALWAYS AS (COALESCE(signup_xp_awarded, 0) + COALESCE(purchase_xp_awarded, 0)) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  signed_up_at TIMESTAMPTZ,
  purchased_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days')
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_email);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_email);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role access for referrals" ON referrals;
CREATE POLICY "Service role access for referrals" ON referrals
  FOR ALL USING (true) WITH CHECK (true);


-- ============================================
-- 7. Review Helpful Votes (prevent duplicate voting)
-- ============================================
CREATE TABLE IF NOT EXISTS review_helpful_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(review_id, user_email)
);

CREATE INDEX IF NOT EXISTS idx_review_votes_review ON review_helpful_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_user ON review_helpful_votes(user_email);

-- RLS
ALTER TABLE review_helpful_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role access for review_helpful_votes" ON review_helpful_votes;
CREATE POLICY "Service role access for review_helpful_votes" ON review_helpful_votes
  FOR ALL USING (true) WITH CHECK (true);
