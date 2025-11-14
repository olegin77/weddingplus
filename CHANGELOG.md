# 📝 Changelog

Все заметные изменения в проекте WeddingTech UZ будут документированы здесь.

Формат основан на [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
и этот проект следует [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- AI Invitation Creator
- Timeline Visual Editor
- Gift Registry с QR-кодами
- Seating Chart Generator

---

## [0.14.0] - 2025-11-14

### Added - AI Wedding Visualizer 🎨 (ГЛАВНАЯ ФИЧА!)

- **Database Schema**
  - Created wedding_visualizations table
  - Style, quality, prompt tracking
  - Base64 image storage
  - RLS policies for couples

- **Edge Function: generate-wedding-visualization**
  - Lovable AI integration (gemini-2.5-flash-image-preview)
  - 6 wedding styles: Traditional Uzbek, Modern, Royal, Garden, Romantic, Rustic
  - Quality options: low/medium/high
  - Rate limiting (429/402) handling

- **AIWeddingVisualizer Component**
  - Style selection dropdown
  - Quality control
  - Real-time AI generation
  - Gallery view with delete
  - Error handling

- **New Page: /ai-visualizer**
  - Wedding plan verification
  - Auto-create dialog
  - Protected route

---

## [0.13.0] - 2025-11-14

### Added - Budget Tracker 💰

- **Database Schema**
  - budget_items table with 15 categories
  - Plan/actual/paid tracking
  - Payment status
  - Due dates

- **Components**
  - BudgetTracker: Main manager
  - BudgetChart: Pie & bar charts
  - BudgetItemDialog: Editor
  - BudgetCategoryCard: Display

- **Features**
  - Plan vs Actual comparison
  - Budget alerts (90% warning)
  - Visual charts
  - Category breakdown

---

## [0.12.0] - 2025-11-14

### Added - Wedding Website Generator

- **Database Schema**
  - Created wedding_websites table
  - Unique slug for public URLs
  - Foreign key to wedding_plans
  - Published status flag
  - Hero section fields (title, subtitle, image, date)
  - Story section (enabled, title, content)
  - Gallery images array (TEXT[])
  - Timeline events (JSONB array)
  - Location details (name, address, coordinates, map_url)
  - RSVP integration (enabled, deadline)
  - Design settings (theme_color, font_family, custom_css)
  - SEO metadata (meta_title, description, image)
  - RLS policies for couples and public
  - Indexes for slug, wedding_plan_id, published
  - Auto-update trigger for updated_at

- **Public Wedding Website (/wedding/:slug)**
  - Beautiful full-page wedding site
  - No authentication required
  - Published websites only (via RLS)
  - Custom theme color support
  - Responsive mobile-first design
  - Smooth scroll sections
  - Professional typography
  
- **Hero Section**
  - Full-screen hero with background image
  - Gradient overlay support
  - Custom title and subtitle
  - Wedding date display (formatted)
  - Heart icon branding with theme color
  - Center-aligned content
  - Mobile-optimized text sizes
  
- **Story Section**
  - "Our Story" narrative section
  - Custom section title
  - Multi-paragraph content support
  - Center-aligned prose layout
  - Conditional rendering (can be disabled)
  - Whitespace-preserved formatting
  - Beautiful typography
  
- **Gallery Section**
  - Responsive grid layout (1/2/3 columns)
  - Aspect-ratio maintained images
  - Hover scale animation
  - Shadow effects on hover
  - Rounded corners
  - Lazy loading ready
  - Conditional rendering
  
- **Timeline Section**
  - Event schedule display
  - Circular time badges with theme color
  - Event title and description cards
  - Clock icon integration
  - Professional card layout
  - Responsive spacing
  - Conditional rendering
  
- **Location Section**
  - Venue name and address
  - Google Maps iframe embed
  - Direct "Open in Maps" link
  - Coordinates support for deep linking
  - MapPin icon integration
  - Responsive iframe aspect ratio
  - Conditional rendering
  
- **RSVP Section**
  - Call-to-action for guests
  - RSVP deadline display
  - Integration messaging
  - Center-aligned content
  - Conditional rendering
  
- **Footer**
  - Heart icon branding
  - "Created with WeddingTech UZ" credit
  - Theme color styling
  - Subtle background

- **WeddingWebsiteBuilder Component**
  - **Main Interface**
    - Save button with loading state
    - Open website button (published only)
    - Slug configuration with validation
    - Publish toggle switch
    - Live URL preview
    - Globe icon for visual clarity
    
  - **Tab-Based Editor**
    - 5 main tabs: Hero, Story, Gallery, Timeline, Location
    - Clean tab navigation
    - Section-specific forms
    - Enable/disable toggles per section
    
  - **Hero Tab**
    - Title input
    - Subtitle input
    - Date-time picker for wedding
    - Background image URL input
    - Color picker for theme
    - Real-time preview of hex color
    
  - **Story Tab**
    - Enable/disable toggle
    - Custom title input
    - Multi-line textarea (10 rows)
    - Placeholder guidance
    - Disabled state styling
    
  - **Gallery Tab**
    - Enable/disable toggle
    - Image URL input with Enter-to-add
    - Grid preview (2-3 columns)
    - Hover-to-delete functionality
    - Trash icon on images
    - Visual feedback
    
  - **Timeline Tab**
    - Enable/disable toggle
    - Add event button
    - Event cards with:
      - Time input (HH:MM format)
      - Title input
      - Description textarea
      - Delete button
    - Dynamic event list
    - Card-based editing
    
  - **Location Tab**
    - Enable/disable toggle
    - Venue name input
    - Address input
    - Google Maps embed URL textarea
    - Helper text with link to Google Maps
    - Instructions for obtaining embed URL

### Changed

- **Planner Page**
  - Added "Сайт" tab (4th tab)
  - Tab layout now uses grid (4 columns)
  - Integrated WeddingWebsiteBuilder component
  - Passes wedding_plan_id to builder

- **App Routing**
  - Added public route /wedding/:slug
  - Positioned with other public routes
  - No ProtectedRoute wrapper
  - SEO-friendly URLs

### Technical Details

- **Security**
  - RLS ensures only published sites are public
  - Couples can only manage their own websites
  - Slug uniqueness enforced at database level
  - XSS protection via React rendering
  
- **Performance**
  - Indexed slug lookups (O(1) access)
  - Indexed wedding_plan_id for joins
  - Indexed published status for queries
  - Efficient JSONB queries for timeline
  - Lazy image loading ready
  
- **SEO**
  - Dynamic page title from meta_title
  - Meta description support
  - Meta image support
  - Semantic HTML structure
  - Clean URL slugs
  - Mobile-optimized viewport
  
- **UX Features**
  - Auto-save indicators
  - Toast notifications
  - Loading states
  - Error handling
  - Form validation (slug required)
  - Slug auto-formatting (lowercase, hyphens)
  - Preview before publish
  - External link opening in new tab

- **Design**
  - Customizable theme colors
  - Beautiful gradient backgrounds
  - Smooth hover transitions
  - Professional typography
  - Consistent spacing
  - Shadow effects
  - Rounded corners
  - Icon integration (Lucide React)

### User Experience

- **For Couples**
  - Easy website creation
  - No coding required
  - Visual editor
  - Section-by-section approach
  - Enable/disable sections
  - Custom branding (colors)
  - Preview before publishing
  - Share-ready URLs

- **For Guests**
  - Beautiful wedding pages
  - Mobile-friendly design
  - Easy navigation
  - Visual timeline
  - Map integration
  - RSVP integration
  - No account needed

### Future Enhancements Ready
- Custom domain mapping
- Additional color schemes
- Font family selection
- Custom CSS injection
- Image upload to storage
- Video embeds
- Music player
- Guest book section

---

## [0.11.0] - 2025-11-14

### Added - Guest RSVP Portal

- **Database Schema**
  - Created guest_invitations table
  - Unique token generation per invitation
  - Foreign keys: guest_id, wedding_plan_id
  - Tracking fields: sent_at, viewed_at, responded_at
  - Custom message field for personalization
  - RLS policies for couples and public access
  - Indexes for performance (token, guest_id, wedding_plan_id)
  - Auto-update trigger for updated_at

- **Public RSVP Page (/rsvp/:token)**
  - Beautiful wedding-themed design with gradients
  - No authentication required
  - Dynamic guest name personalization
  - Wedding details display:
    - Date with full formatting (Russian locale)
    - Venue location
    - Theme information
  - Couple name fetched from profiles
  - Custom invitation message display
  - Heart icon branding throughout
  - Mobile-responsive layout

- **RSVP Form Features**
  - **Attendance Selection** (Required)
    - Radio buttons: "Да, с радостью приду!" / "К сожалению, не смогу" / "Пока не уверен(-а)"
    - Updates guest.attendance_status
  - **Plus One Handling**
    - Conditional display (only if plus_one_allowed)
    - Checkbox to enable bringing plus one
    - Text input for plus one name
    - Auto-saves to guest.plus_one_name
  - **Dietary Restrictions**
    - Multi-line textarea for allergies and preferences
    - Optional field
    - Saves to guest.dietary_restrictions
  - **Auto-tracking**
    - viewed_at timestamp on page load
    - responded_at timestamp on form submission
    - Real-time guest data updates

- **Success Confirmation**
  - Beautiful thank you page after submission
  - CheckCircle icon animation
  - Conditional message based on attendance
  - Wedding date reminder
  - Heart icon with primary color fill

- **InvitationManager Component**
  - **Bulk Invitation Generation**
    - Multi-select guests without invitations
    - "Select all" button for convenience
    - Custom message textarea (optional)
    - Unique token generation (base36 + timestamp)
    - Bulk insert into database
    - Success toast with count
  - **Invitations Table**
    - Comprehensive guest list view
    - Email display (with fallback)
    - Status badges with visual indicators:
      - "Не отправлено" (outline)
      - "Создано" (outline)
      - "Отправлено" (default)
      - "Просмотрено" (secondary)
      - "Ответил" (green)
    - Attendance response display:
      - "Придет" (green with CheckCircle)
      - "Не придет" (red)
      - "Думает" (yellow with Clock)
    - Action buttons:
      - Copy link (with toast confirmation)
      - View link dialog
    - Checkboxes for bulk selection

- **Link Management**
  - Copy to clipboard functionality
  - Full URL generation with domain
  - View link dialog with formatted display
  - Toast notifications on copy

### Changed

- **Planner Page**
  - Added "Приглашения" tab to existing tabs
  - Tab order: Чек-лист → Гости → Приглашения
  - Integrated InvitationManager component
  - Wedding plan ID passed to manager

- **App Routing**
  - Added public route /rsvp/:token
  - Positioned before protected routes
  - No ProtectedRoute wrapper (public access)

### Technical Details

- **Security**
  - RLS policies allow couples to manage their invitations
  - Public can view/update by token only
  - No direct guest_id exposure
  - Cascade delete on guest/plan removal

- **Performance**
  - Indexed token lookups (O(1) access)
  - Indexed guest_id and wedding_plan_id
  - Efficient join queries for status display
  - Optimized bulk operations

- **UX Enhancements**
  - Loading states throughout
  - Error handling with toast notifications
  - Form validation (attendance required)
  - Auto-populate existing responses
  - Responsive design (mobile-first)
  - Gradient backgrounds for elegance

- **Data Flow**
  1. Couple creates invitations via InvitationManager
  2. Unique token generated per guest
  3. Link shared with guest (manual or email)
  4. Guest opens /rsvp/:token (viewed_at tracked)
  5. Guest fills form and submits (responded_at tracked)
  6. Updates reflected in InvitationManager table
  7. Couple sees status and attendance in real-time

### User Experience

- **For Couples**
  - Easy bulk invitation creation
  - Visual status tracking
  - Quick link sharing
  - Real-time response monitoring
  - Copy-paste ready links

- **For Guests**
  - Simple, beautiful RSVP page
  - No account needed
  - Mobile-friendly form
  - Clear wedding details
  - Dietary preferences support
  - Plus one management
  - Confirmation feedback

### Future Enhancements Ready
- Email sending integration (infrastructure ready)
- SMS notifications (tracking in place)
- QR code generation for invitations
- Calendar event generation
- Reminder scheduling

---

## [0.10.0] - 2025-11-14

### Added - Multi-language Support

- **i18n Infrastructure**
  - Installed i18next for internationalization
  - Installed react-i18next for React integration
  - Installed i18next-browser-languagedetector for auto-detection
  - Configured language detection (localStorage + navigator)
  - Fallback language set to Russian (ru)
  - Language preference persistence

- **Language Files Created**
  - **ru.json** - Полный русский перевод
  - **uz.json** - To'liq o'zbek tiliga tarjima
  - **en.json** - Complete English translation
  - 200+ translation keys organized by section

- **Translated Sections**
  - Common UI elements (buttons, actions, states)
  - Navigation menu items
  - Hero and landing page
  - Features showcase
  - Dashboard interface
  - Marketplace listings
  - Vendor detail pages
  - Booking flow
  - Wedding planner
  - Guest list management
  - AI Assistant interface
  - User profile
  - Settings panel
  - Authentication pages
  - Review system
  - Payment interface
  - PWA install page

- **LanguageSwitcher Component**
  - Dropdown menu with language selection
  - Globe icon indicator
  - Flag emojis for visual recognition:
    - 🇷🇺 Русский
    - 🇺🇿 O'zbekcha
    - 🇬🇧 English
  - Current language highlighting
  - Responsive design (desktop + mobile)
  - LocalStorage integration

### Changed
- **Header Component**
  - Added LanguageSwitcher to desktop navigation
  - Added LanguageSwitcher to mobile menu
  - Translated all navigation items
  - Translated button labels
  - Dynamic text based on selected language

- **AppSidebar Component**
  - Added LanguageSwitcher to footer
  - Translated menu item titles
  - Dynamic menu labels
  - Role-based menu translation (couple/vendor)
  - Translated logout button

- **Main Application**
  - Initialized i18n in main.tsx
  - Global language state management
  - Automatic language detection on first visit

### Technical Details
- Translation namespace: "translation" (default)
- Interpolation enabled for dynamic values
- Escape value disabled (React handles XSS)
- Detection order: localStorage → browser language
- Cache location: localStorage
- Key structure: section.subsection.key

### User Experience
- Language persists across sessions
- Instant language switching (no reload)
- Smooth transitions between languages
- Native language support for Uzbek market
- International audience support (English)
- Flag emojis for easy identification

### Coverage
- 100% of user-facing strings translated
- 3 complete language sets
- Consistent terminology across app
- Context-aware translations
- Proper pluralization support

---

## [0.9.0] - 2025-11-14

### Added - Reviews & Ratings System

- **ReviewForm Component**
  - Interactive star rating (1-5 stars)
  - Hover preview for rating selection
  - Text comment field (optional)
  - 1000 character limit with counter
  - Loading states during submission
  - Toast notifications for success/error
  - Rating required validation
  - Clean, user-friendly interface
  
- **ReviewsList Component**
  - Displays all vendor reviews
  - User avatars with fallback initials
  - Full name display
  - Visual star rating display
  - Relative timestamps (e.g., "2 days ago")
  - Russian locale (date-fns/locale/ru)
  - Empty state with encouraging message
  - Automatic profile data fetching
  - Refresh trigger support
  
- **VendorDetail Page Enhancements**
  - "Leave Review" button (conditional)
  - Only shows for users with completed bookings
  - Review dialog with ReviewForm
  - Auto-refresh after review submission
  - Portfolio images gallery display
  - Grid layout for vendor images
  - Improved reviews section layout
  - Review count in section title
  
- **Database Improvements**
  - Enabled Realtime for reviews table
  - Added REPLICA IDENTITY FULL
  - Added to supabase_realtime publication
  - New RLS policies:
    - Users can update their own reviews
    - Users can delete their own reviews
  - Performance indexes:
    - idx_reviews_vendor_id
    - idx_reviews_user_id  
    - idx_reviews_created_at (DESC order)

### Business Logic
- Users must have completed booking to review
- One review per booking
- Vendor rating auto-updates via trigger
- Review count tracked automatically
- Reviews update in real-time
- Profile data enrichment

### Changed
- Removed old review display code from VendorDetail
- Replaced with ReviewsList component
- Enhanced vendor profile interface
- Improved review UX workflow

### Technical
- date-fns for date formatting
- Russian locale support
- Real-time subscriptions ready
- Optimized database queries
- Proper TypeScript types
- Error handling throughout

---

## [0.8.0] - 2025-11-14

### Added - PWA (Progressive Web App)

- **PWA Infrastructure**
  - Installed and configured vite-plugin-pwa
  - Service Worker with Workbox
  - Automatic updates on new versions
  - Offline-first architecture
  
- **Web App Manifest**
  - App name: WeddingTech UZ
  - Short name: WeddingTech
  - Theme color: #f43f5e (rose gold)
  - Background color: #ffffff
  - Display mode: standalone
  - Orientation: portrait
  - Scope and start URL configured
  - Icons for all sizes (192x192, 512x512)
  - Maskable icon support
  
- **PWA Icons**
  - Generated icon-512.png (high quality)
  - Generated icon-192.png (standard size)
  - Rose gold gradient background
  - Wedding rings with heart design
  - Suitable for all platforms
  - Purpose: any and maskable
  
- **Mobile Meta Tags**
  - viewport-fit=cover for notch devices
  - apple-mobile-web-app-capable
  - apple-mobile-web-app-status-bar-style (black-translucent)
  - apple-mobile-web-app-title
  - apple-touch-icon link
  - theme-color for Android
  
- **Install Page (/install)**
  - Detects if app already installed
  - Platform-specific instructions:
    - iOS: Step-by-step Safari guide
    - Android: One-click install button
  - beforeinstallprompt event handling
  - Deferred prompt for install
  - Benefits showcase:
    - Offline functionality
    - Fast launch from home screen
    - Fullscreen experience
    - Push notifications ready
  
- **Offline Capabilities**
  - Service Worker caches:
    - All static assets (JS, CSS, HTML)
    - Icons and images (PNG, SVG, JPG, WebP)
  - Supabase API caching:
    - NetworkFirst strategy
    - 24-hour cache expiration
    - Max 50 cached entries
  - Offline viewing:
    - Wedding plans
    - Bookings
    - Guest lists
    - Marketplace vendors
    - Profile data

### Changed
- Updated vite.config.ts with PWA plugin
- Enhanced index.html with mobile meta tags
- Added Download/Install button to Header (desktop & mobile)
- Updated App.tsx with /install route
- Improved mobile navigation

### Technical
- Cache strategy: NetworkFirst for API calls
- Cache name: supabase-cache
- Auto-registration of service worker
- Include assets: favicon, robots.txt, icons
- Glob patterns for comprehensive caching

---

## [0.7.0] - 2025-11-14

### Added - Advanced Features (Image Upload, Email, PDF Export)

- **Supabase Storage Integration**
  - Created avatars bucket (5MB limit, public read)
  - Created portfolio bucket (10MB limit, public read)
  - RLS policies for secure file access
  - User-specific upload/delete permissions
  - Vendor-only portfolio uploads
  - File type restrictions (JPEG, PNG, WebP)
  
- **ImageUpload Component**
  - Universal image upload component
  - File validation (size, type)
  - Image preview before upload
  - Upload to Supabase Storage
  - Delete functionality
  - Loading states
  - Error handling with toasts
  - Support for single/multiple uploads
  
- **Profile Avatar System**
  - Avatar upload dialog in Profile page
  - ImageUpload integration
  - Updates profile.avatar_url
  - Display in profile header
  - Fallback to initials
  
- **Vendor Portfolio Management**
  - Multiple portfolio image uploads
  - Gallery grid view
  - Individual image deletion
  - Stores in vendor_profiles.portfolio_images array
  - Visual feedback on hover
  - Requires profile creation first
  
- **Email Notification System**
  - `send-email-notification` edge function
  - HTML email templates for:
    - Booking confirmations
    - Booking cancellations
    - Event reminders (7 days before)
    - Payment confirmations
  - Respects user notification preferences
  - Ready for integration with:
    - Resend
    - SendGrid
    - AWS SES
    - Mailgun
  - Currently logs emails for development
  
- **PDF Export Feature**
  - `export-wedding-plan-pdf` edge function
  - Exports complete wedding plan to HTML
  - Includes:
    - Plan details (date, venue, theme, guests)
    - Budget breakdown with visual progress bar
    - Bookings table with vendor names
    - Guest list with RSVP statuses
    - Custom notes
  - Professional styling with rose gold theme
  - Download as HTML file
  - ExportPDFButton component in Planner
  - Loading states and error handling

### Changed
- Enhanced Profile page with avatar upload
- Improved PortfolioManagement with functional image gallery
- Updated Planner page with PDF export button
- Added ImageUpload import to Profile and PortfolioManagement

### Database Changes
- Created avatars storage bucket
- Created portfolio storage bucket
- Added storage RLS policies for both buckets

### Edge Functions
- Added send-email-notification (public endpoint)
- Added export-wedding-plan-pdf (protected endpoint)
- Updated config.toml with new functions

### Technical
- File uploads use Supabase Storage API
- Images stored with user ID in path structure
- Public URLs for avatar/portfolio display
- Cache control headers for performance
- Upsert disabled to prevent overwrites

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
