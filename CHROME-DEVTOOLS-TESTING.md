# Chrome DevTools E2E Testing Script
## Pankh AI Engine - Complete Testing with DevTools

---

## 🚀 Quick Start

**Dev Server Status:** ✅ Running on http://localhost:3000
**Backend API:** ✅ Running on http://localhost:8000

### Open Chrome DevTools
1. Open Chrome browser
2. Navigate to `http://localhost:3000`
3. Press `F12` or `Ctrl+Shift+I` to open DevTools
4. Arrange DevTools (recommended: dock to right side)

---

## 📋 Testing Phases with DevTools

### **PHASE 1: Initial Load & Authentication** 🔐

#### Step 1.1: Check Initial Page Load
**Open DevTools Tabs:**
- ✅ **Console** - Check for errors
- ✅ **Network** - Monitor API calls
- ✅ **Application** - Check cookies/storage

**Actions:**
1. Load `http://localhost:3000`
2. **Console Tab**: Look for errors (should be clean)
3. **Network Tab**: Check for:
   ```
   GET /  (200 OK)
   GET /assets/*.js (200 OK)
   GET /assets/*.css (200 OK)
   ```

**Expected Console Output:**
```javascript
🔧 Frontend API Configuration: {
  API_BASE_URL: "http://localhost:8000/api/v1",
  API_KEY_SET: "NO",
  ...
}
```

#### Step 1.2: Test Authentication Flow
**Navigate to Sign Up/Login:**

**Option A: If you have an account**
```javascript
// Console: Test login programmatically
fetch('http://localhost:8000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'your-email@example.com',
    password: 'your-password'
  })
})
.then(r => r.json())
.then(console.log)
```

**Option B: Sign Up New User**
1. Navigate to signup page
2. Fill form and submit
3. **Network Tab**: Watch for:
   ```
   POST /auth/signup (201 Created)
   Response: { user: {...}, token: "..." }
   ```

**DevTools Checks:**
- ✅ **Application → Cookies**: Check for session cookie
- ✅ **Network**: All requests include credentials
- ✅ **Console**: No auth errors

---

### **PHASE 2: Block Registry Testing** 🧱

#### Step 2.1: Navigate to Blocks Page
**Actions:**
1. Click "Blocks" in navigation
2. Wait for page to load

**DevTools - Network Tab:**
```
Filter: /blocks
Expected Requests:
✅ GET /blocks/registry (200 OK)
✅ GET /blocks/categories (200 OK)
✅ GET /blocks/stats (200 OK)
```

**DevTools - Console Commands:**
```javascript
// Inspect blocks data
const blocks = await fetch('http://localhost:8000/api/v1/blocks/registry', {
  credentials: 'include'
}).then(r => r.json());
console.table(blocks);

// Expected output:
// [
//   { type: "echo", enabled: true, manifest: {...} },
//   { type: "searxng_search", enabled: true, manifest: {...} },
//   { type: "azure_chat", enabled: true, manifest: {...} }
// ]
```

#### Step 2.2: Test Block Details & Testing
**Actions:**
1. Click "Details & Config" on any block (e.g., "echo")
2. Switch to "Test & Validate" tab
3. Enter test parameters:
   ```json
   {
     "message": "DevTools Test Message"
   }
   ```
4. Click "Run Test"

**DevTools - Network Tab:**
```
POST /nodes/test
Request Payload:
{
  "block_type": "echo",
  "parameters": { "message": "DevTools Test Message" }
}

Response (200 OK):
{
  "success": true,
  "result": { "echo_output": "DevTools Test Message" },
  "execution_time_ms": 45
}
```

**DevTools - Console:**
```javascript
// Manual test via console
const testResult = await fetch('http://localhost:8000/api/v1/nodes/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    block_type: 'echo',
    parameters: { message: 'Console test' }
  })
}).then(r => r.json());

console.log('✅ Block Test Result:', testResult);
```

---

### **PHASE 3: Workflow Builder Testing** 🔧

#### Step 3.1: Open Workflow Builder
**Actions:**
1. Navigate to `/workflows/create`
2. Wait for canvas to load

**DevTools - Elements Tab:**
```html
<!-- Check for React Flow canvas -->
<div class="react-flow">
  <div class="react-flow__renderer">
    <!-- Canvas should be here -->
  </div>
</div>
```

**DevTools - Console:**
```javascript
// Check React Flow state
window.__REACT_DEVTOOLS_GLOBAL_HOOK__
// Should show React is loaded

// Verify WorkflowBuilder mounted
document.querySelector('.react-flow') !== null
// Should return: true
```

#### Step 3.2: Test Block Palette
**Actions:**
1. Verify block palette is visible on left
2. Search for "echo" block
3. Drag "echo" block to canvas

**DevTools - Console (Monitor Events):**
```javascript
// Monitor node additions
window.addEventListener('reactflow:nodes-change', (e) => {
  console.log('Nodes changed:', e.detail);
});
```

#### Step 3.3: Configure Node & Test Presets
**Actions:**
1. Click the echo node on canvas
2. NodeConfigPanel should open
3. Enter parameters: `{ "message": "Test preset" }`
4. Click "Save as Preset"
5. Name: "DevTools Test Preset"
6. Save

**DevTools - Application Tab:**
```
Application → Local Storage → http://localhost:3000

Key: presets_echo
Value: [
  {
    "name": "DevTools Test Preset",
    "description": "",
    "parameters": { "message": "Test preset" },
    "createdAt": "2025-01-23T..."
  }
]
```

**DevTools - Console (Check Presets):**
```javascript
// View saved presets
const presets = JSON.parse(localStorage.getItem('presets_echo'));
console.table(presets);

// Test preset loading
console.log('✅ Preset saved successfully:', presets.length > 0);
```

---

### **PHASE 4: AI Workflow Generation Testing** 🤖

#### Step 4.1: Generate Workflow with AI
**Actions:**
1. In WorkflowBuilder, click "AI Generate" button
2. Enter description:
   ```
   Create a workflow that echoes "Hello World" and then echoes "Goodbye World"
   ```
3. Click "Generate AI Workflow"

**DevTools - Network Tab:**
```
POST /ai/generate-workflow
Request:
{
  "description": "Create a workflow...",
  "organization_id": "default_org"
}

Watch for response (may take 5-10 seconds)
Status: 200 OK
Response:
{
  "nodes": [
    { "id": "node_1", "type": "echo", "label": "...", "parameters": {...} },
    { "id": "node_2", "type": "echo", "label": "...", "parameters": {...} }
  ],
  "connections": [
    { "from": "node_1", "to": "node_2" }
  ]
}
```

**DevTools - Console:**
```javascript
// Monitor AI generation
console.log('🤖 AI Workflow Generation started...');

// After generation completes:
// Console should show: "Workflow generated:", {...}
```

#### Step 4.2: Apply Generated Workflow
**Actions:**
1. Review generated workflow in modal
2. Click "Apply to Canvas"
3. Verify nodes appear on canvas

**DevTools - Console:**
```javascript
// Check nodes were added
const nodes = document.querySelectorAll('.react-flow__node');
console.log(`✅ ${nodes.length} nodes added to canvas`);

// Inspect node data
nodes.forEach((node, i) => {
  console.log(`Node ${i}:`, node.getAttribute('data-id'));
});
```

---

### **PHASE 5: Workflow Execution with SSE** ⚡

#### Step 5.1: Save Workflow
**Actions:**
1. Enter workflow name: "DevTools E2E Test"
2. Click "Save"

**DevTools - Network Tab:**
```
POST /organizations/default_org/workflows/
Request:
{
  "name": "DevTools E2E Test",
  "graph": {
    "nodes": [...],
    "edges": [...]
  }
}

Response (201 Created):
{
  "id": "wf_abc123...",
  "name": "DevTools E2E Test",
  "created_at": "..."
}
```

**DevTools - Console:**
```javascript
// Extract workflow ID from response
// Look for: "Workflow saved successfully!"
```

#### Step 5.2: Execute Workflow & Monitor SSE
**🔥 THIS IS THE CRITICAL TEST FOR SSE!**

**Before clicking Run:**
1. Open **Network Tab**
2. Filter by: `stream` or `eventsource`
3. Keep Console open

**Actions:**
1. Click "Run Workflow" button
2. **IMMEDIATELY watch Network tab for SSE connection**

**DevTools - Network Tab (SSE Connection):**
```
🎯 LOOK FOR THIS:

Name: /executions/{id}/stream
Type: eventsource (or text/event-stream)
Status: (pending) - This means SSE is active!
Time: Will stay open during execution

Click on this request → Preview/Response tab
You should see events streaming in real-time:

data: {"status":"running","node_states":[...]}

data: {"status":"running","node_states":[{"node_id":"node_1","status":"completed",...}]}

data: {"status":"completed",...}
```

**DevTools - Console (Real-time Logs):**
```javascript
// You should see:
SSE Update: {status: "running", node_states: [...]}
SSE Update: {status: "running", node_states: [{node_id: "...", status: "completed"}]}
SSE Update: {status: "completed", ...}

// Execution finished
✅ Workflow execution completed
```

**DevTools - Elements Tab (Watch Node Colors):**
```html
<!-- Nodes should change classes during execution -->
<div class="react-flow__node" data-status="idle">     <!-- Gray -->
<div class="react-flow__node" data-status="running">  <!-- Yellow -->
<div class="react-flow__node" data-status="completed"> <!-- Green -->
```

**DevTools - Console Commands (During Execution):**
```javascript
// Check SSE connection status
const sseConnections = performance.getEntriesByType('resource')
  .filter(r => r.name.includes('/stream'));
console.log('SSE Connections:', sseConnections);

// Monitor node status updates
setInterval(() => {
  const nodes = document.querySelectorAll('.react-flow__node');
  nodes.forEach(node => {
    console.log(node.getAttribute('data-id'), node.getAttribute('data-status'));
  });
}, 1000);
```

---

### **PHASE 6: Execution Monitor Testing** 📊

#### Step 6.1: Toggle Execution Monitor
**Actions:**
1. During or after execution, click ExecutionMonitor button
2. Check Performance Metrics tab
3. Check Timeline tab

**DevTools - Elements Tab:**
```html
<!-- Verify ExecutionMonitor is visible -->
<div class="execution-monitor">
  <div class="metrics">
    <div>Total Execution Time: XXms</div>
    <div>Success Rate: 100%</div>
  </div>
</div>
```

**DevTools - Console:**
```javascript
// Check execution data
console.log('Execution Data:', window.__executionData__);
// Should show metrics, timeline, node states
```

#### Step 6.2: View Execution History
**Actions:**
1. Navigate to `/executions`
2. View recent executions list
3. Click on an execution

**DevTools - Network Tab:**
```
GET /organizations/default_org/executions/
Response: [
  {
    "id": "exec_123...",
    "workflow_id": "wf_abc...",
    "status": "completed",
    "created_at": "..."
  }
]

GET /organizations/default_org/executions/{id}
GET /organizations/default_org/executions/{id}/logs
```

---

### **PHASE 7: Advanced Testing** 🔬

#### Test 7.1: Performance Testing
**DevTools - Performance Tab:**
1. Click "Record" button
2. Execute a workflow
3. Stop recording
4. Analyze:
   - Page load time
   - React rendering time
   - SSE event handling time

**DevTools - Memory Tab:**
1. Take heap snapshot before execution
2. Execute workflow
3. Take heap snapshot after
4. Compare for memory leaks

#### Test 7.2: Network Throttling
**DevTools - Network Tab:**
1. Change throttling to "Slow 3G"
2. Execute workflow
3. Verify SSE still works

#### Test 7.3: Error Simulation
**DevTools - Console:**
```javascript
// Simulate backend error
fetch('http://localhost:8000/api/v1/workflows/invalid-id/run', {
  method: 'POST',
  credentials: 'include'
})
.then(r => r.json())
.catch(e => console.error('Expected error:', e));

// Verify error handling in UI
```

---

## 🎯 Critical Checkpoints

### ✅ Must-Pass Checks

| Check | Location | Status |
|-------|----------|--------|
| **No Console Errors** | Console Tab | ⏳ |
| **All API Calls 200 OK** | Network Tab | ⏳ |
| **SSE Connection Active** | Network Tab (EventSource) | ⏳ |
| **Presets Saved** | Application → localStorage | ⏳ |
| **Nodes Change Color** | Elements Tab | ⏳ |
| **Workflow Executes** | Console + Network | ⏳ |
| **No Memory Leaks** | Memory Tab | ⏳ |

---

## 🐛 Common Issues & DevTools Debugging

### Issue 1: SSE Not Working
**Symptoms:** No real-time updates

**Debug Steps:**
1. **Network Tab**: Look for `/stream` request
   - ✅ Should be Type: `eventsource`
   - ✅ Status should stay `(pending)`
   - ❌ If 404: Backend SSE endpoint missing
   - ❌ If CORS error: Check backend CORS config

2. **Console**: Look for SSE errors
   ```javascript
   SSE Error: {...}
   ```

3. **Check EventSource manually:**
   ```javascript
   const es = new EventSource('http://localhost:8000/api/v1/executions/test-id/stream', {
     withCredentials: true
   });
   es.onmessage = (e) => console.log('SSE Message:', e.data);
   es.onerror = (e) => console.error('SSE Error:', e);
   ```

### Issue 2: Presets Not Persisting
**Debug Steps:**
1. **Application Tab → Local Storage**
   - Check if `presets_echo` key exists
   - Verify JSON is valid

2. **Console:**
   ```javascript
   // Check localStorage quota
   const used = new Blob(Object.values(localStorage)).size;
   console.log(`localStorage used: ${used} bytes`);

   // Test write
   localStorage.setItem('test', 'value');
   console.log('Write test:', localStorage.getItem('test'));
   ```

### Issue 3: Workflow Won't Execute
**Debug Steps:**
1. **Network Tab**: Check POST to `/run`
   - Look at Request Payload
   - Check Response for error message

2. **Console:**
   ```javascript
   // Check workflow structure
   const workflow = {
     name: "Test",
     graph: { nodes: [...], edges: [...] }
   };
   console.log(JSON.stringify(workflow, null, 2));
   ```

---

## 📊 Test Results Recording

### Recording Template
```javascript
// Copy this into Console and run after each phase
const testResults = {
  timestamp: new Date().toISOString(),
  phase1_auth: '✅ PASSED',
  phase2_blocks: '✅ PASSED',
  phase3_workflow_builder: '✅ PASSED',
  phase4_ai_generation: '✅ PASSED',
  phase5_execution_sse: '✅ PASSED',
  phase6_monitoring: '✅ PASSED',
  errors: [],
  notes: 'All tests passed successfully'
};

console.table(testResults);
localStorage.setItem('e2e_test_results', JSON.stringify(testResults));
```

---

## 🚀 Quick Test Script

**Run this in Console for automated checks:**
```javascript
// E2E Quick Test
(async () => {
  console.log('🧪 Starting E2E Quick Test...\n');

  const tests = {
    'API Connection': false,
    'Blocks Load': false,
    'localStorage Works': false,
    'SSE Supported': false
  };

  // Test 1: API Connection
  try {
    const health = await fetch('http://localhost:8000/health', {
      credentials: 'include'
    }).then(r => r.json());
    tests['API Connection'] = health.status === 'ok';
    console.log('✅ API Connection:', health);
  } catch (e) {
    console.error('❌ API Connection failed:', e);
  }

  // Test 2: Blocks Load
  try {
    const blocks = await fetch('http://localhost:8000/api/v1/blocks/registry', {
      credentials: 'include'
    }).then(r => r.json());
    tests['Blocks Load'] = Array.isArray(blocks) && blocks.length > 0;
    console.log('✅ Blocks loaded:', blocks.length);
  } catch (e) {
    console.error('❌ Blocks load failed:', e);
  }

  // Test 3: localStorage
  try {
    localStorage.setItem('_test', 'ok');
    tests['localStorage Works'] = localStorage.getItem('_test') === 'ok';
    localStorage.removeItem('_test');
    console.log('✅ localStorage works');
  } catch (e) {
    console.error('❌ localStorage failed:', e);
  }

  // Test 4: SSE Support
  tests['SSE Supported'] = typeof EventSource !== 'undefined';
  console.log('✅ SSE supported:', tests['SSE Supported']);

  console.log('\n📊 Test Results:');
  console.table(tests);

  const allPassed = Object.values(tests).every(t => t === true);
  console.log(allPassed ? '✅ All tests passed!' : '❌ Some tests failed');
})();
```

---

**Ready to Test!** 🎉

1. Open Chrome: `http://localhost:3000`
2. Open DevTools: `F12`
3. Follow phases above
4. Use Console commands to verify each step

Good luck with testing! 🚀
