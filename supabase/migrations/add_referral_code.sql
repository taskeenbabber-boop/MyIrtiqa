-- Add referral_code column to all symposium tables for affiliate tracking
-- Run this in Supabase SQL Editor

-- Main registrations table
ALTER TABLE symposium_registrations 
ADD COLUMN IF NOT EXISTS referral_code TEXT DEFAULT NULL;

-- Pitch submissions
ALTER TABLE symposium_pitch_submissions 
ADD COLUMN IF NOT EXISTS referral_code TEXT DEFAULT NULL;

-- Poster submissions
ALTER TABLE symposium_poster_submissions 
ADD COLUMN IF NOT EXISTS referral_code TEXT DEFAULT NULL;

-- Quiz submissions
ALTER TABLE symposium_quiz_submissions 
ADD COLUMN IF NOT EXISTS referral_code TEXT DEFAULT NULL;

-- Drill submissions
ALTER TABLE symposium_drill_submissions 
ADD COLUMN IF NOT EXISTS referral_code TEXT DEFAULT NULL;

-- Debate submissions
ALTER TABLE symposium_debate_submissions 
ADD COLUMN IF NOT EXISTS referral_code TEXT DEFAULT NULL;

-- Meme submissions
ALTER TABLE symposium_meme_submissions 
ADD COLUMN IF NOT EXISTS referral_code TEXT DEFAULT NULL;

-- Create index for fast lookups on referral_code
CREATE INDEX IF NOT EXISTS idx_registrations_referral ON symposium_registrations(referral_code) WHERE referral_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pitch_referral ON symposium_pitch_submissions(referral_code) WHERE referral_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_poster_referral ON symposium_poster_submissions(referral_code) WHERE referral_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quiz_referral ON symposium_quiz_submissions(referral_code) WHERE referral_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_drill_referral ON symposium_drill_submissions(referral_code) WHERE referral_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_debate_referral ON symposium_debate_submissions(referral_code) WHERE referral_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_meme_referral ON symposium_meme_submissions(referral_code) WHERE referral_code IS NOT NULL;
