# Re:Plate - Food Waste Reduction Platform

## Overview

Re:Plate is a real-time web platform that connects restaurants with surplus food to local shelters and food banks. The application facilitates instant food donation matching through SMS notifications, reducing restaurant food waste (25-40% daily average) by creating frictionless donation workflows that complete in under 60 seconds.

**Core Technology**: Single-Page Application (SPA) built with React + TypeScript frontend and Node.js/Express RESTful API backend. The frontend uses client-side routing with a simple view-based navigation system, while the backend serves as a stateless API layer.

**Purpose**: Simplicity and speed. Avoids framework complexity while maintaining professional UX through progressive enhancement.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 19 with TypeScript and Vite build tooling
- **Pattern**: Single-Page Application with view-based routing (landing, restaurant dashboard, shelter dashboard)
- **State Management**: React hooks (useState, useEffect) with Context API for authentication
- **Styling**: Vanilla CSS with CSS custom properties for theming (emerald-green and amber color scheme)
- **Rationale**: Lightweight approach optimized for hackathon speed while maintaining type safety and modern development experience

**Key Components**:
- `LandingPage`: Hero section, stats display, and call-to-action flows
- `RestaurantDashboard`: Donation creation form with allergen/dietary tracking
- `ShelterDashboard`: Available donations list with claim functionality
- `AuthModal`: Shared authentication interface

**Build Configuration**: Vite with React plugin, proxy configuration routes `/api` and `/admin` to backend Express server on port 3000

### Backend Architecture

**Framework**: Express 5.x with Node.js
- **Pattern**: RESTful API with session-based authentication
- **Middleware Stack**: CORS (credentials enabled), body-parser, express-session
- **Security**: bcrypt password hashing, httpOnly cookies, secure sessions in production
- **Caching Strategy**: Disabled (`no-cache` headers) to ensure real-time data display

**API Design**:
- `/api/donations` - GET donations list (with optional restaurant filtering)
- `/api/claim` - POST claim donation endpoint
- `/api/stats` - GET platform statistics
- `/api/auth/*` - Authentication endpoints (login, signup, logout, session check)

**Authentication Flow**:
- Session-based auth with express-session
- Credentials stored in PostgreSQL with bcrypt hashing
- Session validation via `/api/auth/me` endpoint
- 24-hour session expiry with httpOnly cookies

**Rationale**: Express provides straightforward routing and middleware composition. Session-based auth chosen over JWT for simplicity and built-in CSRF protection.

### Data Storage

**Database**: PostgreSQL via `pg` connection pool
- **Connection**: Environment-based configuration with SSL in production
- **Schema**: Implied tables for users, donations, shelters (schema not explicitly defined in codebase)
- **Pool Management**: Automatic connection pooling with error event handlers

**Expected Schema Structure**:
- Users table: Restaurant accounts with business details (name, email, phone, address, cuisine type)
- Donations table: Food listings with metadata (type, quantity, expiration, allergens, dietary info, status)
- Shelters table: Shelter profiles with capacity and contact information
- Claimed donations tracking: Junction table linking donations to shelters

**Rationale**: PostgreSQL chosen for ACID compliance and relational data modeling. Connection pooling ensures efficient resource utilization.

### Authentication & Authorization

**Strategy**: Server-side sessions with cookie-based authentication
- **Password Security**: bcrypt with automatic salt generation
- **Session Storage**: In-memory (express-session default) - should migrate to PostgreSQL session store for production
- **CORS Configuration**: Credentials enabled with origin validation
- **Cookie Settings**: httpOnly, secure (production only), sameSite: lax

**User Flow**:
1. Signup creates hashed password in database
2. Login validates credentials and establishes session
3. Frontend stores user object in React Context
4. Session validated on protected API routes

**Rationale**: Session-based auth provides simpler implementation than JWT and better security for web applications (httpOnly cookies prevent XSS attacks).

## External Dependencies

### Third-Party APIs

**Twilio SMS API**:
- **Purpose**: Real-time SMS notifications when donations are claimed
- **Integration**: Direct API calls via Twilio Node.js SDK
- **Configuration**: Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables
- **Use Case**: Sends instant alerts to restaurants when shelters claim their donations

**Google Maps API** (Referenced but not implemented):
- **Purpose**: Location-based matching and distance calculations
- **Status**: Mentioned in README but no implementation found in codebase
- **Future Integration**: Would enable proximity-based donation matching

**GitHub API (Octokit)**:
- **Purpose**: Replit Connectors integration for version control
- **Implementation**: OAuth token management with caching via `github-client.js`
- **Configuration**: Uses Replit-specific environment variables (REPLIT_CONNECTORS_HOSTNAME, REPL_IDENTITY)
- **Rationale**: Enables GitHub integration within Replit development environment

### External Services

**PostgreSQL Database**:
- **Connection**: Via DATABASE_URL environment variable
- **SSL**: Enabled in production with `rejectUnauthorized: false`
- **Provider**: Likely Replit PostgreSQL or external provider (Supabase, Railway, etc.)

**Replit Connectors**:
- **GitHub Connector**: OAuth-based GitHub authentication via Replit infrastructure
- **Token Management**: Automatic refresh with expiry checking
- **Fallback**: Error handling when connectors unavailable

### NPM Dependencies

**Core Backend**:
- `express` - Web server framework
- `pg` - PostgreSQL client
- `bcrypt` - Password hashing
- `express-session` - Session management
- `cors` - Cross-origin resource sharing
- `body-parser` - Request parsing

**Frontend**:
- `react` + `react-dom` - UI library
- `typescript` - Type safety
- `vite` - Build tooling
- `axios` - HTTP client (installed but not actively used)

**Communication**:
- `twilio` - SMS notifications
- `@octokit/rest` - GitHub API integration

**Development**:
- `@vitejs/plugin-react` - React Fast Refresh
- `@types/*` - TypeScript definitions

**Rationale**: Minimal dependency footprint prioritizes hackathon velocity while maintaining production-ready capabilities for core features (auth, database, notifications).