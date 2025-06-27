# BillTracker Pro - Mobile Billing Application

## Overview

BillTracker Pro is a comprehensive billing and customer management platform with dual interfaces: a mobile-first billing application for day-to-day operations and a desktop-optimized admin dashboard for comprehensive business management. Built with React, TypeScript, and Express.js, the platform provides complete solutions for managing clients, creating invoices, tracking payments, generating reports, and administering user accounts through responsive, intuitive interfaces.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Validation**: Zod schemas shared between client and server
- **Session Management**: PostgreSQL-based session storage

### Dual Interface Design
- **Mobile-First Billing App**: Optimized for mobile devices with max-width container, touch-friendly interface, and progressive web app capabilities
- **Desktop Admin Dashboard**: Comprehensive management interface with sidebar navigation, advanced analytics, and desktop-optimized workflows
- **Responsive Architecture**: Both interfaces adapt seamlessly across different screen sizes

## Key Components

### Database Schema
The application uses a relational database structure with the following core entities:

- **Clients**: Customer information (name, email, phone, address)
- **Invoices**: Invoice details with status tracking (draft, sent, paid, overdue)
- **Invoice Items**: Line items for each invoice with quantity, rate, and amounts
- **Payments**: Payment records linked to invoices
- **Settings**: Company configuration and defaults

### API Structure
RESTful API endpoints following conventional patterns:

**Mobile Billing App APIs:**
- `/api/clients` - Client management operations
- `/api/invoices` - Invoice CRUD operations
- `/api/payments` - Payment tracking
- `/api/settings` - Application configuration
- `/api/dashboard/stats` - Dashboard analytics

**Admin Dashboard APIs:**
- `/api/admin/dashboard/stats` - Enhanced admin analytics
- `/api/admin/customers/stats` - Customer management statistics
- `/api/admin/billing/stats` - Billing performance metrics
- `/api/admin/users` - User management operations
- `/api/admin/users/stats` - User statistics
- `/api/admin/settings` - System configuration
- `/api/admin/backup` - Backup and recovery operations

### Component Architecture

**Mobile Billing App:**
- **Layout System**: Mobile-optimized layout with sticky navigation and bottom tab bar
- **Page Components**: Dashboard, Clients, Invoices, Reports, Settings
- **Touch-Optimized Interface**: Large buttons and swipe-friendly interactions

**Admin Dashboard:**
- **AdminLayout**: Desktop-optimized sidebar navigation with collapsible menu
- **Dashboard Pages**: Comprehensive analytics, customer management, billing oversight, user administration
- **Data Tables**: Advanced filtering, sorting, and bulk operations
- **Modal Workflows**: Complex form handling and detailed entity management

**Shared Components:**
- **UI Library**: Reusable Shadcn/ui components with consistent theming
- **Form System**: React Hook Form with Zod validation across both interfaces
- **Theme Provider**: Unified dark/light mode support

## Data Flow

1. **Client Request**: User interactions trigger API calls through TanStack Query
2. **API Processing**: Express.js routes handle requests with Zod validation
3. **Database Operations**: Drizzle ORM manages PostgreSQL interactions
4. **Response Handling**: Server returns JSON responses with error handling
5. **State Updates**: TanStack Query updates client state and triggers re-renders
6. **UI Updates**: React components re-render with new data

### Key Data Patterns
- **Optimistic Updates**: Immediate UI feedback with server reconciliation
- **Real-time Sync**: Automatic background data fetching and cache invalidation
- **Error Boundaries**: Graceful error handling throughout the application
- **Loading States**: Skeleton components and loading indicators

## External Dependencies

### Core Dependencies
- **Database**: Neon Database (serverless PostgreSQL)
- **ORM**: Drizzle ORM with PostgreSQL adapter
- **UI Framework**: Radix UI primitives for accessibility
- **Styling**: Tailwind CSS for utility-first styling
- **Icons**: Lucide React for consistent iconography

### Development Tools
- **TypeScript**: Strong typing across the full stack
- **ESBuild**: Fast production bundling for server code
- **Vite**: Development server and build tool
- **Replit Integration**: Cartographer plugin for Replit environment

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 runtime
- **Database**: PostgreSQL 16 module
- **Hot Reload**: Vite development server with HMR
- **Environment Variables**: DATABASE_URL for database connection

### Production Build
- **Frontend**: Vite build outputs static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Deployment**: Autoscale deployment target on Replit
- **Port Configuration**: Server runs on port 5000, mapped to external port 80

### Build Process
1. **Frontend Build**: `vite build` compiles React application
2. **Backend Build**: `esbuild` bundles Node.js server with external packages
3. **Static Assets**: Frontend assets served from Express.js in production
4. **Database Migrations**: Drizzle Kit manages schema changes

## Changelog
- June 26, 2025: Initial setup
- June 26, 2025: Added PostgreSQL database integration with Drizzle ORM
- June 26, 2025: Added PDF invoice download functionality with PDFKit
- June 26, 2025: Added Indian Rupee (INR) currency support as default with multi-currency formatting
- June 27, 2025: Implemented comprehensive admin dashboard with desktop-optimized interface
- June 27, 2025: Added dual routing system supporting both mobile billing app and admin dashboard
- June 27, 2025: Created admin-specific components: customer management, billing oversight, user administration
- June 27, 2025: Implemented enhanced analytics and reporting for administrative users
- June 27, 2025: Added system settings management with security and backup configuration

## User Preferences

Preferred communication style: Simple, everyday language.