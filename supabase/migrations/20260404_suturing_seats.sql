-- Migration: Add support for suturing workshop seat tracking
-- The symposium_registrations table already stores selected_workshops as a text array
-- This migration ensures the schema supports the new workshop IDs (ws-5a, ws-5b)

-- Create a view for easy seat count queries (optional but useful for admin)
CREATE OR REPLACE VIEW suturing_seat_counts AS
SELECT
  (SELECT COUNT(*) FROM symposium_registrations WHERE 'ws-5a' = ANY(selected_workshops) AND status != 'rejected') AS morning_count,
  (SELECT COUNT(*) FROM symposium_registrations WHERE 'ws-5b' = ANY(selected_workshops) AND status != 'rejected') AS afternoon_count,
  30 AS morning_limit,
  30 AS afternoon_limit;

-- Grant access to the view for anonymous/authenticated users
GRANT SELECT ON suturing_seat_counts TO anon;
GRANT SELECT ON suturing_seat_counts TO authenticated;
