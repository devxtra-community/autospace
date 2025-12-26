Auto space – High Level Architecture
1. Bird’s-Eye View
Auto space is a monorepo-based, multi-tenant parking marketplace & logistics system with four frontends talking to a single backend API, backed by a relational database and third-party integrations.

1.1 Logical Architecture Diagram
+---------------------------------------------------------------+
|                           Clients                             |
+---------------------------------------------------------------+
|  Customer Web  |  Manager Web  |  Valet Web  |  Admin Web     |
|  (Next.js)     |  (Next.js)    |  (Next.js)  |  (Next.js)     |
+----------------+---------------+-------------+----------------+
                 \               |            /
                  \              |           /
                   v             v          v
+---------------------------------------------------------------+
|                  Backend API (NestJS + GraphQL)               |
|  - Auth & RBAC (Admin/Manager/Valet/Customer)                 |
|  - Booking & Availability Module                              |
|  - Garage & Slot Management Module                            |
|  - Valet Workflow Module                                      |
|  - Admin & Verification Module                                |
|  - Shared Domain Services (pricing, time, geo)                |
+-------------------------+-------------------------------------+
                          |
                          v
+---------------------------------------------------------------+
|                        Data & Infra                           |
+---------------------------------------------------------------+
|  PostgreSQL (Prisma ORM)                                      |
|  - Users, Roles, Companies                                    |
|  - Garages, Slots, Bookings                                   |
|  - ValetAssignments, Verifications                            |
+---------------------------------------------------------------+
|  Redis / Cache (optional, for hot searches & sessions)        |
+---------------------------------------------------------------+
|  Message Queue (optional, for async jobs: email, SMS, logs)   |
+---------------------------------------------------------------+
|  Third-Party Integrations                                     |
|  - Mapbox (Maps, Geocoding, Directions API)                   |
|  - Payment Provider (Stripe/Razorpay etc.)                    |
|  - Email/SMS provider (OTP, passcodes, notifications)         |
+---------------------------------------------------------------+
Stylistically, all four web apps share the same visual design system:

Yellow/black color palette inspired by road & parking markings
No border radius anywhere – sharp, rectangular elements to mimic parking slots
Shared design tokens & components in a UI package inside the monorepo
2. Monorepo Structure
A typical monorepo layout for Auto space:

apps/
  customer-web/      # Customer-facing booking app (Next.js)
  manager-web/       # Garage & company management (Next.js)
  valet-web/         # Valet-facing assignment app (Next.js)
  admin-web/         # Admin console (Next.js)
  api/               # NestJS GraphQL backend

packages/
  ui/                # Shared yellow/black, no-radius components
  core-domain/       # Shared domain types, helpers (TS-only)
  config/            # ESLint, TS, Prettier, tailwind configs
  graphql-client/    # Generated GraphQL hooks & types for frontends

tools/
  scripts/           # DB migration scripts, seeders, utilities
  ci/                # CI/CD pipelines configuration
Why monorepo?

All four apps + backend share:

Types (e.g., Booking, Garage, Slot)
GraphQL schema & codegen
Design system
Easier refactors: one change to domain model propagates everywhere via TypeScript.

Consistent linting, testing, and build pipelines.

3. Frontend Architecture (4 Applications)
Each frontend is a Next.js app using:

NextAuth.js for authentication
React Query / Apollo Client (or similar) for data fetching against GraphQL
React Hook Form + Zod for complex input validation
Shared components from packages/ui
3.1 Customer Web App
Main responsibilities:

Authentication & onboarding of customers
Map-based search of garages and slots (with filtering)
Date-time, slot-type, and dimension filters
Optional valet selection and showing valet cost
Booking creation flow and payment
Showing active & past bookings, with 6-digit passcode
Key pages / flows:

Home / Map Search
Filter panel (vehicle type, dimensions, date & time)
Garage / slot detail page
Checkout: review + payment
Booking details with QR/passcode
3.2 Manager Web App
Main responsibilities:

Company creation & management
Garage creation & configuration (location, timings)
Slot configuration (type, dimensions, pricing)
Managing staff and valets
Viewing and managing bookings & check-in/check-out
Key interfaces:

Company dashboard
Garage list & detail
Slot planner (like a layout table/grid)
Booking queue for each garage
Valet assignment overview
3.3 Valet Web App
Main responsibilities:

List of assigned valet jobs
Job detail with pickup/drop addresses
One-tap status changes: ASSIGNED → PICKUP_IN_PROGRESS → AT_GARAGE → RETURN_IN_PROGRESS → COMPLETED
Map directions launch via Mapbox or deep links
Key interfaces:

“My jobs” list
Job detail view with map and CTA buttons
3.4 Admin Web App
Main responsibilities:

Managing users & roles (promoting to Manager, Valet, etc.)
Verification of new companies & garages
Monitoring system health and key metrics
Handling disputes / escalations
Key interfaces:

Verification pipeline (pending → verified → rejected)
User management
High-level booking stats dashboards
4. Backend Architecture (NestJS + GraphQL + Prisma)
Valet Module – Purpose & Responsibilities
The Valet Module is a dedicated subsystem that handles all logistics related to vehicle pickup, movement, and return. It exists because valet operations are multi‑step workflows, not simple records like bookings.

Why a separate module?
Valet tasks involve dynamic state transitions, routing, distance calculation, and role‑restricted actions. Keeping this logic separate prevents the booking system from becoming bloated and ensures scalability.

What the Valet Module does:
Creates ValetAssignment when a booking includes valet service

Stores pickup/drop coordinates, distance (via Mapbox), valet pricing

Assigns a valet driver (auto or manager-assigned)

Enforces a strict workflow state machine:

ASSIGNED → PICKUP_IN_PROGRESS → AT_GARAGE → RETURN_IN_PROGRESS → COMPLETED
Ensures only the assigned valet can update statuses

Updates booking timeline for customer & manager visibility

Integrates Mapbox Directions for navigation and distance

Triggers notifications (valet arriving, vehicle picked, returned)

Enables operational metrics—valet performance, task durations, etc.

This module turns Auto space from a simple parking system into a full logistics-enabled parking service.

4. Backend Architecture (NestJS + GraphQL + Prisma)
The backend is implemented as a modular NestJS application exposing a GraphQL API. It is the single source of truth for all business logic.

4.1 Modules Overview
apps/api/src/
  auth/             # JWT, NextAuth integration, Guards
  users/            # Users, roles, profile
  companies/        # Companies & staff relationships
  garages/          # Garages & their metadata
  slots/            # Slot CRUD & search helpers
  bookings/         # Booking creation, availability checks
  valet/            # ValetAssignments and workflows
  admin/            # Admin-only actions, verification flows
  payments/         # Payment provider integration
  notifications/    # Email/SMS, push notifications
  common/           # Shared pipes, filters, interceptors
Each module typically contains:

*.resolver.ts – GraphQL resolvers (queries & mutations)
*.service.ts – Business logic
*.model.ts / *.dto.ts – GraphQL object types & input types
Integration with Prisma client for data persistence
4.2 Prisma + PostgreSQL
Prisma is used as the ORM, with a schema that defines:

Core entities: User, Role, Company, Garage, Slot, Booking, ValetAssignment, GarageVerification

Indexes & constraints:

Indexes on Garage location fields (for geo search)
Indexes on Booking.start_time, Booking.end_time, slot_id
Optional Postgres exclusion constraints to prevent overlapping bookings per slot
Type safety flow:

Define/modify model in schema.prisma
Run prisma migrate + prisma generate
TypeScript types for models & inputs are updated
Any inconsistency in services/resolvers/DTOs causes compile errors
This ensures DB schema → API → Frontend are tightly coupled via types.

4.3 Authentication & Authorization
AuthN:

NextAuth on the frontend manages login & sessions.
Access token (JWT) is sent to API.
NestJS validates the JWT via AuthGuard.
AuthZ (Role-Based Access Control):

Decorators like @Roles('ADMIN') on resolver methods

Guards that check:

User roles (Admin, Manager, Valet, Customer)
Context-specific permissions (e.g., Manager can only mutate their own Company’s garages)
This enforces multi-tenant isolation and correct permissions per app.

5. Data Storage & Caching
5.1 PostgreSQL
Main relational store for:

Users & roles
Companies & garages
Slots & bookings
Valet assignments
Verifications & audit logs
5.2 Redis (Optional, Recommended)
Used for:

Caching search results for popular map areas
Storing short-lived 6-digit passcodes for quick validation
Potentially session or rate-limit data
5.3 Message Queue (Optional, Recommended)
Something like RabbitMQ, Kafka, or a cloud message bus used for:

Sending async email/SMS notifications
Emitting events on booking creation/cancellation
Processing heavy tasks (report generation, analytics rollups)
6. Third-Party Integrations
6.1 Mapbox
Used for:

Map display on frontend (Customer & Valet apps)

Geocoding addresses → coordinates for garages and pickup/drop points

Directions API:

Input: pickup → garage → drop
Output: distance in km and route info
Used to compute valet charges (e.g., $5 per km)
6.2 Payment Provider
Integration responsibilities:

Create payment intents for bookings
Handle success & failure webhooks
Only confirm booking after successful payment
Idempotency: protect against double-booking on repeated callbacks
6.3 Email/SMS Provider
Used for:

Sending login OTP (if using phone-based auth)
Sending booking confirmations, reminders, and passcodes
Valet assignment updates
7. Cross-Cutting Concerns
7.1 Logging & Monitoring
Centralized logging (e.g., using a logging library in NestJS)

Log important events:

Booking created, updated, cancelled
Valet assignment status changes
Failed payment attempts
Metrics:

Active bookings per garage
Search-to-booking conversion
Valet completion times
7.2 Security
HTTPS everywhere
Secure JWT handling and short token lifetimes
Input validation through Zod (frontend) + class-validator (backend)
Row-level authorization checks in services (never trust client-side roles)
7.3 Scalability Considerations
Stateless API instances behind a load balancer
Horizontal scaling of api pods/containers
PostgreSQL vertical scaling + read replicas if needed
Caching heavy read queries
Breaking out search/valet modules into microservices if load demands it
8. Key Request Flows
8.1 Search & Booking (Customer)
Customer opens map and selects:

Location (or just uses map bounds)
Date & time range
Vehicle type + dimensions
Optional: valet
Customer app calls searchAvailableSlots query:

Backend filters garages by geo bounds
Filters slots by type and dimensions
Excludes slots with overlapping bookings for requested time
If valet is selected, fetches Mapbox distance and computes valet cost
Customer picks an option and proceeds to checkout.

createBookingIntent mutation:

Validates availability again (soft check)
Creates a temporary booking or holds slot
Initiates payment intent
Payment provider handles payment.

On payment success webhook:

Backend atomic check + create final booking:

Re-check no double booking for this slot/time
Persist booking & 6-digit passcode
Create ValetAssignment if needed
8.2 Garage & Slot Setup (Manager)
Manager logs in via Manager web.

If no Company exists:

createCompany mutation; backend ensures user not already manager elsewhere.
Manager creates Garage:

Sets address, coordinates, operating hours.
Manager defines Slots for the garage:

Type, dimensions, pricing.
Garage enters verification pipeline:

Admin reviews docs & details via Admin app.
On approval, the garage becomes searchable by customers.
8.3 Valet Assignment (Valet)
Booking with valet is confirmed.

Backend either:

Auto-assigns a valet based on availability, or
Lets Manager assign via Manager app.
Valet sees new job in Valet app.

Valet updates status as they progress.

System logs each state transition, updating the booking timeline.

This high-level architecture gives you a structured mental map of Auto space: four sharply designed apps on top of one type-safe backend and a relational core, wrapped around geo search, time-window bookings, and valet logistics.
