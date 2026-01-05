# Notifications Implementation Plan

## Overview

This document outlines the implementation plan for wiring up the Notifications tab in the Settings page. Currently, the notification toggles exist in the UI but are not connected to any backend functionality.

## Current State

| Setting | UI Status | Backend Status |
|---------|-----------|----------------|
| Email when new appointment | Toggle exists | Not implemented |
| SMS when new appointment | Toggle exists | Not implementing (business decision) |
| Email when cancelled | Toggle exists | Not implemented |
| SMS when cancelled | Toggle exists | Not implementing (business decision) |
| Daily summary email | Toggle exists | Not implemented |
| SMS reminders to customers | Toggle exists | Not implemented |
| Feedback texts to customers | Toggle exists | Deferred (needs design) |

## Technology Decisions

- **Email Provider**: Resend
- **Scheduler**: External cron service (cron-job.org) for reliability
- **SMS Provider**: Twilio (already configured)

## Implementation Phases

### Phase 1: Foundation

#### 1.1 Add Notification Settings to Database
- Add `notification_settings` JSON column to `tenants` table
- Default settings structure:
```json
{
  "emailNewAppointment": true,
  "emailCancellation": true,
  "emailDailyDigest": true,
  "smsReminderEnabled": true,
  "smsReminderHours": 24
}
```

#### 1.2 Create API Endpoints
- `GET /api/tenant/notifications` - Retrieve notification preferences
- `PATCH /api/tenant/notifications` - Update notification preferences

#### 1.3 Wire Frontend
- Update `SettingsPage.vue` to load preferences on mount
- Update `saveNotifications()` to call the API
- Hide/disable SMS-to-owner toggles (not implementing)

#### 1.4 Set Up Resend Email Service
- Install Resend SDK: `npm install resend`
- Create `src/services/email.service.js`
- Add `RESEND_API_KEY` environment variable
- Create email templates for each notification type

### Phase 2: Appointment Notifications (Business Owner)

#### 2.1 Email on New Appointment
- Create email template for new appointment notification
- Hook into `appointment.service.js` `createAppointment()` function
- Check tenant's `emailNewAppointment` preference before sending
- Include: customer name, service, employee, date/time, duration

#### 2.2 Email on Appointment Cancellation
- Create email template for cancellation notification
- Hook into `appointment.service.js` `cancelAppointment()` function
- Check tenant's `emailCancellation` preference before sending
- Include: customer name, service, original date/time, cancellation reason

### Phase 3: Scheduled Notifications

#### 3.1 Daily Digest Email
- Create digest email template showing:
  - Appointments scheduled for today
  - Appointments scheduled for tomorrow
  - Summary stats (total appointments, revenue)
- Create endpoint `POST /api/cron/daily-digest` (secured with cron secret)
- Set up external cron to trigger at 7:00 AM daily (configurable)
- Check tenant's `emailDailyDigest` preference before sending

#### 3.2 SMS Reminders to Customers (24 hours before)
- Create reminder message template
- Create endpoint `POST /api/cron/appointment-reminders` (secured with cron secret)
- Query appointments starting in next 24-25 hours that haven't been reminded
- Add `reminder_sent_at` column to appointments table
- Send SMS via Twilio to customer phone
- Respect customer SMS opt-in preferences

### Phase 4: Future Enhancement (Deferred)

#### 4.1 Customer Feedback Texts
- **Status**: Deferred - needs design discussion
- Questions to resolve:
  - What questions to ask?
  - How to capture responses (reply parsing vs link to form)?
  - Where to store feedback?
  - Integration with reviews/ratings system?

## Database Migrations Required

1. Add `notification_settings` column to `tenants` table
2. Add `reminder_sent_at` column to `appointments` table

## Environment Variables Required

```
RESEND_API_KEY=re_xxxxxxxxxxxx
CRON_SECRET=<random-secret-for-cron-endpoints>
```

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tenant/notifications` | Get notification preferences |
| PATCH | `/api/tenant/notifications` | Update notification preferences |
| POST | `/api/cron/daily-digest` | Trigger daily digest (cron only) |
| POST | `/api/cron/appointment-reminders` | Trigger reminders (cron only) |

## External Cron Jobs (cron-job.org)

| Job | Schedule | Endpoint |
|-----|----------|----------|
| Daily Digest | `0 7 * * *` (7 AM daily) | `POST /api/cron/daily-digest` |
| Appointment Reminders | `0 * * * *` (every hour) | `POST /api/cron/appointment-reminders` |

## GitHub Issues

Each phase will be tracked as a separate GitHub issue for PR review:

1. **Issue #1**: Add notification settings to tenant model and API
2. **Issue #2**: Set up Resend email service
3. **Issue #3**: Wire frontend notification preferences
4. **Issue #4**: Email notification on new appointment
5. **Issue #5**: Email notification on cancellation
6. **Issue #6**: Daily digest email with cron job
7. **Issue #7**: SMS reminders to customers (24h before)

## Estimated Effort

| Phase | Tasks | Complexity |
|-------|-------|------------|
| Phase 1 | Foundation | Medium |
| Phase 2 | Appointment Notifications | Low-Medium |
| Phase 3 | Scheduled Jobs | Medium-High |
| **Total** | 7 issues | ~2-3 days |

## Success Criteria

- [ ] Notification preferences persist across sessions
- [ ] Business owner receives email when appointment is booked
- [ ] Business owner receives email when appointment is cancelled
- [ ] Business owner receives daily digest email at configured time
- [ ] Customers receive SMS reminder 24 hours before appointment
- [ ] All notifications respect user preferences (can be toggled off)
