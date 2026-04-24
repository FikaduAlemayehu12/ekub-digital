# Digital Ekub Platform Ethiopia

Amharic-first, bilingual Digital Ekub platform prototype built in the Lovable stack with a production-minded architecture for Ethiopian savings groups.

## What is included

- **Bilingual UI** with Amharic default and English toggle
- **Mock OTP login** flow for rapid testing
- **Dashboard** with live-style metrics, risk indicators, and operational summaries
- **Create Ekub** flow with the core calculation engine:
  - `TargetPayout = Contribution × Cycles`
  - `Cycles = TargetPayout ÷ Contribution`
  - `Members = Cycles`
- **Join Ekub** discovery screen for open groups
- **Payments** experience with reminders, grace period, and late penalty concepts
- **Payout status** experience with private member visibility and admin oversight
- **Admin panel** for users, analytics, monitoring, and fraud-control concepts

## Cloud foundation already prepared

The backend foundation is already provisioned in Lovable Cloud with these core tables:

- `profiles`
- `user_roles`
- `ekubs`
- `memberships`
- `payments`
- `payout_schedules`

Security setup includes:

- row-level access control
- separate roles table for admin/user access
- automatic profile creation on signup
- payout privacy rules
- validation constraints for core Ekub calculations

## Current auth mode

This version uses a **mock OTP** interaction in the UI for demo and product design validation.

Example mock code:

- `246810`

This can later be replaced with a real phone authentication flow in Lovable Cloud.

## Product ideas represented in the interface

- transparent contribution tracking
- randomized unique payout order
- payout lock after start
- Maedot coverage with 30% maximum cap
- late payment detection
- grace period support
- penalty accumulation
- member risk scoring
- admin monitoring and fraud posture indicators

## Tech note

The requested Next.js + NestJS stack is not supported in this project runtime, so this implementation uses the Lovable-compatible stack:

- React + TypeScript + Tailwind CSS
- Lovable Cloud for auth, database, storage, and server-side extensibility

## Next recommended steps

1. Replace mock OTP with real phone auth
2. Connect live CRUD flows to Cloud data
3. Add seeded records for demo accounts and sample Ekubs
4. Implement payout generation automation
5. Add reminder jobs and payment reconciliation
6. Add audit logs and richer admin analytics
