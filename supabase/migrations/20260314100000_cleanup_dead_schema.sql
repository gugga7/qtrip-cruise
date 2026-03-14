-- Clean up unused legacy tables
-- bookings: superseded by trips table
-- schedules: was a child of bookings, also unused
-- quote_requests: app writes to trips directly, never used

DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS quote_requests CASCADE;
