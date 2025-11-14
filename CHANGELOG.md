# 📝 Changelog

Все заметные изменения в проекте WeddingTech UZ будут документированы здесь.

Формат основан на [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
и этот проект следует [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Advanced features (Phase 7)
- Mobile app (Phase 8)

---

## [0.6.0] - 2025-11-14

### Added - Uzbek Payment Integration
- **Payment Processing System**
  - Support for 4 local payment providers:
    - Payme integration with checkout URL
    - Click payment gateway
    - Uzum payment system
    - Apelsin payment service
  - Currency in Uzbek Som (UZS)
  - Payment status tracking (pending → processing → completed)
  - Transaction history
  
- **payments Database Table**
  - Payment records with booking references
  - Provider transaction IDs
  - Status tracking
  - Metadata storage (JSONB)
  - RLS policies for security
  - Indexes for performance
  
- **Edge Functions**
  - `process-payment` - Payment initialization
    - User authentication verification
    - Booking ownership validation
    - Payment record creation
    - Provider-specific URL generation
    - Return URL support
  - `payment-webhook` - Payment callbacks
    - Provider-specific webhook parsing
    - Status updates
    - Booking payment status sync
    - Public endpoint (no JWT)
    
- **PaymentSelector Component**
  - Visual payment method cards
  - Provider logos and descriptions
  - Amount display in UZS format
  - Loading states
  - One-click payment initiation
  - Gateway redirect handling
  
- **BookingForm Enhancements**
  - Two-step booking process
  - Payment dialog integration
  - Booking creation first
  - Payment selection second
  - Success callbacks
  
- **PaymentSuccess Page (/payment-success)**
  - Success confirmation UI
  - Transaction ID display
  - Return to dashboard link
  - Protected route

### Database Changes
- Created `payments` table with full schema
- Added RLS policies for payment security
- Users can view own payments
- Vendors can view payments for their bookings
- Added indexes for booking_id and provider_transaction_id
- Updated trigger for payments.updated_at

### Changed
- Updated App.tsx with PaymentSuccess route
- Enhanced BookingForm with payment flow
- Modified config.toml for new edge functions
- Updated documentation (PROGRESS.md)

### Security
- JWT verification enabled for process-payment
- JWT disabled for payment-webhook (public callback)
- RLS policies prevent unauthorized payment access
- Booking ownership verification
- Provider transaction ID tracking

---

## [0.5.0] - 2025-11-14

### Added - Real-time Notifications
- **NotificationToast Component**
  - Real-time booking update notifications
  - Toast messages for new bookings
  - Status change notifications (confirmed/cancelled)
  - Vendor name display in notifications
  - Auto-dismiss after 5 seconds
  - Integrated with Supabase Realtime

- **Notification Preferences System**
  - Created `notification_preferences` table
  - Email notifications toggle
  - Push notifications toggle  
  - Booking updates settings
  - Vendor messages preferences
  - Full RLS policies for user privacy

### Database Changes
- Enabled Realtime for `bookings` table
- Added publication to supabase_realtime
- Created notification_preferences table with triggers

### Changed
- Integrated NotificationToast into main App component
- Enabled auto-confirm email for faster testing
- Updated App.tsx with real-time notification system

---

## [0.4.5] - 2025-11-14

### Added - AI Features
- **Lovable AI Integration**
  - Enabled Lovable AI Gateway with Gemini 2.5 Flash
  - Auto-configured LOVABLE_API_KEY secret
  - Ready for production AI features
  
- **wedding-assistant Edge Function**
  - General wedding planning chat assistant
  - Budget advisory with detailed breakdowns
  - Vendor recommendations with priorities
  - Timeline planning assistance
  - Context-aware AI responses
  - Rate limiting (429/402) error handling
  - Multiple conversation types support
  
- **AIAssistant Component**
  - Real-time chat interface with AI
  - Message history management
  - Streaming responses support
  - Loading and error states
  - Type-specific system prompts
  - Auto-scroll to latest messages
  - User-friendly UI with Bot icon
  
- **BudgetCalculator Component**
  - Budget input form
  - Guest count and style inputs
  - Location specification
  - AI-powered budget distribution
  - Dialog integration with chat
  - Percentage-based allocations
  - Category breakdowns
  
- **VendorRecommendations Component**
  - Wedding style preferences
  - Budget range input
  - Priority specification textarea
  - AI analysis and suggestions
  - Booking timeline guidance
  - Vendor selection tips
  
- **AI Assistant Page (/ai-assistant)**
  - Tabbed interface with 3 sections
  - General chat tab
  - Budget calculator tab with guide
  - Vendor recommendations tab with tips
  - How-it-works documentation
  - Priority timeline cards
  
### Changed
- Updated Dashboard quick actions
  - Added "AI Помощник" button
  - Replaced guest management with AI assistant
  - Added Sparkles icon for AI features
  
- Enhanced AppSidebar navigation
  - Added "AI Помощник" menu item for couples
  - Positioned between Planner and Profile
  - Uses Sparkles icon
  
- Updated App.tsx routing
  - Added /ai-assistant protected route
  - Imported AIAssistantPage component

### Features
- ✅ Conversational AI wedding planning
- ✅ Smart budget distribution with AI
- ✅ Vendor recommendation system
- ✅ Timeline planning assistance
- ✅ Multi-type conversation support
- ✅ Error recovery and rate limiting
- ✅ Dialog-based AI interactions

### Technical
- Edge function uses Lovable AI Gateway
- Model: google/gemini-2.5-flash
- Temperature: 0.7 for creativity
- Max tokens: 1000 per response
- CORS enabled for all origins
- Proper error handling with user-friendly messages

---

## [0.4.0] - 2025-11-14

### Added
- **Vendor Dashboard System**
  - Created `/vendor-dashboard` page with full control panel
  - Stats overview (total bookings, pending, revenue, rating)
  - Tabbed interface (Bookings & Portfolio)
  
- **BookingManagement Component**
  - Accept/decline booking functionality
  - Status management (pending/confirmed/cancelled/completed)
  - View detailed booking information:
    - Couple contact details (name, email, phone)
    - Wedding plan info (date, theme, venue)
    - Booking date and price
    - Notes from couple
  - Stats dashboard with metrics:
    - Total bookings
    - Pending (requiring action)
    - Confirmed bookings
    - Completed bookings
  - Tabs for filtering (pending/confirmed/all)
  - One-click accept/decline actions
  
- **PortfolioManagement Component**
  - Edit vendor profile information
  - Update business name and category
  - Manage description text
  - Set location
  - Configure price range (min/max)
  - Save changes functionality
  - Portfolio image upload placeholder (future implementation)
  
- **Role-Based Navigation**
  - Dynamic sidebar menu based on user role
  - Couple menu: Dashboard, Marketplace, Planner, Profile, Settings
  - Vendor menu: Dashboard, Vendor Services, Profile, Settings
  - Auto-detect role from profiles table
  - Smooth role-based UI updates

### Changed
- Updated AppSidebar with role detection
- Enhanced Dashboard to show vendor-specific content
- Added vendor menu items (Briefcase icon)
- Updated routing configuration with vendor dashboard
- Improved booking workflow with status transitions

### Fixed
- Fixed TypeScript type issues in booking status
- Fixed vendor category typing for profile updates
- Improved error handling in vendor components

### Security
- ✅ Vendor dashboard protected by authentication
- ✅ Bookings filtered by vendor ownership
- ✅ RLS policies enforce vendor-specific data access

---

## [0.3.0] - 2025-11-14

### Added
- **Core Pages Structure**
  - Created DashboardLayout with AppSidebar
  - Implemented collapsible sidebar navigation
  - Added ProtectedRoute wrapper for authentication
  
- **Dashboard Page (/dashboard)**
  - Welcome section with user greeting
  - Stats cards for key metrics
  - Quick action buttons
  - Daily tips card
  - Role-based content (couple vs vendor)
  
- **Marketplace Page (/marketplace)**
  - Search functionality
  - Category filtering (11 categories)
  - Vendor cards grid with:
    - Portfolio images
    - Rating and reviews count
    - Location, price range
    - Verified badges
  - Empty state handling
  - Responsive design
  
- **Planner Page (/planner)**
  - Overall progress tracker
  - Stats overview (date, budget, guests, tasks)
  - Interactive checklist with categories
  - Timeline placeholder
  - Progress bar visualization
  
- **Profile Page (/profile)**
  - Avatar with upload placeholder
  - Editable profile fields (name, phone)
  - Account type display
  - Email (read-only)
  - Save/Cancel functionality
  
- **Settings Page (/settings)**
  - Notifications preferences
  - Privacy & security settings
  - Language and region options
  - Billing information
  - Danger zone (account deletion)

### Changed
- Updated App.tsx with 5 new protected routes
- Enhanced sidebar with logout functionality
- Added role badges throughout UI
- Improved navigation flow

### Security
- ✅ All dashboard pages now protected
- ✅ Auto-redirect to /auth if not logged in
- ✅ Session management with Supabase
- ✅ Protected route wrapper implemented

---

## [0.2.0] - 2025-11-14

### Added
- **Backend Infrastructure (Lovable Cloud)**
  - Connected Lovable Cloud (PostgreSQL + Supabase Auth + Storage)
  - Created complete database schema:
    - `profiles` table for user data
    - `vendor_profiles` table for wedding service providers
    - `wedding_plans` table for couple's planning
    - `bookings` table for vendor reservations
    - `reviews` table for vendor ratings
  - Configured Row-Level Security (RLS) policies on all tables
  - Created database triggers for automation:
    - Auto-create profile on user signup
    - Auto-update vendor ratings on new review
    - Auto-update timestamps
  - Added database indexes for performance optimization
  
- **Authentication System**
  - Created `/auth` page with login and signup forms
  - Implemented email/password authentication
  - Added role selection (couple/vendor) during signup
  - Automatic profile creation on registration
  - Email auto-confirm enabled for faster testing
  - Error handling and validation
  - Toast notifications for user feedback
  
- **Navigation & CTA Updates**
  - All CTA buttons now redirect to `/auth`
  - Header buttons link to authentication page
  - Mobile menu buttons updated
  - Hero section CTAs connected

### Changed
- Configured Supabase Auth to auto-confirm emails (development mode)
- Updated App.tsx to include auth route
- Enhanced error messages for authentication flows

### Security
- ✅ RLS policies implemented on all tables
- ✅ Couples can only access their own wedding plans
- ✅ Vendors can only modify their own profiles
- ✅ Bookings visible only to couple and vendor
- ✅ Reviews require completed bookings
- ✅ Automatic profile creation is secure (SECURITY DEFINER)

---

## [0.1.0] - 2025-11-14

### Added
- **Project Foundation**
  - Created README.md with full project documentation
  - Set up design system with rose gold & champagne theme
  - Configured Tailwind CSS with custom colors and animations
  - Added semantic color tokens to index.css
  
- **Landing Page Components**
  - Header with navigation and mobile menu
  - Hero section with CTA and stats
  - Features showcase (6 key features)
  - AI Showcase with 3 main AI functions
  - How It Works section (4 steps)
  - Stats section with market data
  - CTA section with email signup
  - Footer with links and information
  
- **Assets**
  - Generated 4 AI images:
    - hero-wedding.jpg (elegant couple at sunset)
    - ai-visualizer.jpg (AI wedding planning interface)
    - invitation-creator.jpg (wedding invitation card)
    - marketplace.jpg (vendor marketplace UI)
  
- **Design System**
  - Custom color palette: wedding-rose, wedding-gold, wedding-blush, wedding-champagne
  - Custom gradients: gradient-hero, gradient-elegant
  - Custom shadows: shadow-elegant, shadow-card
  - Custom animations: fade-in, float, shimmer
  
- **SEO Optimization**
  - Updated meta tags in index.html
  - Added descriptive title and description
  - Added Open Graph tags
  - Semantic HTML structure

### Changed
- Replaced default project title with "WeddingTech UZ - AI-Powered Wedding Platform"
- Updated color scheme from default to elegant wedding theme
- Improved responsive design system

### Removed
- Default App.css styles
- Template placeholder content

---

## Version History Summary

| Version | Date | Type | Description |
|---------|------|------|-------------|
| 0.3.0 | 2025-11-14 | Feature | Core Pages (Dashboard, Marketplace, Planner, Profile, Settings) |
| 0.2.0 | 2025-11-14 | Feature | Backend & Authentication |
| 0.1.0 | 2025-11-14 | Initial | Foundation & Landing Page |

---

## Development Phases

### ✅ Phase 0: Foundation (Complete - 100%)
- [x] Project setup
- [x] Design system
- [x] Landing page
- [x] Backend infrastructure
- [x] Authentication system

### ✅ Phase 1: Core Pages (Complete - 100%)
- [x] Dashboard
- [x] Marketplace
- [x] Planner
- [x] Profile
- [x] Settings
- [x] Protected routes
- [x] Navigation system

### ⏸️ Phase 2: Data & Detail Pages (Next - 0%)
- [ ] Sample vendors data
- [ ] Vendor detail page
- [ ] Wedding plan creation
- [ ] Booking system
- [ ] Reviews system

### ⏸️ Phase 3: Advanced Features
- [ ] Guest list management
- [ ] Budget calculator
- [ ] Timeline builder
- [ ] Notifications

### ⏸️ Phase 4: AI Features
- [ ] AI Wedding Visualizer
- [ ] AI Invitation Creator
- [ ] Virtual Try-On

### ⏸️ Phase 5: FinTech
- [ ] Payment integration
- [ ] Escrow system
- [ ] Gift registry
- [ ] Installments

---

## Notes

### Breaking Changes
Пока нет breaking changes.

### Deprecations
Пока нет deprecations.

### Security
- Все данные пока локальные (dev mode)
- Production security будет настроена при переходе на Lovable Cloud

---

**Формат записей:**

### Added
Для новых функций.

### Changed
Для изменений в существующих функциях.

### Deprecated
Для функций, которые скоро будут удалены.

### Removed
Для удалённых функций.

### Fixed
Для исправлений багов.

### Security
Для изменений в безопасности.

---

**Last Updated:** 14 ноября 2025
