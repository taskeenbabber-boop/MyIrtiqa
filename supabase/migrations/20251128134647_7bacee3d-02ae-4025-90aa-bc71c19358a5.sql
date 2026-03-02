-- Update bank account details in site_settings
UPDATE site_settings 
SET value = jsonb_build_object(
  'bank_name', 'Habib Bank Limited',
  'account_title', 'ZAR WALI',
  'account_number', '16977900732303',
  'iban', 'PK46HABB0016977900732303',
  'branch', 'Tehkal Bala PSH'
)
WHERE key = 'bank_account_details';