# BillTracker Pro - Mobile Billing Application

## Overview

BillTracker Pro is a modern mobile-first invoice tracking and billing application built with React, TypeScript, and Express.js. The application provides a comprehensive solution for managing clients, creating invoices, tracking payments, and generating reports through an intuitive mobile interface.

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

### Mobile-First Design & PWA
- **Responsive Layout**: Optimized for mobile devices with max-width container
- **Touch-Friendly Interface**: Large buttons and intuitive navigation
- **Progressive Web App**: Full PWA implementation with offline support
  - Service worker with intelligent caching strategies
  - Web app manifest with app shortcuts
  - Install prompt for home screen addition
  - Offline functionality for cached content

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
- `/api/clients` - Client management operations
- `/api/invoices` - Invoice CRUD operations
- `/api/payments` - Payment tracking
- `/api/settings` - Application configuration
- `/api/dashboard/stats` - Dashboard analytics

### Component Architecture
- **Layout System**: Mobile-optimized layout with sticky navigation
- **Page Components**: Dashboard, Clients, Invoices, Reports, Settings
- **UI Components**: Reusable Shadcn/ui components with consistent theming
- **Form Components**: Standardized form handling with validation
- **Modal System**: Dialog-based workflows for creating/editing entities

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
- June 27, 2025: Implemented multi-tenant admin dashboard with company management system
- June 27, 2025: Added admin authentication with bcrypt password hashing and session management
- June 27, 2025: Fixed company creation API and improved admin dashboard UI with colorful gradient cards
- June 27, 2025: Implemented complete user authentication system for main billing application with login/logout functionality
- June 27, 2025: Fixed critical data isolation security vulnerability in multi-tenant system - all API routes now enforce company-based data filtering
- June 27, 2025: Fixed client creation validation error by implementing separate frontend/backend validation schemas
- June 27, 2025: Fixed invoice creation validation error - implemented proper authentication and company-based data injection for invoice creation
- June 27, 2025: Fixed invoice number uniqueness constraint to be company-scoped instead of global - each company can now have their own INV-001, INV-002, etc.
- June 27, 2025: Updated dashboard stats to show real data instead of hardcoded placeholders - displays actual due invoice counts and income totals
- June 27, 2025: Fixed authentication redirect issues by improving login flow - added proper cache invalidation and full page refresh after successful login
- June 27, 2025: Updated due amount calculation to include draft invoices - removed Status dropdown from invoice creation and simplified workflow
- June 27, 2025: Cleaned up login screen by removing demo account credentials display
- June 27, 2025: Updated admin login email from admin@billtracker.com to ibadurrehman14@gmail.com
- June 27, 2025: Cleaned up admin login screen by removing default credentials display
- June 27, 2025: Converted application to Progressive Web App (PWA) with manifest, service worker, offline support, and install prompts
- June 28, 2025: Added descriptive placeholder text to all Create/Edit Company dialog input fields in admin dashboard for better UX
- June 28, 2025: Fixed admin stats calculation error when database is empty by using proper Drizzle ORM count function
- June 28, 2025: Replaced dollar symbol ($) with rupee symbol (₹) in invoice creation form line item calculations for Indian market consistency

## User Preferences

Preferred communication style: Simple, everyday language.