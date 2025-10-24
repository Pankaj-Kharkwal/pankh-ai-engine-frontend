# Pankh AI Engine - Frontend

Frontend application for Pankh AI Engine - AI-Native Workflow Automation Platform

## Overview

This is the separated frontend repository for the Pankh AI Engine. It provides a modern, React-based user interface for building and managing AI-powered workflows.

The frontend is decoupled from the backend to allow frontend developers to work independently without needing to run the full backend infrastructure locally.

## Architecture

The frontend is built with:
- **React 19** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **TailwindCSS** - Utility-first CSS
- **XY Flow** - Workflow visualization
- **Zustand** - State management
- **React Query** - Data fetching and caching
- **Monaco Editor** - Code editing
- **Playwright** - E2E testing

## Getting Started

### Prerequisites

- Node.js 22 or higher
- npm or yarn
- Access to Pankh AI Engine backend (running on AKS or locally)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Pankaj-Kharkwal/pankh-ai-engine-frontend.git
cd pankh-ai-engine-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and update the following values:
- `VITE_API_URL` - Backend API URL (e.g., `https://backend-dev.pankh.ai/api/v1`)
- `VITE_WS_URL` - WebSocket URL (e.g., `wss://backend-dev.pankh.ai/ws`)
- `VITE_API_PROXY_TARGET` - Proxy target for development (e.g., `https://backend-dev.pankh.ai`)
- `VITE_API_KEY` - Your API key for authentication
- Azure OpenAI credentials (if using AI block generation)

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Connecting to Backend

#### Option 1: AKS Backend (Recommended for Frontend Developers)

The default configuration connects to the AKS-deployed backend. This allows frontend developers to work without running the backend locally.

Update your `.env`:
```env
VITE_API_URL=https://backend-dev.pankh.ai/api/v1
VITE_WS_URL=wss://backend-dev.pankh.ai/ws
VITE_API_PROXY_TARGET=https://backend-dev.pankh.ai
```

#### Option 2: Local Backend

If you need to test against a local backend:

1. Ensure the backend is running on `http://localhost:8000`
2. Update your `.env`:
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/ws
VITE_API_PROXY_TARGET=http://localhost:8000
```

## 🎯 Core Features 
### 1. **Visual Workflow Builder** 
  - **React Flow Integration**: Drag-and-drop workflow creation 
  - **Block Library**: Browse, search, and add workflow blocks 
  - **Smart Connections**: Automatic parameter mapping validation 
  - **Template Resolution**: Real-time {{ node.output }} syntax highlighting 
  - **Dependency Visualization**: Clear node relationship display 
### 2. **Block Management** 
- **Block Registry Explorer**: View all available blocks with metadata 
- **Dynamic Block Creation**: AI-assisted block generation 
- **Block Testing**: Isolated block execution and validation 
- **Version Control**: Block versioning and rollback capabilities 
- **Custom Block Editor**: Code editor for advanced users 
### 3. **Workflow Execution & Monitoring** 
- **Real-time Execution**: Live workflow progress tracking 
- **Gluon Analytics**: Performance metrics, circuit breaker status 
- **Execution History**: Past runs with detailed logs 
- **Debug Mode**: Step-by-step execution with parameter inspection 
- **Error Visualization**: Clear error states and recovery options 

### 4. **Advanced Features** 
- **Template Playground**: Test parameter resolution patterns 
- **Performance Dashboard**: Gluon system metrics and insights 
- **Collaboration**: Workflow sharing and team management 
- **Export/Import**: Workflow backup and migration tools 
- **API Integration**: Direct connection to PankhAI API endpoints 
## 🎨 Design System ### **Glassmorphic Theme** 
- **Primary Colors**: Deep blue gradients (#1e3a8a → #3b82f6) 
- **Glass Effects**: Frosted glass cards with blur and transparency 
- **Accent Colors**: Cyan (#06b6d4), Emerald (#10b981), Amber (#f59e0b) 
- **Typography**: Inter font family for clarity and modern feel 
- **Shadows**: Multi-layered shadows for depth and elevation 
- **Animations**: Smooth transitions and micro-interactions 
### **Accessibility Standards** 
- **WCAG 2.1 AA Compliance**: High contrast ratios and screen reader support 
- **Keyboard Navigation**: Full keyboard accessibility 
- **Focus Management**: Clear focus indicators and logical tab order 
- **Responsive Design**: Mobile-first approach with breakpoints 
- **Dark/Light Mode**: System preference detection with toggle 
## 🛠 Technical Architecture ### **Frontend Stack** - **React 18**: Latest features with concurrent rendering - **TypeScript**: Type safety and better developer experience - **React Flow**: Visual workflow editor and renderer - **Tailwind CSS**: Utility-first CSS with glassmorphic components - **Zustand**: Lightweight state management - **React Query**: Server state management and caching - **Framer Motion**: Smooth animations and transitions ### **Backend Stack** - **Node.js**: Server runtime with Express.js framework - **TypeScript**: Consistent typing across frontend and backend - **WebSockets**: Real-time workflow execution updates - **Redis**: Caching and session management - **Docker**: Containerized deployment matching existing architecture ## 📡 API Integration ### **PankhAI API Endpoints**
Base URL: http://api:8000/api/v1/
Authentication: X-API-Key header

Workflows:
- GET /workflows - List all workflows
- POST /workflows - Create new workflow
- GET /workflows/{id} - Get workflow details
- POST /workflows/{id}/run - Execute workflow
- GET /executions/{id} - Get execution status

Blocks:
- GET /blocks - List available blocks
- GET /blocks/{type} - Get block metadata
- POST /blocks/test - Test block execution

Registry:
- GET /registry/stats - Block registry statistics
- POST /registry/generate - AI block generation
### **WebSocket Events**
javascript
// Real-time execution updates
ws.on('workflow.started', (data) => {})
ws.on('workflow.node.completed', (data) => {})
ws.on('workflow.completed', (data) => {})
ws.on('workflow.error', (data) => {})

// Gluon system metrics
ws.on('gluon.performance', (data) => {})
ws.on('gluon.circuit_breaker', (data) => {})
ws.on('gluon.trace', (data) => {})
## 📱 User Interface Screens ### **1. Dashboard** (/) - **Overview Cards**: Active workflows, recent executions, system health - **Quick Actions**: Create workflow, run last workflow, view metrics - **Gluon Status**: Real-time performance and health indicators - **Recent Activity**: Timeline of workflow executions and changes ### **2. Workflow Builder** (/workflows/create) - **Canvas Area**: React Flow workspace with zoom and pan - **Block Palette**: Categorized block library with search - **Property Panel**: Node configuration and parameter settings - **Toolbar**: Save, run, validate, export workflow options - **Minimap**: Navigation aid for large workflows ### **3. Workflow Gallery** (/workflows) - **Grid/List View**: Workflow thumbnails with metadata - **Filters**: Status, tags, date created, execution frequency - **Search**: Full-text search across workflow names and descriptions - **Bulk Actions**: Delete, duplicate, export multiple workflows ### **4. Execution Monitor** (/executions) - **Live View**: Real-time execution progress with node states - **Execution History**: Paginated list of past runs - **Detailed View**: Full execution logs, parameters, and outputs - **Performance Metrics**: Gluon analytics per execution ### **5. Block Manager** (/blocks) - **Block Registry**: Browse all available blocks with documentation - **Block Editor**: Create and modify custom blocks - **Test Bench**: Isolated block testing environment - **AI Generator**: Generate blocks using natural language ### **6. Debug Console** (/debug) - **Parameter Inspector**: Real-time template resolution preview - **Execution Stepper**: Step-through debugging mode - **Log Viewer**: Structured logs with filtering and search - **Performance Profiler**: Gluon system performance analysis ### **7. Settings** (/settings) - **API Configuration**: Endpoint and authentication settings - **Theme Settings**: Dark/light mode and color preferences - **Performance Tuning**: Gluon system configuration options - **User Preferences**: Layout, notifications, and accessibility ## 🏗 Project Structure
webui/
├── frontend/                 # React TypeScript app
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── blocks/       # Block-related components
│   │   │   ├── workflows/    # Workflow builder components
│   │   │   ├── ui/           # Base UI components (glassmorphic)
│   │   │   └── layout/       # Layout and navigation
│   │   ├── pages/            # Route components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── stores/           # Zustand state management
│   │   ├── services/         # API integration
│   │   ├── types/            # TypeScript definitions
│   │   └── styles/           # Tailwind and custom CSS
│   ├── public/               # Static assets
│   └── package.json          # Dependencies and scripts
│
├── backend/                  # Node.js Express server
│   ├── src/
│   │   ├── routes/           # API route handlers
│   │   ├── middleware/       # Authentication, CORS, etc.
│   │   ├── services/         # Business logic
│   │   ├── types/            # Shared TypeScript types
│   │   └── utils/            # Helper functions
│   └── package.json          # Server dependencies
│
├── docker-compose.yml        # Multi-container orchestration
├── Dockerfile.frontend       # Frontend container
├── Dockerfile.backend        # Backend container
└── README.md                 # This documentation
## 🚀 Development Workflow ### **Phase 1: Foundation** 1. Setup React + TypeScript + Vite 2. Configure Tailwind with glassmorphic components 3. Implement basic routing and layout 4. Create base UI component library ### **Phase 2: Core Features** 1. React Flow workflow builder integration 2. API service layer with React Query 3. Block palette and property panels 4. Workflow execution monitoring ### **Phase 3: Advanced Features** 1. Real-time WebSocket integration 2. Gluon analytics dashboard 3. Debug console and performance profiler 4. Block manager and AI generation ### **Phase 4: Polish & Deploy** 1. Accessibility compliance testing 2. Performance optimization 3. Docker containerization 4. CI/CD pipeline integration ## 🎯 Success Metrics - **User Experience**: Intuitive workflow creation in under 2 minutes - **Performance**: Sub-100ms UI interactions, real-time updates - **Reliability**: 99.9% uptime with graceful error handling - **Scalability**: Support 100+ concurrent users - **Accessibility**: WCAG 2.1 AA compliance score ## 📋 Next Steps 1. **Approve this plan** - Review and confirm feature scope 2. **Setup development environment** - Initialize React + Node.js projects 3. **Create base components** - Glassmorphic UI foundation 4. **Integrate React Flow** - Visual workflow builder 5. **Deploy containerized** - Docker integration with existing services --- **Ready to build the future of visual workflow creation! 🚀**