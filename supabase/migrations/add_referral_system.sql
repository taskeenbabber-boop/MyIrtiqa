-- ═══════════════════════════════════════════════════════════════
-- Referral System Upgrade: Dynamic codes, visitor tracking, discounts
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- 1. Create referral_codes table (dynamic, replaces hardcoded array)
CREATE TABLE IF NOT EXISTS symposium_referral_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('ambassador', 'collaborator')),
    institution TEXT DEFAULT '',
    discount_percent INTEGER DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
    discount_applies_to TEXT[] DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create referral_visits table (tracks page views from referral links)
CREATE TABLE IF NOT EXISTS symposium_referral_visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referral_code TEXT NOT NULL,
    visited_at TIMESTAMPTZ DEFAULT now(),
    page_path TEXT DEFAULT '/ai-symposium'
);

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON symposium_referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_active ON symposium_referral_codes(active);
CREATE INDEX IF NOT EXISTS idx_referral_visits_code ON symposium_referral_visits(referral_code);

-- 4. RLS policies — allow anonymous reads and inserts for visits
ALTER TABLE symposium_referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE symposium_referral_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active referral codes" ON symposium_referral_codes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage referral codes" ON symposium_referral_codes
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can insert referral visits" ON symposium_referral_visits
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can read referral visits" ON symposium_referral_visits
    FOR SELECT USING (true);

-- 5. Seed existing ambassador codes
INSERT INTO symposium_referral_codes (code, name, type, institution) VALUES
    ('AMB-shahsawar', 'Syed Shahsawar Ahmad Bacha', 'ambassador', 'Bacha Khan Medical College'),
    ('AMB-habibullah', 'Habib Ullah', 'ambassador', 'Saidu Medical College Swat'),
    ('AMB-tashfeen', 'Syed Tashfeen Mustafa Shah', 'ambassador', 'UCMD UOL Lahore'),
    ('AMB-ahtida', 'Ahtida Fatima', 'ambassador', 'Sheikh Zayed Medical College RYK'),
    ('AMB-romesa', 'Syeda Romesa Sana', 'ambassador', 'NWSM'),
    ('AMB-shumayel', 'Shumayel Ashraf', 'ambassador', 'NWSM'),
    ('AMB-abbas', 'Muhammad Abbas Jadoon', 'ambassador', 'PICO'),
    ('AMB-zakreya', 'Muhammad Zakreya', 'ambassador', 'Swat Medical College'),
    ('AMB-hira', 'Hira Rahim', 'ambassador', 'KGMC'),
    ('AMB-eman', 'Eman Afzal', 'ambassador', 'Islam Medical College Sialkot'),
    ('AMB-kashf', 'Kashf Younas', 'ambassador', 'Bakhtawar Amin Medical College'),
    ('AMB-abrar', 'Muhammad Abrar', 'ambassador', 'Northwest College of Nursing'),
    ('AMB-inzimam', 'Inzimam Ul Haq', 'ambassador', 'Guilin Medical University China'),
    ('AMB-sadeeq', 'Sadeeq Rahman', 'ambassador', 'Nowshera Medical College'),
    ('AMB-danyal', 'Danyal Khan', 'ambassador', 'Gomal Medical College'),
    ('AMB-hamza', 'Muhammad Hamza', 'ambassador', 'Gomal Medical College DI Khan'),
    ('AMB-abdullah', 'Muhammad Abdullah', 'ambassador', 'Allama Iqbal Medical College Lahore'),
    ('AMB-umaima', 'Umaima Yasir', 'ambassador', 'Rawalpindi Medical University'),
    ('AMB-ijaz', 'Ijaz Dawar', 'ambassador', 'Pak International Medical College'),
    ('AMB-habib', 'Habib Ur Rehman', 'ambassador', 'Khyber Medical College'),
    ('AMB-alishba', 'Alishba Sultan', 'ambassador', 'Rehman Medical College'),
    ('AMB-fahad', 'Fahad', 'ambassador', 'Khyber Medical College Peshawar'),
    ('AMB-eamil', 'Eamil Sarosh Malik', 'ambassador', 'SZABMU'),
    ('AMB-zuhaib', 'Zuhaib Hassan', 'ambassador', 'PIMC Peshawar'),
    ('AMB-sana', 'Sana Bint e Nazir', 'ambassador', 'Khyber Medical College Peshawar'),
    ('AMB-ahmed', 'Ahmed Nawaz', 'ambassador', 'FAST NUCES Peshawar'),
    ('AMB-khoula', 'Khoula Shifa', 'ambassador', 'Ameer Ud Din Medical College Lahore'),
    ('AMB-abuzar', 'Abuzar Farhad', 'ambassador', 'Northwest General Hospital'),
    ('AMB-athar', 'Muhammad Athar Rauf', 'ambassador', 'Allama Iqbal Medical College'),
    ('AMB-ifrah', 'Ifrah Nadeem', 'ambassador', 'Quaid e Azam Medical College'),
    ('AMB-sadia', 'Sadia Shafi', 'ambassador', 'LIHS Sahiwal'),
    ('AMB-haris', 'Muhammad Haris', 'ambassador', 'GCON KTH'),
    ('AMB-laiba', 'Laiba Akhlaq', 'ambassador', 'Khyber Girls Medical College'),
    ('AMB-shahan', 'Muhammad Shahan', 'ambassador', 'Kabir Medical College'),
    ('AMB-haseeb', 'Abdul Haseeb', 'ambassador', 'Loralai Medical College'),
    ('AMB-adeel', 'Syed Adeel Ahmad', 'ambassador', 'Nowshera Medical College'),
    ('AMB-azam', 'Mian Ahmed Azam', 'ambassador', 'Jinnah Medical College'),
    ('AMB-talha', 'Talha Rafiq', 'ambassador', 'Bacha Khan Medical College Mardan'),
    ('AMB-maryam', 'Maryam Ajmal', 'ambassador', 'Bahria University College of Medicine'),
    ('AMB-ahmadali', 'Ahmad Ali', 'ambassador', 'Peshawar Medical College'),
    ('AMB-aneika', 'Aneika', 'ambassador', 'Gomal Medical College'),
    ('AMB-haseebfareed', 'Muhammad Haseeb Fareed', 'ambassador', 'NUST School of Health Sciences'),
    ('AMB-hamzaarfi', 'Syed Hamza Hussain Arfi', 'ambassador', 'IM Sciences Peshawar'),
    ('AMB-hamad', 'Muhammad Hamad Khan', 'ambassador', 'Bacha Khan Medical College Mardan'),
    ('AMB-saifullah', 'Saif Ullah', 'ambassador', 'Nowshera Medical College'),
    ('AMB-armaghan', 'Ahmad Armaghan', 'ambassador', 'Bannu Medical College'),
    ('AMB-areeba', 'Areeba Tariq', 'ambassador', 'Khyber Girls Medical College Peshawar'),
    ('AMB-faria', 'Faria Ali', 'ambassador', 'MBBSMC AJK'),
    ('AMB-shafqat', 'Shafqat Shahzad Khanzada', 'ambassador', 'University of the Punjab Lahore'),
    ('AMB-zarak', 'Zarak Khan', 'ambassador', 'KMU'),
    ('AMB-moiz', 'Abdul Moiz', 'ambassador', 'LUMHS Jamshoro'),
    ('AMB-iqra', 'Iqra Karim', 'ambassador', 'Bannu Medical College'),
    ('AMB-ayesha', 'Ayesha Hussain', 'ambassador', 'Women Medical College Abbottabad'),
    ('AMB-zohaib', 'Mian Zohaib Ahmad', 'ambassador', 'NWSM'),
    ('AMB-uzma', 'Uzma Jamal', 'ambassador', 'SMBBMC Lyari Karachi'),
    ('AMB-hadeesa', 'Hadeesa Afridi', 'ambassador', 'PIMC Peshawar'),
    ('AMB-mohsin', 'Muhammad Mohsin', 'ambassador', 'Swat Medical College')
ON CONFLICT (code) DO NOTHING;

-- 6. Seed existing collaborator codes
INSERT INTO symposium_referral_codes (code, name, type, institution) VALUES
    ('COL-tmm', 'The Medical Mentors (TMM)', 'collaborator', ''),
    ('COL-irc', 'IRC', 'collaborator', ''),
    ('COL-ifmsa', 'IFMSA', 'collaborator', '')
ON CONFLICT (code) DO NOTHING;
