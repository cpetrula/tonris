-- =============================================================================
-- TONRIS Seed Data for Demo Salon: "Hair Done Right Salon"
-- MySQL Database Seed Script
-- =============================================================================

USE tonris_db;

-- =============================================================================
-- Define Variables for UUIDs (for referential integrity)
-- =============================================================================
SET @tenant_uuid = UUID();
SET @tenant_id = 'hair-done-right-salon';
SET @user_uuid = UUID();

-- Employee UUIDs
SET @employee1_uuid = UUID();
SET @employee2_uuid = UUID();
SET @employee3_uuid = UUID();
SET @employee4_uuid = UUID();

-- Service UUIDs
SET @service_haircut_uuid = UUID();
SET @service_coloring_uuid = UUID();
SET @service_blowout_uuid = UUID();
SET @service_highlights_uuid = UUID();
SET @service_treatment_uuid = UUID();
SET @service_styling_uuid = UUID();
SET @service_manicure_uuid = UUID();
SET @service_pedicure_uuid = UUID();

-- =============================================================================
-- Seed: Tenant - Hair Done Right Salon
-- =============================================================================
INSERT INTO tenants (
    id,
    tenant_id,
    name,
    slug,
    status,
    plan_type,
    settings,
    contact_email,
    contact_phone,
    address,
    metadata,
    trial_ends_at,
    onboarding_completed_at,
    twilio_phone_number,
    createdAt,
    updatedAt
) VALUES (
    @tenant_uuid,
    @tenant_id,
    'Hair Done Right Salon',
    'hair-done-right-salon',
    'active',
    'professional',
    JSON_OBJECT(
        'timezone', 'America/New_York',
        'language', 'en',
        'dateFormat', 'YYYY-MM-DD',
        'timeFormat', '12h',
        'currency', 'USD',
        'notifications', JSON_OBJECT(
            'email', true,
            'sms', true,
            'push', true
        ),
        'businessHours', JSON_OBJECT(
            'monday', JSON_OBJECT('open', '09:00', 'close', '19:00', 'enabled', true),
            'tuesday', JSON_OBJECT('open', '09:00', 'close', '19:00', 'enabled', true),
            'wednesday', JSON_OBJECT('open', '09:00', 'close', '19:00', 'enabled', true),
            'thursday', JSON_OBJECT('open', '09:00', 'close', '20:00', 'enabled', true),
            'friday', JSON_OBJECT('open', '09:00', 'close', '20:00', 'enabled', true),
            'saturday', JSON_OBJECT('open', '09:00', 'close', '17:00', 'enabled', true),
            'sunday', JSON_OBJECT('open', '10:00', 'close', '15:00', 'enabled', false)
        )
    ),
    'contact@hairdonerightson.com',
    '+15551234567',
    JSON_OBJECT(
        'street', '123 Main Street',
        'city', 'New York',
        'state', 'NY',
        'zipCode', '10001',
        'country', 'USA'
    ),
    JSON_OBJECT(
        'website', 'https://www.hairdonerightson.com',
        'socialMedia', JSON_OBJECT(
            'instagram', '@hairdonerightnyc',
            'facebook', 'HairDoneRightSalon'
        )
    ),
    DATE_ADD(NOW(), INTERVAL 30 DAY),
    NOW(),
    '+15551234567',
    NOW(),
    NOW()
);

-- =============================================================================
-- Seed: User (Admin user for the demo salon)
-- Password is 'Demo123!' (hashed with bcrypt, 10 rounds)
-- =============================================================================
INSERT INTO users (
    id,
    email,
    password,
    tenant_id,
    two_factor_secret,
    two_factor_enabled,
    is_active,
    createdAt,
    updatedAt
) VALUES (
    @user_uuid,
    'admin@hairdonerightson.com',
    '$2b$10$cuxtDMGAPnYN595um0PtauSaGMXy9SQIHIhMqAHrUYcwjAGEiPZXi',
    @tenant_id,
    NULL,
    0,
    1,
    NOW(),
    NOW()
);

-- =============================================================================
-- Seed: Employees
-- =============================================================================
INSERT INTO employees (
    id,
    tenant_id,
    first_name,
    last_name,
    email,
    phone,
    employee_type,
    status,
    hire_date,
    schedule,
    service_ids,
    metadata,
    createdAt,
    updatedAt
) VALUES
-- Employee 1: Senior Stylist
(
    @employee1_uuid,
    @tenant_id,
    'Sarah',
    'Johnson',
    'sarah.johnson@hairdonerightson.com',
    '+15559876543',
    'employee',
    'active',
    '2020-03-15',
    JSON_OBJECT(
        'monday', JSON_OBJECT('start', '09:00', 'end', '17:00', 'enabled', true),
        'tuesday', JSON_OBJECT('start', '09:00', 'end', '17:00', 'enabled', true),
        'wednesday', JSON_OBJECT('start', '09:00', 'end', '17:00', 'enabled', true),
        'thursday', JSON_OBJECT('start', '11:00', 'end', '19:00', 'enabled', true),
        'friday', JSON_OBJECT('start', '11:00', 'end', '19:00', 'enabled', true),
        'saturday', JSON_OBJECT('start', '09:00', 'end', '15:00', 'enabled', true),
        'sunday', JSON_OBJECT('start', '10:00', 'end', '14:00', 'enabled', false)
    ),
    JSON_ARRAY(),
    JSON_OBJECT('specialty', 'Color Specialist', 'level', 'Senior'),
    NOW(),
    NOW()
),
-- Employee 2: Stylist
(
    @employee2_uuid,
    @tenant_id,
    'Michael',
    'Chen',
    'michael.chen@hairdonerightson.com',
    '+15558765432',
    'employee',
    'active',
    '2021-06-01',
    JSON_OBJECT(
        'monday', JSON_OBJECT('start', '10:00', 'end', '18:00', 'enabled', true),
        'tuesday', JSON_OBJECT('start', '10:00', 'end', '18:00', 'enabled', true),
        'wednesday', JSON_OBJECT('start', '10:00', 'end', '18:00', 'enabled', false),
        'thursday', JSON_OBJECT('start', '10:00', 'end', '18:00', 'enabled', true),
        'friday', JSON_OBJECT('start', '10:00', 'end', '18:00', 'enabled', true),
        'saturday', JSON_OBJECT('start', '09:00', 'end', '17:00', 'enabled', true),
        'sunday', JSON_OBJECT('start', '10:00', 'end', '14:00', 'enabled', false)
    ),
    JSON_ARRAY(),
    JSON_OBJECT('specialty', 'Precision Cuts', 'level', 'Mid'),
    NOW(),
    NOW()
),
-- Employee 3: Junior Stylist
(
    @employee3_uuid,
    @tenant_id,
    'Emily',
    'Rodriguez',
    'emily.rodriguez@hairdonerightson.com',
    '+15557654321',
    'employee',
    'active',
    '2023-01-10',
    JSON_OBJECT(
        'monday', JSON_OBJECT('start', '09:00', 'end', '17:00', 'enabled', true),
        'tuesday', JSON_OBJECT('start', '09:00', 'end', '17:00', 'enabled', true),
        'wednesday', JSON_OBJECT('start', '09:00', 'end', '17:00', 'enabled', true),
        'thursday', JSON_OBJECT('start', '09:00', 'end', '17:00', 'enabled', true),
        'friday', JSON_OBJECT('start', '09:00', 'end', '17:00', 'enabled', false),
        'saturday', JSON_OBJECT('start', '09:00', 'end', '15:00', 'enabled', true),
        'sunday', JSON_OBJECT('start', '10:00', 'end', '14:00', 'enabled', false)
    ),
    JSON_ARRAY(),
    JSON_OBJECT('specialty', 'Blowouts & Styling', 'level', 'Junior'),
    NOW(),
    NOW()
),
-- Employee 4: Nail Technician (Contractor)
(
    @employee4_uuid,
    @tenant_id,
    'Jessica',
    'Williams',
    'jessica.williams@hairdonerightson.com',
    '+15556543210',
    'contractor',
    'active',
    '2022-09-01',
    JSON_OBJECT(
        'monday', JSON_OBJECT('start', '10:00', 'end', '16:00', 'enabled', false),
        'tuesday', JSON_OBJECT('start', '10:00', 'end', '16:00', 'enabled', true),
        'wednesday', JSON_OBJECT('start', '10:00', 'end', '16:00', 'enabled', true),
        'thursday', JSON_OBJECT('start', '10:00', 'end', '16:00', 'enabled', true),
        'friday', JSON_OBJECT('start', '10:00', 'end', '18:00', 'enabled', true),
        'saturday', JSON_OBJECT('start', '09:00', 'end', '17:00', 'enabled', true),
        'sunday', JSON_OBJECT('start', '10:00', 'end', '14:00', 'enabled', false)
    ),
    JSON_ARRAY(),
    JSON_OBJECT('specialty', 'Nail Art', 'level', 'Mid'),
    NOW(),
    NOW()
);

-- =============================================================================
-- Seed: Services
-- =============================================================================
INSERT INTO services (
    id,
    tenant_id,
    name,
    description,
    category,
    duration,
    price,
    status,
    add_ons,
    metadata,
    createdAt,
    updatedAt
) VALUES
-- Hair Services
(
    @service_haircut_uuid,
    @tenant_uuid,
    'Haircut',
    'Professional haircut including consultation, shampoo, cut, and style. Our expert stylists will work with you to create the perfect look.',
    'hair',
    45,
    55.00,
    'active',
    JSON_ARRAY(
        JSON_OBJECT('id', UUID(), 'name', 'Beard Trim', 'price', 15.00, 'duration', 10),
        JSON_OBJECT('id', UUID(), 'name', 'Scalp Massage', 'price', 10.00, 'duration', 10),
        JSON_OBJECT('id', UUID(), 'name', 'Hot Towel Treatment', 'price', 8.00, 'duration', 5)
    ),
    JSON_OBJECT('popular', true),
    NOW(),
    NOW()
),
(
    @service_coloring_uuid,
    @tenant_uuid,
    'Full Hair Coloring',
    'Complete hair coloring service including consultation, application, processing, and styling. Transform your look with vibrant, long-lasting color.',
    'hair',
    120,
    125.00,
    'active',
    JSON_ARRAY(
        JSON_OBJECT('id', UUID(), 'name', 'Toner Application', 'price', 25.00, 'duration', 15),
        JSON_OBJECT('id', UUID(), 'name', 'Deep Conditioning Treatment', 'price', 30.00, 'duration', 20),
        JSON_OBJECT('id', UUID(), 'name', 'Root Touch-Up', 'price', 45.00, 'duration', 30)
    ),
    JSON_OBJECT('popular', true, 'requiresConsultation', true),
    NOW(),
    NOW()
),
(
    @service_blowout_uuid,
    @tenant_uuid,
    'Blowout',
    'Professional blowout service including shampoo, conditioning, and styled blow dry for a polished finish.',
    'hair',
    35,
    45.00,
    'active',
    JSON_ARRAY(
        JSON_OBJECT('id', UUID(), 'name', 'Flat Iron Styling', 'price', 15.00, 'duration', 15),
        JSON_OBJECT('id', UUID(), 'name', 'Curling Iron Styling', 'price', 15.00, 'duration', 15),
        JSON_OBJECT('id', UUID(), 'name', 'Volume Boost Treatment', 'price', 12.00, 'duration', 10)
    ),
    NULL,
    NOW(),
    NOW()
),
(
    @service_highlights_uuid,
    @tenant_uuid,
    'Highlights',
    'Partial or full highlights to add dimension and brightness to your hair. Includes consultation and toner.',
    'hair',
    150,
    175.00,
    'active',
    JSON_ARRAY(
        JSON_OBJECT('id', UUID(), 'name', 'Lowlights', 'price', 40.00, 'duration', 30),
        JSON_OBJECT('id', UUID(), 'name', 'Balayage Upgrade', 'price', 50.00, 'duration', 30),
        JSON_OBJECT('id', UUID(), 'name', 'Gloss Treatment', 'price', 35.00, 'duration', 20)
    ),
    JSON_OBJECT('requiresConsultation', true),
    NOW(),
    NOW()
),
(
    @service_treatment_uuid,
    @tenant_uuid,
    'Deep Conditioning Treatment',
    'Intensive hair treatment to restore moisture, repair damage, and add shine. Perfect for dry or damaged hair.',
    'hair',
    45,
    65.00,
    'active',
    JSON_ARRAY(
        JSON_OBJECT('id', UUID(), 'name', 'Keratin Boost', 'price', 25.00, 'duration', 15),
        JSON_OBJECT('id', UUID(), 'name', 'Protein Treatment', 'price', 20.00, 'duration', 10),
        JSON_OBJECT('id', UUID(), 'name', 'Scalp Detox', 'price', 30.00, 'duration', 20)
    ),
    NULL,
    NOW(),
    NOW()
),
(
    @service_styling_uuid,
    @tenant_uuid,
    'Special Occasion Styling',
    'Elegant updo or formal styling for weddings, proms, galas, and special events. Includes consultation.',
    'hair',
    90,
    95.00,
    'active',
    JSON_ARRAY(
        JSON_OBJECT('id', UUID(), 'name', 'Hair Extensions', 'price', 75.00, 'duration', 45),
        JSON_OBJECT('id', UUID(), 'name', 'Hair Accessories', 'price', 15.00, 'duration', 5),
        JSON_OBJECT('id', UUID(), 'name', 'Trial Run', 'price', 50.00, 'duration', 60)
    ),
    JSON_OBJECT('requiresConsultation', true, 'advanceBookingRequired', true),
    NOW(),
    NOW()
),
-- Nail Services
(
    @service_manicure_uuid,
    @tenant_uuid,
    'Classic Manicure',
    'Complete manicure service including nail shaping, cuticle care, hand massage, and polish application.',
    'nails',
    30,
    35.00,
    'active',
    JSON_ARRAY(
        JSON_OBJECT('id', UUID(), 'name', 'Gel Polish', 'price', 15.00, 'duration', 10),
        JSON_OBJECT('id', UUID(), 'name', 'Nail Art (per nail)', 'price', 5.00, 'duration', 5),
        JSON_OBJECT('id', UUID(), 'name', 'Paraffin Treatment', 'price', 12.00, 'duration', 10),
        JSON_OBJECT('id', UUID(), 'name', 'French Tips', 'price', 10.00, 'duration', 10)
    ),
    NULL,
    NOW(),
    NOW()
),
(
    @service_pedicure_uuid,
    @tenant_uuid,
    'Spa Pedicure',
    'Luxurious pedicure including foot soak, exfoliation, callus removal, massage, and polish application.',
    'nails',
    50,
    55.00,
    'active',
    JSON_ARRAY(
        JSON_OBJECT('id', UUID(), 'name', 'Gel Polish', 'price', 15.00, 'duration', 10),
        JSON_OBJECT('id', UUID(), 'name', 'Extended Massage', 'price', 15.00, 'duration', 15),
        JSON_OBJECT('id', UUID(), 'name', 'Hot Stone Treatment', 'price', 20.00, 'duration', 15),
        JSON_OBJECT('id', UUID(), 'name', 'French Tips', 'price', 10.00, 'duration', 10)
    ),
    JSON_OBJECT('popular', true),
    NOW(),
    NOW()
);

-- =============================================================================
-- Update employees with their service IDs
-- =============================================================================
UPDATE employees SET service_ids = JSON_ARRAY(
    @service_haircut_uuid,
    @service_coloring_uuid,
    @service_blowout_uuid,
    @service_highlights_uuid,
    @service_treatment_uuid,
    @service_styling_uuid
) WHERE id = @employee1_uuid;

UPDATE employees SET service_ids = JSON_ARRAY(
    @service_haircut_uuid,
    @service_blowout_uuid,
    @service_treatment_uuid
) WHERE id = @employee2_uuid;

UPDATE employees SET service_ids = JSON_ARRAY(
    @service_haircut_uuid,
    @service_blowout_uuid,
    @service_treatment_uuid,
    @service_styling_uuid
) WHERE id = @employee3_uuid;

UPDATE employees SET service_ids = JSON_ARRAY(
    @service_manicure_uuid,
    @service_pedicure_uuid
) WHERE id = @employee4_uuid;

-- =============================================================================
-- Seed: Subscription (Active subscription for the demo salon)
-- =============================================================================
INSERT INTO subscriptions (
    id,
    tenant_id,
    stripe_customer_id,
    stripe_subscription_id,
    stripe_price_id,
    status,
    billing_interval,
    current_period_start,
    current_period_end,
    cancel_at_period_end,
    canceled_at,
    trial_start,
    trial_end,
    metadata,
    createdAt,
    updatedAt
) VALUES (
    UUID(),
    @tenant_id,
    'cus_demo_hair_done_right',
    'sub_demo_hair_done_right',
    'price_monthly_professional',
    'active',
    'month',
    DATE_SUB(NOW(), INTERVAL 15 DAY),
    DATE_ADD(NOW(), INTERVAL 15 DAY),
    0,
    NULL,
    NULL,
    NULL,
    JSON_OBJECT('demo', true),
    NOW(),
    NOW()
);

-- =============================================================================
-- Seed: Sample Appointments (upcoming and past)
-- =============================================================================
INSERT INTO appointments (
    id,
    tenant_id,
    employee_id,
    service_id,
    customer_name,
    customer_email,
    customer_phone,
    start_time,
    end_time,
    status,
    add_ons,
    notes,
    total_price,
    total_duration,
    cancellation_reason,
    cancellation_notes,
    cancelled_at,
    metadata,
    createdAt,
    updatedAt
) VALUES
-- Upcoming appointment 1: Tomorrow
(
    UUID(),
    @tenant_id,
    @employee1_uuid,
    @service_haircut_uuid,
    'Jennifer Martinez',
    'jennifer.martinez@email.com',
    '+15551112222',
    DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 10 HOUR,
    DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 10 HOUR + INTERVAL 45 MINUTE,
    'confirmed',
    JSON_ARRAY(),
    'Regular client, prefers layers',
    55.00,
    45,
    NULL,
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW()
),
-- Upcoming appointment 2: Tomorrow afternoon
(
    UUID(),
    @tenant_id,
    @employee1_uuid,
    @service_coloring_uuid,
    'Amanda Thompson',
    'amanda.t@email.com',
    '+15552223333',
    DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 14 HOUR,
    DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 14 HOUR + INTERVAL 120 MINUTE,
    'scheduled',
    JSON_ARRAY(),
    'First time coloring - wants to go auburn',
    125.00,
    120,
    NULL,
    NULL,
    NULL,
    JSON_OBJECT('newClient', true),
    NOW(),
    NOW()
),
-- Upcoming appointment 3: Day after tomorrow
(
    UUID(),
    @tenant_id,
    @employee2_uuid,
    @service_haircut_uuid,
    'David Wilson',
    'david.wilson@email.com',
    '+15553334444',
    DATE_ADD(CURDATE(), INTERVAL 2 DAY) + INTERVAL 11 HOUR,
    DATE_ADD(CURDATE(), INTERVAL 2 DAY) + INTERVAL 11 HOUR + INTERVAL 55 MINUTE,
    'scheduled',
    JSON_ARRAY(),
    'Beard trim included',
    70.00,
    55,
    NULL,
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW()
),
-- Upcoming appointment 4: Three days out
(
    UUID(),
    @tenant_id,
    @employee4_uuid,
    @service_manicure_uuid,
    'Lisa Chang',
    'lisa.chang@email.com',
    '+15554445555',
    DATE_ADD(CURDATE(), INTERVAL 3 DAY) + INTERVAL 13 HOUR,
    DATE_ADD(CURDATE(), INTERVAL 3 DAY) + INTERVAL 13 HOUR + INTERVAL 40 MINUTE,
    'scheduled',
    JSON_ARRAY(),
    'Gel polish - pink color',
    50.00,
    40,
    NULL,
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW()
),
-- Upcoming appointment 5: This week
(
    UUID(),
    @tenant_id,
    @employee3_uuid,
    @service_blowout_uuid,
    'Rachel Green',
    'rachel.green@email.com',
    '+15555556666',
    DATE_ADD(CURDATE(), INTERVAL 4 DAY) + INTERVAL 16 HOUR,
    DATE_ADD(CURDATE(), INTERVAL 4 DAY) + INTERVAL 16 HOUR + INTERVAL 35 MINUTE,
    'scheduled',
    JSON_ARRAY(),
    'Has a dinner event',
    45.00,
    35,
    NULL,
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW()
),
-- Upcoming appointment 6: Special occasion
(
    UUID(),
    @tenant_id,
    @employee1_uuid,
    @service_styling_uuid,
    'Michelle Davis',
    'michelle.davis@email.com',
    '+15556667777',
    DATE_ADD(CURDATE(), INTERVAL 7 DAY) + INTERVAL 9 HOUR,
    DATE_ADD(CURDATE(), INTERVAL 7 DAY) + INTERVAL 9 HOUR + INTERVAL 90 MINUTE,
    'confirmed',
    JSON_ARRAY(),
    'Wedding guest - wants elegant updo',
    95.00,
    90,
    NULL,
    NULL,
    NULL,
    JSON_OBJECT('eventType', 'wedding'),
    NOW(),
    NOW()
),
-- Past appointment 1: Completed yesterday
(
    UUID(),
    @tenant_id,
    @employee2_uuid,
    @service_haircut_uuid,
    'Robert Brown',
    'robert.brown@email.com',
    '+15557778888',
    DATE_SUB(CURDATE(), INTERVAL 1 DAY) + INTERVAL 10 HOUR,
    DATE_SUB(CURDATE(), INTERVAL 1 DAY) + INTERVAL 10 HOUR + INTERVAL 45 MINUTE,
    'completed',
    JSON_ARRAY(),
    NULL,
    55.00,
    45,
    NULL,
    NULL,
    NULL,
    NULL,
    DATE_SUB(NOW(), INTERVAL 2 DAY),
    DATE_SUB(NOW(), INTERVAL 1 DAY)
),
-- Past appointment 2: Completed last week
(
    UUID(),
    @tenant_id,
    @employee1_uuid,
    @service_highlights_uuid,
    'Sophia Anderson',
    'sophia.anderson@email.com',
    '+15558889999',
    DATE_SUB(CURDATE(), INTERVAL 5 DAY) + INTERVAL 13 HOUR,
    DATE_SUB(CURDATE(), INTERVAL 5 DAY) + INTERVAL 13 HOUR + INTERVAL 150 MINUTE,
    'completed',
    JSON_ARRAY(),
    'Full highlights - turned out great!',
    175.00,
    150,
    NULL,
    NULL,
    NULL,
    NULL,
    DATE_SUB(NOW(), INTERVAL 7 DAY),
    DATE_SUB(NOW(), INTERVAL 5 DAY)
),
-- Past appointment 3: Cancelled
(
    UUID(),
    @tenant_id,
    @employee3_uuid,
    @service_blowout_uuid,
    'Emma White',
    'emma.white@email.com',
    '+15559990000',
    DATE_SUB(CURDATE(), INTERVAL 3 DAY) + INTERVAL 15 HOUR,
    DATE_SUB(CURDATE(), INTERVAL 3 DAY) + INTERVAL 15 HOUR + INTERVAL 35 MINUTE,
    'cancelled',
    JSON_ARRAY(),
    NULL,
    45.00,
    35,
    'customer_request',
    'Customer had a schedule conflict',
    DATE_SUB(NOW(), INTERVAL 4 DAY),
    NULL,
    DATE_SUB(NOW(), INTERVAL 5 DAY),
    DATE_SUB(NOW(), INTERVAL 4 DAY)
),
-- Past appointment 4: No show
(
    UUID(),
    @tenant_id,
    @employee4_uuid,
    @service_pedicure_uuid,
    'Olivia Taylor',
    'olivia.taylor@email.com',
    '+15550001111',
    DATE_SUB(CURDATE(), INTERVAL 2 DAY) + INTERVAL 11 HOUR,
    DATE_SUB(CURDATE(), INTERVAL 2 DAY) + INTERVAL 11 HOUR + INTERVAL 50 MINUTE,
    'no_show',
    JSON_ARRAY(),
    NULL,
    55.00,
    50,
    'no_show',
    'Customer did not arrive, no call',
    DATE_SUB(NOW(), INTERVAL 2 DAY),
    NULL,
    DATE_SUB(NOW(), INTERVAL 3 DAY),
    DATE_SUB(NOW(), INTERVAL 2 DAY)
);

-- =============================================================================
-- Seed: Sample Call Logs
-- =============================================================================
INSERT INTO call_logs (
    id,
    tenant_id,
    twilio_call_sid,
    direction,
    status,
    from_number,
    to_number,
    duration,
    started_at,
    ended_at,
    recording_url,
    transcription,
    metadata,
    createdAt,
    updatedAt
) VALUES
-- Inbound call 1: Appointment booking
(
    UUID(),
    @tenant_id,
    CONCAT('CA', REPLACE(UUID(), '-', '')),
    'inbound',
    'completed',
    '+15551112222',
    '+15551234567',
    245,
    DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 9 HOUR,
    DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 9 HOUR + INTERVAL 4 MINUTE + INTERVAL 5 SECOND,
    NULL,
    'Customer called to book a haircut appointment for tomorrow at 10am.',
    JSON_OBJECT('intent', 'booking', 'outcome', 'appointment_created'),
    DATE_SUB(NOW(), INTERVAL 1 DAY),
    DATE_SUB(NOW(), INTERVAL 1 DAY)
),
-- Inbound call 2: Service inquiry
(
    UUID(),
    @tenant_id,
    CONCAT('CA', REPLACE(UUID(), '-', '')),
    'inbound',
    'completed',
    '+15552223333',
    '+15551234567',
    180,
    DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 14 HOUR,
    DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 14 HOUR + INTERVAL 3 MINUTE,
    NULL,
    'Customer inquired about hair coloring services and pricing.',
    JSON_OBJECT('intent', 'inquiry', 'outcome', 'information_provided'),
    DATE_SUB(NOW(), INTERVAL 2 DAY),
    DATE_SUB(NOW(), INTERVAL 2 DAY)
),
-- Outbound call 1: Appointment reminder
(
    UUID(),
    @tenant_id,
    CONCAT('CA', REPLACE(UUID(), '-', '')),
    'outbound',
    'completed',
    '+15551234567',
    '+15553334444',
    65,
    DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 10 HOUR,
    DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 10 HOUR + INTERVAL 1 MINUTE + INTERVAL 5 SECOND,
    NULL,
    'Reminder call for tomorrow appointment.',
    JSON_OBJECT('type', 'reminder', 'appointmentId', 'sample'),
    DATE_SUB(NOW(), INTERVAL 1 DAY),
    DATE_SUB(NOW(), INTERVAL 1 DAY)
),
-- Inbound call 3: Cancellation
(
    UUID(),
    @tenant_id,
    CONCAT('CA', REPLACE(UUID(), '-', '')),
    'inbound',
    'completed',
    '+15559990000',
    '+15551234567',
    120,
    DATE_SUB(NOW(), INTERVAL 4 DAY) + INTERVAL 11 HOUR,
    DATE_SUB(NOW(), INTERVAL 4 DAY) + INTERVAL 11 HOUR + INTERVAL 2 MINUTE,
    NULL,
    'Customer called to cancel appointment due to schedule conflict.',
    JSON_OBJECT('intent', 'cancellation', 'outcome', 'appointment_cancelled'),
    DATE_SUB(NOW(), INTERVAL 4 DAY),
    DATE_SUB(NOW(), INTERVAL 4 DAY)
),
-- Inbound call 4: Business hours inquiry
(
    UUID(),
    @tenant_id,
    CONCAT('CA', REPLACE(UUID(), '-', '')),
    'inbound',
    'completed',
    '+15554445555',
    '+15551234567',
    45,
    DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 18 HOUR,
    DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 18 HOUR + INTERVAL 45 SECOND,
    NULL,
    'Customer asked about Saturday business hours.',
    JSON_OBJECT('intent', 'hours_inquiry', 'outcome', 'information_provided'),
    DATE_SUB(NOW(), INTERVAL 3 DAY),
    DATE_SUB(NOW(), INTERVAL 3 DAY)
);

-- =============================================================================
-- Summary Output
-- =============================================================================
SELECT 'Hair Done Right Salon demo data seeded successfully!' AS Status;
SELECT 'Tenant ID:' AS Info, @tenant_id AS Value;
SELECT 'Tenant UUID:' AS Info, @tenant_uuid AS Value;
SELECT 'Admin Email:' AS Info, 'admin@hairdonerightson.com' AS Value;
SELECT 'Total Employees:' AS Info, (SELECT COUNT(*) FROM employees WHERE tenant_id = @tenant_id) AS Value;
SELECT 'Total Services:' AS Info, (SELECT COUNT(*) FROM services WHERE tenant_id = @tenant_uuid) AS Value;
SELECT 'Total Appointments:' AS Info, (SELECT COUNT(*) FROM appointments WHERE tenant_id = @tenant_id) AS Value;
SELECT 'Total Call Logs:' AS Info, (SELECT COUNT(*) FROM call_logs WHERE tenant_id = @tenant_id) AS Value;
