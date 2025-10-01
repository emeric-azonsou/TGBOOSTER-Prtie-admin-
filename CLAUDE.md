
# CLAUDE.md
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
## Development Commands
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm start` - Start production server
- `npm run lint` - Run Next.js linting
### Testing Commands

- `npm test` - Run tests with Vitest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with Vitest UI
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Run tests with coverage report

### Development Utilities

- `npm run dev:delete-user` - Development script to clean up orphaned users

## Project Overview

**TikTok Visibility Platform** - A platform connecting clients (artists, brands, entrepreneurs, influencers) who need TikTok visibility with executants who perform paid actions (subscriptions, views, interactions, challenges) using real accounts.

### Core Business Model

- **Clients**: Pay for TikTok visibility services (followers, views, engagement, challenges)
- **Executants**: Earn money by performing validated actions on real TikTok accounts
- **Platform**: Facilitates matching, validates actions, handles payments
- **Target Market**: Benin-based users with FCFA payments via Mobile Money

### Key Value Propositions

- **Simplicity**: Drop link → Set target → Pay → Real-time tracking
- **Speed**: Offers published in minutes, validation within 24-48h
- **Transparency**: Clear pricing, real-time stats, performance-based payments
- **Local Access**: Mobile Money payments (MTN MoMo, Moov Money), WhatsApp support

## Architecture Overview

This is a Next.js 15 platform using App Router with a feature-based architecture and Supabase for backend services.

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI**: React 19 RC, Tailwind CSS
- **Database & Auth**: Supabase with SSR support
- **State Management**: TanStack Query v5 for server state
- **Testing**: Vitest with React Testing Library
- **Validation**: Zod schemas
- **Type Safety**: TypeScript
- **Payments**: Mobile Money integration (MTN MoMo, Moov Money)
- **Notifications**: WhatsApp/SMS/Email via external APIs


### User System & Authentication

**Dual-Role Authentication System**:
- **Clients**: Artists, brands, influencers paying for TikTok visibility
- **Executants**: Users performing paid actions (students, creators, micro-influencers)
- **Admin**: Platform operators with various permission levels

**User Flows**:
- Email/WhatsApp verification with OTP
- TikTok account linking and verification
- Profile completion based on user type
- KYC for withdrawal eligibility

### Core Business Features

#### Campaign Management (Client Side)
- **Campaign Types**:
  - Followers: Profile link → Target volume → Budget
  - Views/Engagement: Video link → Objectives (views, likes, comments)
  - Challenges: Hashtag/sound campaigns
- **Real-time Tracking**: Actions in progress/validated, unit costs, budget consumption
- **Payment Integration**: Mobile Money (FCFA), card/bank transfer options

#### Task System (Executant Side)
- **Task Discovery**: Filtered by action type, payment, deadline
- **Proof Submission**: Screenshots, URLs, validation guides
- **Subscription Tiers**: 5K, 7K, 10K, 20K FCFA levels for priority access
- **Wallet System**: 5,000 FCFA minimum withdrawal via Mobile Money
- **Referral Program**: Bonus system for bringing new executants

#### Quality Control & Moderation
- **Automated Validation**: Threshold-based auto-approval
- **Manual Review**: Above-threshold actions require moderation
- **Anti-Abuse**: Daily limits, device/IP fingerprinting, duplicate detection
- **Dispute System**: Client-executant-moderator workflow with SLA

#### Admin Back-Office
- **Roles**: Global admin, moderator, operations, support, read-only
- **Monitoring**: Active campaigns, validation queues, system health
- **Moderation Tools**: Proof validation, dispute resolution, user sanctions
- **Analytics**: Performance metrics, validation rates, quality control

### Key Database Tables

```sql
-- Core user profiles
users (id, email, role, tiktok_handle, verified_at)
client_profiles (user_id, business_type, company_name)
executant_profiles (user_id, subscription_tier, total_earnings, referral_code)

-- Campaign and task management
campaigns (id, client_id, type, target_url, budget, status)
tasks (id, campaign_id, executant_id, proof_url, status, payment_amount)
validations (id, task_id, moderator_id, status, reason)

-- Financial operations
wallets (user_id, balance_fcfa, total_withdrawn)
withdrawals (id, user_id, amount, mobile_money_number, status)
payments (id, campaign_id, amount, payment_method, status)

-- Moderation and quality
disputes (id, task_id, reason, status, resolution)
sanctions (id, user_id, type, reason, expires_at)
Integration Requirements

TikTok API: Profile/video validation, metrics fetching
Mobile Money APIs: MTN MoMo, Moov Money for payments/withdrawals
WhatsApp Business API: Notifications and support
SMS Gateway: OTP verification
Email Service: Notifications and receipts

Performance & Scalability

Queue System: Task distribution and validation processing
Real-time Updates: WebSocket for dashboard updates
Caching: Campaign data, user stats, validation rules
Rate Limiting: API calls, user actions, campaign creation
Monitoring: Service health, error rates, processing latency

Security & Compliance

Data Protection: User data encryption, secure payment processing
Fraud Prevention: Multi-account detection, suspicious pattern analysis
Content Moderation: TOS compliance, inappropriate content filtering
Audit Trail: User actions, admin operations, financial transactions

Development Guidelines

Features organized by business domain in src/features/
Business logic in service classes with proper error handling
Zod validation for all user inputs and API responses
Real-time features using Supabase subscriptions
Mobile-first responsive design for African market
Comprehensive testing including payment flows
Proper logging for financial operations and disputes

Local Development Notes

Test Mobile Money integrations using sandbox environments
WhatsApp Business API requires verified business account
TikTok URLs should be validated for format and accessibility
Currency always in FCFA (West African CFA franc)
Time zones handled for Benin (WAT - UTC+1)


### Business Logic & Pricing

#### Pricing Strategy
- **Client Pricing**: Transparent per-action pricing (e.g., 50 FCFA/follower, 25 FCFA/view)
- **Executant Earnings**: 60-70% of client payment per validated action
- **Platform Commission**: 30-40% covering operations, moderation, payment processing
- **Subscription Benefits**: Priority access, higher-paying tasks, bonus multipliers

#### Campaign Economics
```typescript
// Example pricing structure
const PRICING = {
  followers: { client: 50, executant: 35, platform: 15 }, // FCFA
  views: { client: 25, executant: 17, platform: 8 },
  likes: { client: 15, executant: 10, platform: 5 },
  comments: { client: 75, executant: 50, platform: 25 },
  challenges: { client: 100, executant: 70, platform: 30 }
};
Quality Assurance Workflows
Task Validation Rules

Follower Tasks: Screenshot showing follow action + profile verification
View Tasks: Minimum watch duration (30s+), interaction proof
Engagement Tasks: Authentic comment content, proper hashtag usage
Challenge Tasks: Video upload proof, correct sound/hashtag usage

Auto-Validation Thresholds

New executants: Manual review for first 10 tasks
Trusted executants (95%+ validation rate): Auto-approve up to 20 tasks/day
Suspicious patterns: Flag for manual review

Notification System
// Key notification types
const NOTIFICATIONS = {
  executant: [
    'new_tasks_available',
    'task_validated',
    'payment_received',
    'withdrawal_processed',
    'subscription_expired'
  ],
  client: [
    'campaign_started',
    'milestone_reached',
    'campaign_completed',
    'payment_confirmation'
  ]
};
Anti-Fraud Measures
Multi-Account Detection

Device fingerprinting (browser, screen resolution, timezone)
IP address tracking and geolocation
Behavioral pattern analysis (task completion speed, interaction patterns)
TikTok account verification (age, followers, authentic activity)

const LIMITS = {
  executant: {
    daily_tasks: 50,
    same_campaign_tasks: 5,
    withdrawal_requests: 1,
    dispute_submissions: 3
  },
  client: {
    daily_budget: 100000, // FCFA
    campaign_creations: 10,
    dispute_escalations: 5
  }
};
Payment Processing
Mobile Money Integration

// Payment providers configuration
const MOBILE_MONEY = {
  providers: ['mtn_momo', 'moov_money', 'celtiis_cash'],
  withdrawal_fees: {
    mtn_momo: 200, // FCFA
    moov_money: 150,
    celtiis_cash: 100
  },
  processing_time: '5-30 minutes',
  minimum_withdrawal: 5000 // FCFA
};
Payment States & Reconciliation

Pending → Processing → Completed/Failed
Automated reconciliation with payment provider APIs
Manual verification for failed transactions
Refund processing for disputed completed tasks

Analytics & Reporting
Real-Time Dashboards

Client Dashboard: Campaign progress, spend vs results, ROI metrics
Executant Dashboard: Available tasks, earnings, validation rates
Admin Dashboard: Platform health, revenue, quality metrics

Key Performance Indicators
const KPIs = {
  platform: ['total_revenue', 'active_users', 'task_completion_rate'],
  quality: ['validation_rate', 'dispute_rate', 'user_satisfaction'],
  growth: ['new_signups', 'retention_rate', 'referral_conversions']
};
Localization & UX
Regional Considerations

French language support (Benin official language)
Local payment methods prioritized
Mobile-first design (high mobile usage in West Africa)
Offline-capable features where possible
Low-bandwidth optimizations

Support Channels

WhatsApp Business: Primary support channel
SMS: Critical notifications and OTP
Email: Formal communications and receipts
In-app chat: Secondary support option

Error Handling & Resilience
Critical Error Scenarios

const ERROR_HANDLING = {
  payment_failures: 'Retry logic + manual intervention',
  tiktok_api_down: 'Queue tasks + batch process when restored',
  notification_failures: 'Multiple channel fallback',
  validation_service_error: 'Graceful degradation to manual review'
};
Monitoring & Alerting

Business Metrics: Campaign success rates, user churn, revenue
Technical Metrics: API response times, error rates, queue depths
Security Metrics: Failed login attempts, suspicious patterns, fraud indicators

Compliance & Legal
Data Protection (GDPR-like principles)

User consent for data processing
Right to data export and deletion
Secure data storage and transmission
Regular security audits

Platform Policies

Clear Terms of Service for both user types
Community guidelines for acceptable TikTok content
Anti-spam and authentic engagement policies
Dispute resolution procedures with clear SLAs

Future Roadmap Considerations
Phase 2 Features

Instagram and YouTube integration
Advanced analytics and reporting
Influencer tier system with verified badges
Automated campaign optimization
API access for large clients

Scalability Preparations

Microservices architecture migration path
Database sharding strategy
CDN implementation for global reach
Machine learning for fraud detection improvement


## Supabase Database Schema

### Database Enums

```sql
-- User management enums
CREATE TYPE user_type_enum AS ENUM ('executant', 'client', 'admin');
CREATE TYPE user_status_enum AS ENUM ('pending_verification', 'active', 'suspended', 'banned');
CREATE TYPE admin_status_enum AS ENUM ('active', 'inactive', 'suspended');

-- Communication enums
CREATE TYPE email_status_enum AS ENUM ('pending', 'sent', 'failed', 'delivered');
CREATE TYPE email_priority_enum AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE notification_type_enum AS ENUM ('info', 'success', 'warning', 'error');

-- Financial transaction enums
CREATE TYPE transaction_type_enum AS ENUM ('deposit', 'withdrawal', 'payment', 'refund', 'commission');
CREATE TYPE transaction_status_enum AS ENUM ('pending', 'completed', 'failed', 'cancelled');
CREATE TYPE payment_method_enum AS ENUM ('card', 'mobile_money', 'bank_transfer', 'paypal');
CREATE TYPE withdrawal_status_enum AS ENUM ('pending', 'approved', 'rejected', 'completed');

-- Task management enums
CREATE TYPE task_type_enum AS ENUM ('social_follow', 'social_like', 'social_share', 'social_comment', 'app_download', 'website_visit', 'survey', 'review');
CREATE TYPE task_status_enum AS ENUM ('draft', 'active', 'paused', 'completed', 'cancelled');
CREATE TYPE task_priority_enum AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE execution_status_enum AS ENUM ('assigned', 'in_progress', 'submitted', 'completed', 'rejected');

-- Authentication enums
CREATE TYPE auth_method_enum AS ENUM ('password', 'oauth', 'two_factor');
CREATE TYPE oauth_provider_enum AS ENUM ('google', 'facebook', 'apple');
CREATE TYPE verification_type_enum AS ENUM ('email', 'phone', 'identity');
CREATE TYPE token_type_enum AS ENUM ('email_verification', 'password_reset', 'two_factor');

-- Subscription enums
CREATE TYPE subscription_status_enum AS ENUM ('active', 'expired', 'cancelled', 'pending');
CREATE TYPE plan_status_enum AS ENUM ('active', 'inactive', 'deprecated');
-- Main user profiles table
CREATE TABLE public.user_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email character varying NOT NULL UNIQUE,
  first_name character varying NOT NULL,
  last_name character varying NOT NULL,
  phone character varying,
  user_type user_type_enum NOT NULL DEFAULT 'executant',
  status user_status_enum DEFAULT 'pending_verification',
  avatar_url text,
  date_of_birth date,
  country character varying,
  city character varying,
  timezone character varying DEFAULT 'UTC',
  language character varying DEFAULT 'fr',
  email_verified boolean DEFAULT false,
  phone_verified boolean DEFAULT false,
  two_factor_enabled boolean DEFAULT false,
  last_login_at timestamp with time zone,
  login_count integer DEFAULT 0,
  referral_code character varying UNIQUE,
  referred_by uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id)
);

-- Client business profiles
CREATE TABLE public.client_profiles (
  client_id uuid NOT NULL,
  company_name character varying,
  website character varying,
  industry character varying,
  company_size character varying,
  monthly_budget_cents integer,
  preferred_categories text[],
  business_type character varying,
  tax_id character varying,
  billing_address jsonb,
  is_verified boolean DEFAULT false,
  verification_documents jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT client_profiles_pkey PRIMARY KEY (client_id),
  CONSTRAINT client_profiles_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.user_profiles(id)
);

-- Executant worker profiles
CREATE TABLE public.executant_profiles (
  executant_id uuid NOT NULL,
  bio text,
  skills text[],
  social_media_accounts jsonb,
  rating_avg numeric DEFAULT 0,
  total_tasks_completed integer DEFAULT 0,
  success_rate numeric DEFAULT 0,
  preferred_task_types text[],
  availability_hours jsonb,
  is_verified boolean DEFAULT false,
  verification_level character varying DEFAULT 'basic',
  identity_documents jsonb,
  bank_details jsonb,
  subscription_plan_id uuid,
  subscription_expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT executant_profiles_pkey PRIMARY KEY (executant_id),
  CONSTRAINT executant_profiles_executant_id_fkey FOREIGN KEY (executant_id) REFERENCES public.user_profiles(id)
);
-- Main tasks/campaigns table
CREATE TABLE public.tasks (
  task_id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  title character varying NOT NULL,
  description text NOT NULL,
  task_type task_type_enum NOT NULL,
  target_url text NOT NULL,
  target_username character varying,
  instructions text,
  proof_requirements text[],
  quantity_required integer NOT NULL DEFAULT 1,
  quantity_completed integer DEFAULT 0,
  reward_per_execution_cents integer NOT NULL,
  total_budget_cents integer NOT NULL,
  remaining_budget_cents integer NOT NULL,
  status task_status_enum DEFAULT 'draft',
  priority task_priority_enum DEFAULT 'normal',
  start_date timestamp with time zone DEFAULT now(),
  end_date timestamp with time zone,
  target_audience jsonb,
  geographic_restrictions text[],
  age_restrictions jsonb,
  required_follower_count integer,
  auto_approve boolean DEFAULT false,
  max_executions_per_user integer DEFAULT 1,
  estimated_duration_minutes integer,
  tags text[],
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tasks_pkey PRIMARY KEY (task_id),
  CONSTRAINT tasks_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.client_profiles(client_id)
);

-- Task executions by workers
CREATE TABLE public.task_executions (
  execution_id uuid NOT NULL DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL,
  executant_id uuid NOT NULL,
  status execution_status_enum DEFAULT 'assigned',
  assigned_at timestamp with time zone DEFAULT now(),
  started_at timestamp with time zone,
  submitted_at timestamp with time zone,
  completed_at timestamp with time zone,
  reviewed_at timestamp with time zone,
  reviewer_id uuid,
  proof_urls text[],
  proof_screenshots text[],
  executant_notes text,
  review_notes text,
  rejection_reason text,
  reward_cents integer NOT NULL,
  bonus_cents integer DEFAULT 0,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT task_executions_pkey PRIMARY KEY (execution_id),
  CONSTRAINT task_executions_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(task_id),
  CONSTRAINT task_executions_executant_id_fkey FOREIGN KEY (executant_id) REFERENCES public.executant_profiles(executant_id)
);
-- Client wallet management
CREATE TABLE public.client_wallets (
  wallet_id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL UNIQUE,
  balance_cents integer DEFAULT 0 CHECK (balance_cents >= 0),
  pending_cents integer DEFAULT 0 CHECK (pending_cents >= 0),
  total_spent_cents integer DEFAULT 0,
  currency_code character varying DEFAULT 'XOF',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT client_wallets_pkey PRIMARY KEY (wallet_id),
  CONSTRAINT client_wallets_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.client_profiles(client_id)
);

-- Executant wallet management
CREATE TABLE public.executant_wallets (
  wallet_id uuid NOT NULL DEFAULT gen_random_uuid(),
  executant_id uuid NOT NULL UNIQUE,
  balance_cents integer DEFAULT 0 CHECK (balance_cents >= 0),
  pending_cents integer DEFAULT 0 CHECK (pending_cents >= 0),
  total_earned_cents integer DEFAULT 0,
  currency_code character varying DEFAULT 'XOF',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT executant_wallets_pkey PRIMARY KEY (wallet_id),
  CONSTRAINT executant_wallets_executant_id_fkey FOREIGN KEY (executant_id) REFERENCES public.executant_profiles(executant_id)
);

-- Withdrawal requests from executants
CREATE TABLE public.withdrawal_requests (
  withdrawal_id uuid NOT NULL DEFAULT gen_random_uuid(),
  executant_id uuid NOT NULL,
  amount_cents integer NOT NULL,
  status withdrawal_status_enum DEFAULT 'pending',
  payment_method payment_method_enum NOT NULL,
  payment_details jsonb NOT NULL,
  processed_by uuid,
  rejection_reason text,
  external_transaction_id character varying,
  requested_at timestamp with time zone DEFAULT now(),
  processed_at timestamp with time zone,
  completed_at timestamp with time zone,
  CONSTRAINT withdrawal_requests_pkey PRIMARY KEY (withdrawal_id),
  CONSTRAINT withdrawal_requests_executant_id_fkey FOREIGN KEY (executant_id) REFERENCES public.executant_profiles(executant_id)
);
-- Affiliate program management
CREATE TABLE public.affiliates (
  affiliate_id uuid NOT NULL,
  referral_code character varying NOT NULL UNIQUE,
  commission_rate numeric DEFAULT 0.05,
  total_referrals integer DEFAULT 0,
  total_commission_cents integer DEFAULT 0,
  pending_commission_cents integer DEFAULT 0,
  status character varying DEFAULT 'active',
  joined_at timestamp with time zone DEFAULT now(),
  CONSTRAINT affiliates_pkey PRIMARY KEY (affiliate_id),
  CONSTRAINT affiliates_affiliate_id_fkey FOREIGN KEY (affiliate_id) REFERENCES public.user_profiles(id)
);

-- Affiliate earnings tracking
CREATE TABLE public.affiliate_earnings (
  earning_id uuid NOT NULL DEFAULT gen_random_uuid(),
  affiliate_user_id uuid NOT NULL,
  referred_user_id uuid NOT NULL,
  commission_amount numeric NOT NULL,
  commission_rate numeric NOT NULL,
  source_transaction_id uuid,
  status character varying DEFAULT 'pending',
  paid_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT affiliate_earnings_pkey PRIMARY KEY (earning_id),
  CONSTRAINT affiliate_earnings_affiliate_user_id_fkey FOREIGN KEY (affiliate_user_id) REFERENCES public.user_profiles(id),
  CONSTRAINT affiliate_earnings_referred_user_id_fkey FOREIGN KEY (referred_user_id) REFERENCES public.user_profiles(id)
);
// Example pricing structure
const PRICING = {
  followers: { client: 50, executant: 35, platform: 15 }, // FCFA
  views: { client: 25, executant: 17, platform: 8 },
  likes: { client: 15, executant: 10, platform: 5 },
  comments: { client: 75, executant: 50, platform: 25 },
  challenges: { client: 100, executant: 70, platform: 30 }
};

## Current Implementation Status

### ✅ Completed Features

#### Authentication System (`src/features/auth/`)
- **Multi-role registration**: Simple executant registration and full client/executant registration
- **Secure password validation**: Strong password requirements with confirmation
- **Email verification**: Supabase-based email confirmation flow
- **Profile completion**: Step-by-step onboarding for different user types
- **Password reset**: Secure token-based password reset workflow
- **Session management**: Remember me functionality with secure session tokens
- **Security logging**: Comprehensive auth event logging with risk scoring
- **Anti-fraud protection**: IP tracking, device fingerprinting, rate limiting

#### Order Flow with Mandatory Account (`src/app/services-payement/`)
- **Order-first approach**: Users fill order form before authentication
- **Session management**: Secure order data storage with 30min expiration
- **Authentication choice page**: Clean interface for login/register options
- **Intelligent redirections**: Automatic flow between order and payment pages
- **Account requirement enforcement**: All clients must have an account for security

#### Payment Integration (`src/lib/payments/`)
- **FedaPay integration**: Complete Mobile Money payment processing for Benin
- **Lygos payment gateway**: Alternative payment provider implementation
- **Payment validation**: Phone number formatting, TikTok URL validation
- **Security features**: Signature generation, data sanitization
- **API endpoints**: Payment initiation, status checking, callback handling
- **Comprehensive testing**: Unit tests for payment flows and validation

#### Database Schema (Supabase)
- **User management**: Multi-role user profiles with proper relationships
- **Task system**: Campaign creation, task assignment, execution tracking
- **Financial system**: Wallet management, withdrawal requests, affiliate tracking
- **Security tables**: Session management, audit logs, security events
- **Comprehensive enums**: Type-safe status management across all entities

#### UI Components (`src/app/components/`)
- **Responsive design**: Mobile-first approach optimized for African market
- **Tailwind CSS**: Custom design system with proper dark mode support
- **Form components**: Reusable form fields with validation
- **Navigation**: Context-aware navigation for different user roles
- **Interactive elements**: Counters, carousels, modals, filters

### 🚧 Partially Implemented

#### Task Management System
- **Basic structure**: Database schema and types defined
- **Missing implementation**: Task creation, assignment logic, validation system
- **API endpoints**: Need implementation for CRUD operations

#### Admin Dashboard
- **Route protection**: Middleware configured for admin routes
- **Missing features**: User management, task moderation, analytics

#### Real-time Features
- **Foundation**: Supabase client configured for real-time subscriptions
- **Missing implementation**: Live dashboard updates, notification system

### ❌ Not Yet Implemented

#### TikTok Integration
- **URL validation**: Basic regex validation implemented
- **Missing**: API integration for profile/video verification
- **Missing**: Metrics fetching and validation

#### Notification System
- **Foundation**: Types and schemas defined
- **Missing**: WhatsApp Business API integration
- **Missing**: SMS gateway integration
- **Missing**: Email notification templates

#### Moderation Tools
- **Database schema**: Defined but not implemented
- **Missing**: Content moderation interface
- **Missing**: Automated validation rules
- **Missing**: Dispute resolution system

#### Analytics Dashboard
- **Types defined**: KPI interfaces and structures
- **Missing**: Data aggregation and visualization
- **Missing**: Real-time metrics tracking

## Technical Architecture Details

### Current Tech Stack Analysis

#### Frontend Architecture
- **Next.js 15**: Using App Router with server-side rendering
- **React 19 RC**: Latest React features with concurrent rendering
- **TypeScript**: Strict type checking enabled across all components
- **Tailwind CSS**: Custom design system with responsive breakpoints
- **Zod Validation**: Type-safe schema validation for forms and APIs

#### Backend & Database
- **Supabase**: PostgreSQL database with built-in auth and real-time features
- **Row Level Security**: Implemented for user data protection
- **Database Functions**: RPC functions for complex business logic
- **File Storage**: Configured for avatar uploads with security policies

#### Testing Infrastructure
- **Vitest**: Fast unit test runner with JSDoc environment
- **React Testing Library**: Component testing with user-centric approach
- **Coverage Reporting**: V8 provider with HTML/JSON output
- **Test Organization**: Feature-based test structure

#### Security Implementation
- **Middleware Protection**: Route-based access control
- **Security Headers**: Comprehensive CSP, HSTS, and frame protection
- **Input Validation**: Zod schemas for all user inputs
- **Session Security**: Secure token hashing and rotation
- **Audit Logging**: Comprehensive security event tracking

### Code Organization Patterns

#### Feature-Based Architecture
```
src/features/auth/
├── actions/          # Server actions for auth operations
├── components/       # React components specific to auth
├── hooks/           # Custom React hooks for auth logic
├── services/        # Business logic and API integration
└── __tests__/       # Feature-specific tests
```

#### Separation of Concerns
- **Actions**: Server-side form handling and validation
- **Services**: Pure business logic without React dependencies
- **Components**: Presentation layer with minimal business logic
- **Hooks**: React-specific state management and side effects

#### Type Safety Strategy
- **Database Types**: Auto-generated from Supabase schema
- **Form Validation**: Zod schemas with TypeScript inference
- **API Contracts**: Consistent request/response typing
- **Error Handling**: Typed error objects with proper categorization

### Development Workflow Patterns

#### Error Handling Strategy
- **Typed Errors**: Custom error classes with specific error codes
- **Graceful Degradation**: Fallback UI states for error conditions
- **User-Friendly Messages**: French language error messages for Benin market
- **Debug Information**: Detailed logging for development troubleshooting

#### Security-First Development
- **Input Sanitization**: All user inputs validated and sanitized
- **Rate Limiting**: API endpoint protection against abuse
- **Session Management**: Secure token generation and validation
- **Audit Trail**: All user actions logged for security monitoring

#### Mobile-First Approach
- **Responsive Design**: Tailwind breakpoints optimized for mobile devices
- **Touch-Friendly UI**: Large tap targets and gesture-friendly interactions
- **Performance Optimization**: Lazy loading and code splitting
- **Offline Considerations**: Progressive enhancement patterns

## Development Guidelines & Best Practices

### Code Style Standards
- **No Comments**: Code should be self-documenting through clear naming
- **Consistent Naming**: camelCase for variables, PascalCase for components
- **File Organization**: Feature-based structure with clear boundaries
- **Import Organization**: Absolute imports using @ aliases

### Security Requirements
- **Never log sensitive data**: Passwords, tokens, PII must not appear in logs
- **Validate all inputs**: Client-side AND server-side validation required
- **Sanitize user content**: Prevent XSS and injection attacks
- **Use environment variables**: All secrets and config in environment variables

### Testing Standards
- **Test user flows**: Focus on user interactions, not implementation details
- **Mock external services**: Use proper mocking for third-party APIs
- **Test error conditions**: Ensure graceful handling of edge cases
- **Maintain coverage**: Keep test coverage above 80% for critical paths

### Performance Guidelines
- **Optimize bundle size**: Use dynamic imports for heavy components
- **Database queries**: Use proper indexing and query optimization
- **Image optimization**: Use Next.js image optimization features
- **Caching strategy**: Implement proper caching for API responses

### Localization Considerations
- **French language**: All user-facing text in French for Benin market
- **FCFA currency**: Always display prices in West African CFA francs
- **Mobile Money**: Prioritize Mobile Money payment methods
- **Local phone formats**: Use +229 country code for Benin phone numbers

### Deployment & Production
- **Environment separation**: Clear dev/staging/production environments
- **Database migrations**: Proper schema versioning and migration scripts
- **Monitoring setup**: Error tracking and performance monitoring
- **Backup strategy**: Regular database backups and disaster recovery

### Integration Points
- **Payment Providers**: FedaPay and Lygos integration patterns established
- **TikTok API**: Prepared for future integration with validation framework
- **WhatsApp Business**: Structure ready for notification implementation
- **SMS Gateway**: Framework for OTP and critical notifications

## Order Flow Implementation (Latest Update)

### 🔄 Optimized "Account Required" Flow

Based on security requirements, all clients must have an account. The implemented flow prioritizes conversion while ensuring security:

#### **Current Flow Architecture**:
```
Home Page → Services-Payment → Order Form → Auth Choice → Payment
```

#### **Detailed User Journey**:

1. **Services-Payment Page** (`/services-payement`)
   - Open order form (no auth required)
   - Users fill: Service + Quantity + TikTok URL + Payment details
   - Order data validated and saved in secure session (30min expiration)
   - "Commander maintenant" button redirects to auth choice

2. **Authentication Choice Page** (`/services-payement/choix-auth`)
   - **Option 1 (Recommended)**: "Créer mon compte" → Registration
   - **Option 2**: "Se connecter" → Login
   - Order summary displayed throughout
   - Clear benefits of account creation highlighted

3. **Connected Payment Page** (`/services-payement/paiement-connecte`)
   - Pre-filled with user information
   - Secure payment processing (FedaPay/Lygos)
   - Direct to payment confirmation

#### **Technical Components Added**:

- `OrderSessionManager`: Secure session handling for order data
- `ChoixAuth`: Clean authentication choice interface
- `PaiementConnecte`: Optimized payment page for authenticated users
- Smart redirections: Post-login flow detection and routing

#### **Security & UX Benefits**:

✅ **Security**: All payments require authenticated accounts
✅ **Conversion**: No friction in initial order process
✅ **Data persistence**: Order data preserved during auth flow
✅ **Clear communication**: Users understand account requirement
✅ **Professional flow**: Guided experience with clear next steps

#### **Files Modified/Created**:
- `src/app/services-payement/page.jsx`: Updated order flow logic
- `src/app/services-payement/choix-auth/page.tsx`: Auth choice interface
- `src/app/services-payement/paiement-connecte/page.tsx`: Connected payment page
- `src/lib/utils/order-session.ts`: Order session management
- `src/types/order.types.ts`: Order flow type definitions
- `src/app/admin-client/page.tsx`: Smart post-login redirection

This documentation should be updated as new features are implemented or architectural decisions are made.




# CLAUDE_ADMIN.md

Ce fichier fournit des directives à **Claude Code (claude.ai/code)** pour travailler sur la **partie Admin** de la plateforme TikTok Visibility.

---

## Objectif

La partie **Admin** est un espace réservé aux opérateurs de la plateforme, permettant de gérer les utilisateurs, les campagnes, la validation des tâches, les litiges, les paiements et la sécurité.
Elle doit garantir **contrôle, transparence et sécurité** tout en restant simple d’utilisation.

---

## Rôles & Permissions

### Hiérarchie des rôles
- **Admin global** : Accès complet, configuration, finances, modération.
- **Modérateur** : Validation/rejets de preuves, gestion des litiges, sanctions utilisateurs.
- **Opérations/Payouts** : Vérification et traitement des retraits, rapprochements financiers.
- **Support** : Gestion tickets, remboursements partiels, assistance clients/exécutants.
- **Lecture seule (audit/finance interne)** : Accès aux données de contrôle mais sans modification.

### Gestion technique
- Basée sur **Row Level Security (RLS)** et **politiques Supabase**.
- Permissions centralisées dans `admin_roles` et mappées aux utilisateurs.
- Middleware Next.js pour vérifier le rôle sur chaque route `/admin/*`.

---

## Tableaux de Bord

### Vue d’ensemble
- **KPIs clés** : campagnes actives, tâches en attente, volume exécuté, taux de validation.
- **Litiges en cours** : nombre, SLA de réponse, statut de résolution.
- **Flux financiers** : paiements reçus, retraits en attente, solde exécutants.

### Monitoring Qualité
- Top campagnes par volume.
- Taux de rejet par motif (preuve insuffisante, fraude suspectée, etc.).
- Temps moyen de validation (objectif : <24h).

### Santé Système
- Files de tâches (queue system).
- Latence moyenne API (Supabase, TikTok, FedaPay).
- Taux d’échecs des notifications (SMS/WhatsApp/email).

---

## Modération & Validation

### Validation intelligente
- **Auto-validation** : si exécuteur est « trusted » (95%+ taux validation).
- **Manuelle** : pour les nouveaux ou cas suspects.
- **Échantillonnage** : revue partielle des tâches validées automatiquement.

### Règles par type d’action
- **Vidéo** : durée ≥30s, son officiel, hashtag requis.
- **Follow** : capture profil avec bouton "abonné".
- **Like/Comment** : preuve d’interaction + contenu authentique.

### Workflow Litiges
- Client conteste → Moderateur analyse → Décision.
- SLA : Réponse <24h, Résolution <72h.
- Sanctions progressives :
  - 1er avertissement
  - Suspension temporaire
  - Bannissement définitif
- **Blacklist** : comptes, appareils, IP, méthodes de paiement.

---

## Paiements & Retraits

### Gestion financière
- **Crédit/Débit manuel** par Admin global (bonus, remboursement).
- **Demandes de retrait** : liste triable par montant, date, statut.
- **Rapprochements** : journaux de transactions et matching avec APIs FedaPay/Moov.

### Flux
1. Exécutant demande retrait.
2. Opérations vérifie → approuve/rejette.
3. API Mobile Money traite.
4. Journalisation en base (audit trail obligatoire).

---

## Reporting & Notifications

### Reporting
- Exports CSV : campagnes, tâches, transactions.
- Statistiques périodiques (hebdo/mensuelles).
- Indicateurs qualité (validation rate, fraude détectée).

### Notifications Admin
- Templates email/WhatsApp/SMS :
  - Offre publiée
  - Preuve validée/rejetée
  - Retrait traité
- Localisation FR (Benin) par défaut.

---

## Anti-Abus & Sécurité

### Mesures
- **Limites quotidiennes** (tâches, retraits, litiges).
- **Empreintes numériques** : IP, appareil, OS.
- **Détection multi-comptes** : corrélation par device fingerprinting.
- **OTP renforcé** : via SMS/WhatsApp/email.
- **Journal d’activité** : toutes les actions admin tracées (qui, quand, quoi).

---

## Observabilité & Opérations

### Outils internes
- Tableau de bord monitoring : files de tâches, taux erreurs API.
- Alertes système :
  - Erreurs paiements
  - TikTok API indispo
  - Latence > seuil
- Déploiement & logs via **Vercel + Supabase logs**.

### Performance
- File d’attente (queue) pour :
  - Validation batch
  - Notifications massives
  - Reconciliations paiements

---

## Architecture Technique (Admin)

### Stack
- **Next.js 15** : pages `/admin/*`
- **UI** : Tailwind + composants internes
- **State** : TanStack Query
- **Backend** : Supabase (auth + DB + RLS)
- **Sécurité** : Middleware rôle + audit logs
- **Tests** : Vitest + RTL sur flux admin

### Schéma DB (Admin)
```sql
-- Rôles Admin
CREATE TABLE public.admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id),
  role text CHECK (role IN ('global','moderator','operations','support','read_only')),
  status admin_status_enum DEFAULT 'active',
  created_at timestamp DEFAULT now()
);

-- Journal d’activité
CREATE TABLE public.admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES user_profiles(id),
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb,
  created_at timestamp DEFAULT now()
);
