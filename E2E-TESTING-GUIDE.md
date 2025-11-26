# End-to-End Testing Guide
## Pankh AI Engine Frontend - Complete User Journey

---

## Test Environment Setup

### Prerequisites
- ✅ Backend API running at `https://backend-dev.pankh.ai/api/v1`
- ✅ Frontend dev server ready to start
- ✅ Browser with DevTools open (Chrome/Edge recommended)
- ✅ Network connectivity to Azure OpenAI (for AI features)

### Start Testing Environment

```bash
# 1. Start the frontend dev server
npm run dev

# Expected output:
# VITE v5.x.x  ready in XXX ms
# ➜  Local:   http://localhost:3000/
# ➜  Network: use --host to expose
```

---

## Testing Checklist

### Phase 1: Authentication & Onboarding ✅

#### Test 1.1: Sign Up Flow
- [ ] Navigate to `http://localhost:3000`
- [ ] Click "Sign Up" or navigate to signup page
- [ ] Fill in registration form:
  - Email: `test-user-$(date +%s)@pankh.ai`
  - Password: `Test@123456`
  - Organization Name: `Test Org`
- [ ] Submit form
- [ ] Verify redirect to dashboard/login
- [ ] Check browser console for errors

**Expected Result:**
```
✅ User created successfully
✅ Redirected to login or dashboard
✅ No console errors
✅ Organization created
```

#### Test 1.2: Login Flow
- [ ] Enter credentials from Test 1.1
- [ ] Click "Login"
- [ ] Verify successful authentication
- [ ] Check that cookies are set (DevTools → Application → Cookies)

**Expected Result:**
```
✅ Login successful
✅ Session cookie present
✅ Redirected to dashboard
✅ User info loaded (check Network tab)
```

---

### Phase 2: Navigation & UI ✅

#### Test 2.1: Main Navigation
- [ ] Verify all nav links are visible:
  - Dashboard
  - Workflows
  - Blocks
  - Executions
  - Analytics
  - Settings
- [ ] Click each link and verify page loads
- [ ] Check for layout issues
- [ ] Test theme toggle (light/dark mode)

**Expected Result:**
```
✅ All routes accessible
✅ No 404 errors
✅ Theme toggle works
✅ Responsive layout
```

#### Test 2.2: Dashboard Overview
- [ ] Check dashboard widgets load
- [ ] Verify metrics display (if available)
- [ ] Test quick action buttons
- [ ] Check for welcome banner

**Expected Result:**
```
✅ Dashboard renders
✅ Widgets display data or placeholders
✅ No loading spinners stuck
```

---

### Phase 3: Block Management ✅

#### Test 3.1: View Block Registry
- [ ] Navigate to `/blocks`
- [ ] Verify blocks load from API
- [ ] Check registry stats cards display
- [ ] Test search functionality
- [ ] Test category filter
- [ ] Click on a block to view details

**Expected Result:**
```
✅ Blocks listed (echo, searxng_search, azure_chat, etc.)
✅ Stats show: Total Blocks, Active, Categories, Plugins
✅ Search filters blocks correctly
✅ Category dropdown works
✅ BlockDetails modal opens
```

**API Call to Monitor:**
```http
GET /api/v1/blocks/registry
Response: [ { type: "echo", manifest: {...}, enabled: true }, ... ]
```

#### Test 3.2: Block Details & Testing
- [ ] Click "Details & Config" on any block
- [ ] Navigate to "Test & Validate" tab
- [ ] Configure test parameters
- [ ] Click "Run Test"
- [ ] Verify test result displays

**Example Test (Echo Block):**
```json
Parameters:
{
  "message": "Hello from E2E test!"
}

Expected Result:
{
  "success": true,
  "output": "Hello from E2E test!",
  "execution_time_ms": < 1000
}
```

**API Call to Monitor:**
```http
POST /api/v1/nodes/test
Body: { "block_type": "echo", "parameters": { "message": "test" } }
```

#### Test 3.3: AI Block Generation
- [ ] Click "Generate AI Block" button (or open AI Assistant)
- [ ] Enter block description:
  ```
  Create a block that converts text to uppercase
  ```
- [ ] Click "Generate"
- [ ] Wait for generation (3-10 seconds)
- [ ] Verify generated block appears
- [ ] Test the generated block

**Expected Result:**
```
✅ Block generation succeeds
✅ Generated code is valid Python
✅ Block can be tested immediately
✅ Block appears in registry (if deployed)
```

**API Call to Monitor:**
```http
POST /api/v1/ai/generate-block
Body: { "description": "...", "organization_id": "..." }
```

---

### Phase 4: Workflow Creation ✅

#### Test 4.1: Manual Workflow Creation
- [ ] Navigate to `/workflows/create`
- [ ] Verify WorkflowBuilder loads
- [ ] Check block palette is visible
- [ ] Drag "echo" block to canvas
- [ ] Click the node to configure
- [ ] Set parameters:
  ```json
  {
    "message": "Workflow started!"
  }
  ```
- [ ] Click "Save Changes"
- [ ] Enter workflow name: "E2E Test Workflow"
- [ ] Click "Save"

**Expected Result:**
```
✅ Canvas renders with React Flow
✅ Block palette shows available blocks
✅ Node appears on canvas
✅ NodeConfigPanel opens on click
✅ Configuration saves successfully
✅ Workflow saves to backend
```

**API Call to Monitor:**
```http
POST /api/v1/organizations/{org_id}/workflows/
Body: {
  "name": "E2E Test Workflow",
  "graph": {
    "nodes": [...],
    "edges": [...]
  }
}
```

#### Test 4.2: Parameter Preset Management
- [ ] Click on the echo node
- [ ] Modify parameters
- [ ] Click "Save as Preset"
- [ ] Enter preset name: "Test Message Preset"
- [ ] Save preset
- [ ] Verify preset appears in list
- [ ] Create a new echo node
- [ ] Load the preset
- [ ] Verify parameters applied
- [ ] Delete the preset

**Expected Result:**
```
✅ Preset saved to localStorage
✅ Preset loads correctly
✅ Parameters match saved values
✅ Preset deleted successfully
```

**localStorage Check (DevTools):**
```javascript
// Should see:
localStorage.getItem('presets_echo')
// Returns: [{"name": "Test Message Preset", ...}]
```

---

### Phase 5: AI Workflow Generation ✅

#### Test 5.1: Generate Workflow with AI
- [ ] Click "AI Generate" button in WorkflowBuilder
- [ ] Enter description:
  ```
  Create a workflow that searches for "AI automation tools" on the web,
  then uses AI to summarize the top results
  ```
- [ ] Click "Generate AI Workflow"
- [ ] Wait for generation (5-10 seconds)
- [ ] Review generated workflow
- [ ] Click "Apply to Canvas"
- [ ] Verify nodes and connections appear

**Expected Generated Workflow:**
```
Nodes:
1. searxng_search (query: "AI automation tools", limit: 5)
2. azure_chat (system: "Summarize...", prompt: "...")
3. echo (message: "Summary: {{azure_chat.output}}")

Connections:
searxng_search → azure_chat → echo
```

**Expected Result:**
```
✅ AI generates valid workflow structure
✅ Nodes positioned automatically
✅ Edges created correctly
✅ Block types exist in registry
✅ Parameters pre-configured
```

**API Call to Monitor:**
```http
POST /api/v1/ai/generate-workflow (or similar endpoint)
Body: { "description": "..." }
Response: {
  "nodes": [...],
  "connections": [...],
  "explanation": "..."
}
```

---

### Phase 6: Workflow Execution ✅

#### Test 6.1: Simple Workflow Execution
- [ ] Create or load a simple workflow (1-2 nodes)
- [ ] Click "Run Workflow"
- [ ] Observe auto-save (if not saved)
- [ ] Verify execution starts
- [ ] Watch for SSE connection in Network tab
- [ ] Observe node status changes on canvas:
  - Gray (idle) → Yellow (running) → Green (completed)
- [ ] Check execution result in header
- [ ] Verify ExecutionMonitor shows data

**Expected Result:**
```
✅ Workflow auto-saves if needed
✅ Execution ID returned
✅ SSE connection established
✅ Node statuses update in real-time
✅ Execution completes successfully
✅ Result displayed in header
```

**Network Tab - SSE Connection:**
```
Request URL: /api/v1/executions/{id}/stream
Type: eventsource
Status: 200 (pending)

Events received:
data: {"status": "running", "node_states": [...]}
data: {"status": "completed", "node_states": [...]}
```

**Console Logs to Check:**
```javascript
SSE Update: {status: "running", node_states: [...]}
SSE Update: {status: "completed", ...}
```

#### Test 6.2: Multi-Node Workflow Execution
- [ ] Create workflow with 3+ connected nodes:
  ```
  Node 1: echo (message: "Step 1")
  Node 2: echo (message: "Step 2: {{node_1.output}}")
  Node 3: echo (message: "Final: {{node_2.output}}")
  ```
- [ ] Connect nodes in sequence
- [ ] Save workflow
- [ ] Click "Run Workflow"
- [ ] Watch execution flow through nodes sequentially
- [ ] Verify each node turns green after completion
- [ ] Check final output in ExecutionMonitor

**Expected Result:**
```
✅ Nodes execute in dependency order
✅ Each node waits for previous to complete
✅ Status updates arrive via SSE
✅ Final workflow status: "completed"
✅ All node outputs captured
```

#### Test 6.3: AI-Powered Workflow Execution
- [ ] Use the AI-generated workflow from Test 5.1
- [ ] Review and adjust parameters if needed
- [ ] Click "Run Workflow"
- [ ] Monitor execution in real-time
- [ ] Wait for completion (may take 10-30 seconds)
- [ ] Review results in ExecutionMonitor
- [ ] Check "Outputs" tab for node results

**Expected Result:**
```
✅ searxng_search executes and returns results
✅ azure_chat processes search results
✅ echo displays final summary
✅ All SSE updates received
✅ Workflow completes without errors
```

---

### Phase 7: Execution Monitoring ✅

#### Test 7.1: Real-Time Execution Monitor
- [ ] During workflow execution, toggle ExecutionMonitor
- [ ] Check Performance Metrics tab:
  - Total Execution Time
  - Average Node Time
  - Success Rate
  - Slowest/Fastest Nodes
- [ ] Check Execution Timeline tab
- [ ] Filter timeline (Last 5, Last 10, All)
- [ ] Verify events display correctly

**Expected Result:**
```
✅ Metrics calculate correctly
✅ Timeline shows all events
✅ Event filtering works
✅ Real-time updates during execution
✅ Charts/graphs render (if implemented)
```

#### Test 7.2: Execution History
- [ ] Navigate to `/executions`
- [ ] View list of recent executions
- [ ] Enter an execution ID in the monitor
- [ ] Click refresh to fetch status
- [ ] Enable auto-refresh (3s interval)
- [ ] Review execution details:
  - Overview tab: Node states
  - Metrics tab: Performance data
  - Logs tab: Execution logs
  - Outputs tab: Node outputs

**Expected Result:**
```
✅ Execution list loads (or shows "no executions")
✅ Manual execution lookup works
✅ Auto-refresh updates data
✅ All tabs display correctly
✅ Node states match actual execution
```

**API Calls to Monitor:**
```http
GET /api/v1/organizations/{org_id}/executions/
GET /api/v1/organizations/{org_id}/executions/{id}
GET /api/v1/organizations/{org_id}/executions/{id}/status
GET /api/v1/organizations/{org_id}/executions/{id}/logs
```

---

### Phase 8: Advanced Features ✅

#### Test 8.1: Template Workflows
- [ ] Navigate to `/marketplace` or Templates section
- [ ] Browse available templates (if any)
- [ ] Load a template workflow
- [ ] Customize parameters
- [ ] Execute template workflow

#### Test 8.2: Keyboard Shortcuts
- [ ] Test workflow builder shortcuts:
  - `Cmd/Ctrl + S` - Save workflow
  - `Cmd/Ctrl + Z` - Undo
  - `Cmd/Ctrl + Y` - Redo
  - `Delete` - Delete selected node
  - `Escape` - Close panels

#### Test 8.3: Error Handling
- [ ] Create a workflow with invalid parameters
- [ ] Try to execute
- [ ] Verify error message displays
- [ ] Test with disconnected backend
- [ ] Verify graceful degradation

---

## Test Results Template

### Environment Information
```
Date: 2025-01-23
Frontend Version: [git commit hash]
Backend Version: [API version]
Browser: Chrome 120.0.0.0
OS: Windows 11
```

### Test Summary

| Phase | Test | Status | Notes |
|-------|------|--------|-------|
| 1.1 | Sign Up | ⏳ | |
| 1.2 | Login | ⏳ | |
| 2.1 | Navigation | ⏳ | |
| 2.2 | Dashboard | ⏳ | |
| 3.1 | Block Registry | ⏳ | |
| 3.2 | Block Testing | ⏳ | |
| 3.3 | AI Block Gen | ⏳ | |
| 4.1 | Manual Workflow | ⏳ | |
| 4.2 | Presets | ⏳ | |
| 5.1 | AI Workflow Gen | ⏳ | |
| 6.1 | Simple Execution | ⏳ | |
| 6.2 | Multi-Node Exec | ⏳ | |
| 6.3 | AI Workflow Exec | ⏳ | |
| 7.1 | Exec Monitor | ⏳ | |
| 7.2 | Exec History | ⏳ | |
| 8.1 | Templates | ⏳ | |
| 8.2 | Shortcuts | ⏳ | |
| 8.3 | Error Handling | ⏳ | |

**Legend:** ⏳ Pending | ✅ Passed | ❌ Failed | ⚠️ Partial

---

## Common Issues & Solutions

### Issue 1: SSE Connection Fails
**Symptoms:** No real-time updates during execution

**Check:**
```javascript
// Console should show:
SSE Update: {...}

// Network tab should show:
/executions/{id}/stream (EventSource, pending)
```

**Solutions:**
- Verify backend SSE endpoint exists
- Check CORS headers allow SSE
- Ensure `withCredentials: true` in EventSource

### Issue 2: Presets Not Saving
**Symptoms:** Presets disappear after refresh

**Check:**
```javascript
// DevTools → Application → Local Storage
localStorage.getItem('presets_echo')
```

**Solutions:**
- Check browser localStorage is enabled
- Verify no browser extensions blocking localStorage
- Check for quota exceeded errors

### Issue 3: AI Generation Fails
**Symptoms:** "Failed to generate workflow" error

**Check:**
- Azure OpenAI credentials in backend
- API quota not exceeded
- Network connectivity to Azure

### Issue 4: Workflow Won't Execute
**Symptoms:** "Failed to run workflow" error

**Check:**
```javascript
// Console errors:
POST /workflows/{id}/run - 400/500

// Common causes:
- Invalid node configurations
- Missing required parameters
- Block not enabled in registry
```

---

## Automated Testing Script

For automated testing, use this Playwright script:

```typescript
// tests/e2e-complete.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Complete E2E Flow', () => {
  test('Sign up → Create Workflow → Execute → Monitor', async ({ page }) => {
    // Phase 1: Sign Up
    await page.goto('http://localhost:3000/signup');
    await page.fill('[name="email"]', `test-${Date.now()}@pankh.ai`);
    await page.fill('[name="password"]', 'Test@123456');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard|login/);

    // Phase 2: Navigate to Workflows
    await page.click('a[href="/workflows/create"]');
    await expect(page).toHaveURL('/workflows/create');

    // Phase 3: Create Workflow
    await page.click('button:has-text("AI Generate")');
    await page.fill('textarea', 'Create a simple echo workflow');
    await page.click('button:has-text("Generate")');
    await page.click('button:has-text("Apply to Canvas")');

    // Phase 4: Execute Workflow
    await page.click('button:has-text("Run Workflow")');
    await page.waitForSelector('text=Execution completed', { timeout: 30000 });

    // Phase 5: Verify Results
    const status = await page.textContent('[data-testid="execution-status"]');
    expect(status).toContain('completed');
  });
});
```

---

## Performance Benchmarks

| Operation | Target | Acceptable | Notes |
|-----------|--------|------------|-------|
| Page Load | < 1s | < 2s | Initial bundle load |
| Block List Load | < 500ms | < 1s | API call |
| Workflow Save | < 500ms | < 1s | Small workflows |
| AI Generation | < 10s | < 15s | Depends on Azure |
| Execution Start | < 1s | < 2s | Including SSE setup |
| SSE Update Latency | < 100ms | < 500ms | Real-time |
| Canvas Render (20 nodes) | < 100ms | < 300ms | React Flow |

---

## Sign-Off Criteria

Before marking E2E testing complete, ensure:

- [ ] ✅ All Phase 1-7 tests pass
- [ ] ✅ No critical console errors
- [ ] ✅ SSE connection works reliably
- [ ] ✅ AI features functional (block + workflow generation)
- [ ] ✅ Presets save and load correctly
- [ ] ✅ Workflow execution completes successfully
- [ ] ✅ Real-time monitoring displays accurate data
- [ ] ✅ No memory leaks (check DevTools Performance)
- [ ] ✅ Responsive design works (mobile/tablet)
- [ ] ✅ Dark mode works correctly

---

**Ready to Start Testing!** 🚀

Run `npm run dev` and open `http://localhost:3000` to begin.
