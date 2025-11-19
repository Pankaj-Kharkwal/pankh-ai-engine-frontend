# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pankh AI Engine Frontend - A React-based visual workflow builder for AI-powered workflow automation. Built with React 19, TypeScript, Vite, and XY Flow for visual workflow creation.

## Development Commands

### Setup
```bash
npm install                    # Install dependencies
cp .env.example .env          # Create environment file (configure API URLs)
```

### Development
```bash
npm run dev                   # Start dev server on http://localhost:3000
npm run build                 # Production build to dist/
npm run preview               # Preview production build
npm run lint                  # Run Prettier linter
npm run format                # Auto-format with Prettier
```

### Testing
```bash
npx playwright test                           # Run all Playwright e2e tests
npx playwright test tests/core.spec.ts       # Run specific test file
npx playwright test --headed                 # Run with browser visible
npx playwright test --debug                  # Run in debug mode
```

Note: Tests expect the dev server on port 3001 (configured in playwright.config.ts).

## Architecture

### Tech Stack
- **React 19** - UI library with concurrent rendering
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool with HMR
- **XY Flow (@xyflow/react)** - Visual workflow builder/canvas
- **Zustand** - Lightweight state management
- **React Query (@tanstack/react-query)** - Server state & caching
- **Monaco Editor** - Code editing for expressions
- **TailwindCSS** - Utility-first styling with glassmorphic design
- **Framer Motion** - Animations
- **Playwright** - E2E testing

### Key Directories
```
src/
├── components/
│   ├── ai/              # AI-assisted features (workflow generation, block generation)
│   ├── blocks/          # Block registry, details, testing, parameter forms
│   ├── chat/            # Chat interface components
│   ├── common/          # Reusable UI (ErrorBoundary, ThemeToggle, EnvDebug)
│   ├── execution/       # Execution monitoring, metrics, log viewer
│   ├── expression/      # Expression editor for {{ node.output }} syntax
│   ├── layout/          # Layout components (header, sidebar, navigation)
│   ├── nodes/           # Workflow node visualization components
│   └── workflow/        # Workflow builder core (palette, config panel, debugger)
├── contexts/            # React contexts (ThemeContext for dark mode)
├── hooks/               # Custom hooks (useApi, useKeyboardShortcuts, useUndoRedo)
├── pages/               # Route components (Dashboard, WorkflowBuilder, Blocks, etc.)
├── services/            # API integration (api.ts, aiService.ts, chatService.ts)
├── styles/              # Global styles and theme CSS
└── utils/               # Helper utilities
```

### Backend Integration
The frontend connects to a separate backend API (Pankh AI Engine backend).

**Environment Variables (see .env.example):**
- `VITE_API_URL` - Backend API base URL (e.g., https://backend-dev.pankh.ai/api/v1)
- `VITE_WS_URL` - WebSocket URL for real-time updates (e.g., wss://backend-dev.pankh.ai/ws)
- `VITE_API_PROXY_TARGET` - Proxy target for dev server (same as backend URL)
- `VITE_ORG_ID` - Organization ID for scoped API calls (default: 'default_org')
- `VITE_API_KEY` - API authentication key (added as X-API-Key header)
- Azure OpenAI credentials for AI block generation

**API Client (src/services/api.ts):**
- All API calls go through `ApiClient` class
- Automatically adds organization scope: `/organizations/{ORG_ID}/...`
- Automatically injects `X-API-Key` header
- Vite dev proxy configured in vite.config.ts for `/api`, `/ws`, `/health`, `/metrics`

### Core Features

**Visual Workflow Builder (pages/WorkflowBuilder.tsx)**
- Drag-and-drop workflow creation using XY Flow
- Block palette for browsing/searching workflow blocks
- Node configuration panel with parameter forms
- Real-time template resolution ({{ node.output }} syntax)
- Command palette for quick actions
- Keyboard shortcuts (see hooks/useKeyboardShortcuts.ts)
- Undo/redo support (see hooks/useUndoRedo.ts)

**Block Management (pages/Blocks.tsx)**
- Block registry explorer with search/filter
- AI-assisted block generation
- Block testing interface with parameter validation
- Block metadata viewer (inputs, outputs, dependencies)

**Execution Monitoring (pages/Executions.tsx, components/execution/)**
- Real-time workflow execution tracking via WebSocket
- Execution history with detailed logs
- Performance metrics and analytics
- Debug mode with step-by-step inspection

**Dark Mode Theme System**
- Full light/dark/system theme support (see DARK_MODE_INTEGRATION.md)
- ThemeProvider context in contexts/ThemeContext.tsx
- CSS custom properties in styles/theme.css
- ThemeToggle component in components/common/
- Persistent theme preference via localStorage

## Routing
Main routes defined in src/App.tsx:
- `/` - Dashboard (overview, quick actions, metrics)
- `/workflows` - Workflow gallery (list, search, filter)
- `/workflows/create` - Workflow builder (new workflow)
- `/workflows/:id` - Workflow builder (edit existing)
- `/workflows/demo` - Workflow demo page
- `/marketplace` - Workflow marketplace/templates
- `/chatbot` - Build-Your-Own Chatbot interface
- `/blocks` - Block registry explorer
- `/executions` - Execution monitor and history
- `/debug` - Debug console and performance profiler
- `/analytics` - Analytics dashboard
- `/admin` - Admin panel
- `/settings` - Settings page

## Code Style & Patterns

### State Management
- **Global state**: Zustand stores (minimal usage)
- **Server state**: React Query for API data fetching/caching
- **Local state**: React useState/useReducer
- **Theme state**: ThemeContext provider

### API Calls
Use the custom `useApi` hook (src/hooks/useApi.ts) which wraps React Query:
```tsx
const { data, isLoading, error } = useApi('/workflows', { method: 'GET' })
```

### Component Patterns
- Functional components with TypeScript interfaces
- Props destructuring with default values
- Error boundaries for fault isolation
- Lazy loading for large components
- Memoization for performance-critical components

### Styling
- Tailwind utility classes with dark: modifier for dark mode
- CSS custom properties (var(--bg-primary), etc.) for theme-aware colors
- Glassmorphic design system (frosted glass effects, gradients, shadows)
- Responsive design with mobile-first approach

## Deployment

### Production Deployment (Azure AKS)
- Automated via GitHub Actions on push to `master` branch
- Multi-stage Docker build (see Dockerfile)
- Static files served by Nginx (no Node.js runtime in production)
- See .github/workflows/ci.yml for CI/CD pipeline

**Required GitHub Secrets:**
- `ACR_LOGIN_SERVER`, `ACR_USERNAME`, `ACR_PASSWORD` - Azure Container Registry
- `AZURE_CREDENTIALS` - Service principal JSON
- `AKS_RESOURCE_GROUP`, `AKS_CLUSTER_NAME` - AKS cluster details

**Manual deployment:**
```bash
# Build and push to ACR
az acr build --registry pankhaidev \
  --image webui:$(git rev-parse --short HEAD) \
  --image webui:latest \
  --file Dockerfile .

# Update AKS deployment
kubectl set image deployment/webui webui=pankhaidev.azurecr.io/webui:latest -n pankh-ai
kubectl rollout status deployment/webui -n pankh-ai
```

**Monitoring:**
```bash
kubectl get pods -n pankh-ai -l app=webui          # Check pod status
kubectl logs -n pankh-ai -l app=webui --tail=100   # View logs
kubectl get ingress -n pankh-ai                    # Check ingress
```

### Development vs Production
- **Development**: Vite dev server with HMR (Dockerfile.dev)
- **Production**: Nginx serving optimized static build (Dockerfile)

## Common Tasks

### Adding a New Page
1. Create component in `src/pages/PageName.tsx`
2. Add route to `src/App.tsx` Routes
3. Add navigation link in `src/components/layout/Layout.tsx`

### Adding a New API Endpoint
1. Add method to `src/services/api.ts` ApiClient class
2. Create React Query hook in `src/hooks/useApi.ts` if needed
3. Use the hook in your component

### Styling for Dark Mode
Always use CSS custom properties or Tailwind dark: classes:
```tsx
// Good:
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
<div style={{ backgroundColor: 'var(--bg-primary)' }} />

// Bad:
<div className="bg-white text-black" />  // No dark mode support
```

### WebSocket Real-time Updates
WebSocket connection established in execution monitoring components. Events: `workflow.started`, `workflow.node.completed`, `workflow.completed`, `workflow.error`, `gluon.performance`, etc.

## Important Notes

- Node.js 22+ required (specified in package.json engines would show if present)
- Backend must be running and accessible at configured VITE_API_URL
- API calls are scoped to organization: `/organizations/{VITE_ORG_ID}/...`
- All API requests include X-API-Key header if VITE_API_KEY is set
- Playwright tests use port 3001 (different from dev server default 3000)
- Production builds use code splitting (see vite.config.ts rollupOptions.manualChunks)
- Nginx proxy configuration in nginx.conf handles API routing in production
