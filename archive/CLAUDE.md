# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QuickPoll is a real-time polling application built with React, TypeScript, and Vite. It enables users to create quick polls and gather responses in real-time.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Type checking and build for production
npm run build

# Lint code (ESLint)
npm run lint

# Preview production build
npm run preview
```

## Project Architecture

### Tech Stack
- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite with SWC for fast compilation
- **Styling**: Tailwind CSS v4 (configured via Vite plugin)
- **Target Features** (from PRD):
  - Supabase for backend (Database + Real-time + API)
  - React Router for navigation
  - Chart.js for result visualization

### Key Files and Directories
- `src/App.tsx` - Main application component (currently template code)
- `prd/QuickPoll.md` - Product Requirements Document with full specifications
- `vite.config.ts` - Vite configuration with React SWC and Tailwind plugins
- `tsconfig.app.json` - TypeScript configuration for application code

### Database Schema (Planned - Supabase)

The PRD specifies two main tables:
- **polls**: Stores poll questions and options
- **votes**: Records individual votes with IP-based duplicate prevention

### Planned Page Structure
```
/                    - Homepage + Poll creation
/poll/:id           - Voting page
/poll/:id/results   - Results page (real-time updates)
```

## Implementation Status

The project is currently at the initial setup stage with the Vite + React template. According to the PRD, the MVP implementation should include:

### Phase 1 MVP Components (Not yet implemented)
1. Supabase setup and table creation
2. Poll creation page
3. Voting page
4. Results display page with real-time updates
5. Deployment configuration

## Key Development Considerations

### When implementing features:
1. Follow the TypeScript + React patterns established by Vite template
2. Use Tailwind CSS v4 for styling (already configured)
3. Implement components according to the PRD specifications in `prd/QuickPoll.md`
4. Ensure mobile-responsive design
5. Keep the MVP scope limited to single-choice polls with IP-based duplicate prevention

### API Structure (To be implemented)
- POST `/api/polls` - Create new poll
- GET `/api/polls/:id` - Retrieve poll data
- POST `/api/polls/:id/vote` - Submit vote

### State Management
For real-time features, integrate Supabase Realtime subscriptions as specified in the PRD.

## Testing Approach

Currently no test setup. When adding tests:
- Use Vitest for unit testing (integrates well with Vite)
- Test individual components and API integration
- Focus on core functionality: poll creation, voting, and result display