# AutoSpace – Parking & Valet Management Platform

AutoSpace is a smart parking and valet management platform designed to connect **customers, garages, valets, and administrators** through a single system.

The platform focuses on real-world parking operations, booking management, and valet workflows while maintaining clear architectural boundaries and scalability readiness.


# Architecture Overview

AutoSpace currently follows a modular **monolith architecture** with **microservice-ready** boundaries.

The system is designed so that core domains are logically separated and can be extracted into independent services when scaling requirements demand it.

Communication is synchronous via REST APIs, with asynchronous workflows planned for background processing.


# High-Level Architecture

┌───────────────────────┐
│      Next.js UI       │
│  (User / Garage /     │
│   Valet / Admin)      │
└──────────┬────────────┘
           │
           ▼
┌────────────────────────────────────┐
│        Backend API (BFF)            │
│  - JWT Authentication               │
│  - Role-Based Access Control        │
│  - Request Routing                  │
│  - Validation & Rate Limiting       │
└───────┬─────────┬─────────┬────────┘
        │         │         │
        ▼         ▼         ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│  Auth    │ │ Booking  │ │ Resource │
│ Module   │ │ Module   │ │ Module   │
└──────────┘ └──────────┘ └──────────┘
        │
        ▼
┌────────────────────────────┐
│ Redis / Message Queue      │
│ (Cache & Async Processing) │
└────────────────────────────┘


# Data Stores

| Technology | Usage                                       |
| ---------- | ------------------------------------------- |
| PostgreSQL | Users, roles, garages, slots, bookings      |
| MongoDB    | Logs, tracking data (non-transactional)     |
| Redis      | OTPs, rate limiting, availability cache     |
| RabbitMQ   | Booking events & valet assignment (planned) |


# Repository Structure

autospace/
├── nextjs-autospace/        # Frontend (Next.js)
├── nodejs-autospace/        # Backend API
├── .github/workflows/       # CI pipelines
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── README.md

# Authentication & Authorization

## Authentication

- JWT-based authentication

- Access tokens include role information

- Tokens issued by the Auth module

- Tokens verified at the API entry layer

Example JWT payload:

{
  "sub": "<userId>",
  "role": "USER | GARAGE | VALET | ADMIN"
}


## Authorization

Authorization is enforced centrally.

| Role   | Access Scope                      |
| ------ | --------------------------------- |
| USER   | Search parking, create bookings   |
| GARAGE | Manage slots, assign valets       |
| VALET  | Accept assignments, update status |
| ADMIN  | System monitoring & approvals     |


Backend modules trust the authentication layer and do not re-validate JWTs internally.

# Backend Modules

## Auth Module

Responsibilities:

- User registration & login

- Password hashing

- JWT issuance

- Role management


## Booking Module

Responsibilities:

- Parking slot availability

- Booking creation & lifecycle

- Valet request handling


## Resource Module

Responsibilities:

- Garages & companies

- Parking slots

- Valet profiles

- Location & mapping data


# Local Development Setup

## Prerequisites
- Node.js 18+
- pnpm 9+

Enable pnpm:
corepack enable
corepack prepare pnpm@latest --activate

Install Dependencies (root):
pnpm install

Run Frontend:
cd nextjs-autospace
pnpm dev

Run Backend:
cd nodejs-autospace
pnpm dev

## Quality & CI

The project enforces automated quality checks.
Run from the repository root:
pnpm lint
pnpm typecheck
pnpm build
All checks must pass before merging.

# Design Notes

- Modular monolith with microservice-ready boundaries
- Centralized authentication & authorization
- Asynchronous workflows only require
- Infrastructure complexity is added only when justified

### Error Response Format

All authentication-related errors follow this format:

{
  "success": false,
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}


