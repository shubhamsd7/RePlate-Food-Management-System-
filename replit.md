# RePlate - Food Waste Reduction Platform

## Overview

RePlate is a real-time web platform that connects restaurants with surplus food to local shelters and food banks. The application facilitates instant food donation matching through SMS notifications, location-based pairing, and gamification mechanics. Built as a hackathon-ready demonstration project, it showcases social impact through quantified metrics like carbon footprint reduction and meals saved.

**Core Purpose:** Reduce restaurant food waste (25-40% daily average) by creating frictionless donation workflows that complete in under 60 seconds.

**Key Value Propositions:**
- Real-time matching between restaurants and shelters
- SMS-based notifications for instant coordination
- Carbon impact tracking (0.76 kg CO₂ per meal saved)
- Gamified leaderboard system to encourage shelter participation
- Location intelligence using Google Maps API

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Application Pattern
**Single-Page Application (SPA)** with RESTful API backend. The frontend uses vanilla JavaScript with client-side routing, while the backend serves as a stateless API layer.

**Rationale:** Simplicity and hackathon speed. Avoids framework complexity while maintaining professional UX through progressive enhancement.

### Backend Architecture

**Technology:** Node.js with Express 5.x

**Structure:**
- `index.js` - Main Express server with RESTful endpoints
- `database.js` - PostgreSQL connection pooling module
- `github-client.js` - GitHub API integration via Octokit

**API Design Pattern:** RESTful JSON endpoints under `/api/*` namespace
- `GET /api/donations` - Fetch all food donations (available and matched)
- `GET /api/shelters` - Retrieve shelter registry
- `POST /api/donations` - Create new donation listings
- `POST /api/claim` - Match shelter to available donation

**Routing Strategy:**
- Static files served from `/public` directory
- Assets served from `/attached_assets` directory  
- SPA fallback: All non-API, non-static routes return `index.html` for client-side routing
- Admin panel served at `/admin` route

**Pros:**
- Simple to understand and modify
- No build step required
- Fast iteration for hackathons
- Easy deployment to Replit

**Cons:**
- No TypeScript type safety
- Limited scalability for complex features
- Manual dependency management

### Frontend Architecture

**Technology:** Vanilla JavaScript, HTML5, CSS3

**Design System:**
- Color scheme: Emerald green (#10b981) + Amber (#f59e0b) gradient branding
- Component-based HTML structure in single `index.html` file
- CSS custom properties for theming consistency
- Mobile-responsive design with CSS Grid and Flexbox

**Navigation Pattern:** Client-side routing without page reloads, using hash-based or history API navigation.

**State Management:** No formal state management library; relies on DOM manipulation and API polling for real-time updates.

**Rationale:** Zero build complexity, immediate browser compatibility, and easy debugging during hackathons. Matches Figma design specifications while maintaining accessibility.

### Data Storage

**Database:** PostgreSQL with connection pooling via `pg` library

**Schema Design:**
- `donations` table: Stores restaurant food postings with geolocation, expiration times, carbon metrics, and match status
- `shelters` table: Registry of participating food banks and shelters

**Key Fields in Donations:**
- `restaurant_name`, `food_type`, `quantity` - Donation details
- `latitude`, `longitude`, `address` - Geolocation data
- `expires_at` - Time-sensitive pickup window
- `status` - Tracks 'available' vs 'matched' state
- `carbon_saved` - Environmental impact calculation
- `created_at` - Timestamp for sorting and analytics

**Connection Management:** 
- SSL enforcement in production environments
- Connection pooling to handle concurrent requests efficiently
- Error handling with automatic reconnection

**Rationale:** PostgreSQL chosen for relational data integrity, JSON support for flexible schemas, and Replit's native database integration.

### Authentication & Authorization

**Current State:** No authentication system implemented

**Future Considerations:** 
- Restaurant/shelter account system would require session management or JWT tokens
- Role-based access control (RBAC) for restaurant vs shelter permissions
- Admin panel currently open; should implement basic auth or OAuth

### Geographic Services

**Google Maps API Integration:**
- Geocoding for address-to-coordinates conversion
- Distance calculation for shelter proximity matching
- Embedded map visualization (implied by location features)

**Location Matching Algorithm:** Finds nearest shelters to restaurant donations using lat/lng coordinates.

## External Dependencies

### Third-Party APIs

**Twilio SMS Service:**
- Purpose: Real-time SMS notifications when donations are posted or claimed
- Integration: Direct API calls using Twilio Node.js SDK
- Required Environment Variable: Twilio credentials (account SID, auth token, phone number)

**Google Maps API:**
- Purpose: Geocoding addresses, calculating distances, location intelligence
- Integration: Client-side JavaScript API or server-side geocoding
- Required Environment Variable: Google Maps API key

**GitHub API (Octokit):**
- Purpose: Repository management, automated commits/deployments
- Integration: `github-client.js` module with OAuth token refresh logic
- Authentication: Replit connector system with automatic token renewal
- Use Case: Likely for automated documentation or deployment workflows

### Database

**PostgreSQL:**
- Hosting: Replit-managed database or external provider
- Connection: Via `DATABASE_URL` environment variable
- SSL: Enforced in production, disabled in development
- Connection pooling prevents resource exhaustion

### NPM Packages

**Core Dependencies:**
- `express` (5.1.0) - Web server framework
- `pg` (8.16.3) - PostgreSQL client
- `twilio` (5.10.3) - SMS notifications
- `@octokit/rest` (22.0.0) - GitHub API client
- `axios` (1.12.2) - HTTP requests
- `cors` (2.8.5) - Cross-origin resource sharing
- `dotenv` (17.2.3) - Environment variable management
- `body-parser` (2.2.0) - Request parsing middleware
- `node-cache` (5.1.2) - In-memory caching

**Rationale for Stack:**
- Minimal dependencies reduce attack surface
- Well-maintained packages with active communities
- Express ecosystem provides middleware flexibility

### Environment Configuration

**Required Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Environment mode (production/development)
- `REPLIT_CONNECTORS_HOSTNAME` - Replit connector API endpoint
- `REPL_IDENTITY` or `WEB_REPL_RENEWAL` - Replit authentication tokens
- Twilio credentials (not explicitly listed but implied)
- Google Maps API key (not explicitly listed but implied)

**Configuration Management:** `.env.example` template provided for local development setup.