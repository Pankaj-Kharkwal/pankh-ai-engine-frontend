# Pankh AI Workflow System - Architecture Diagram

## Complete End-to-End Flow

```mermaid
graph TB
    subgraph "User Interface"
        A[WorkflowBuilder Canvas]
        B[AI Generator Button]
        C[Block Palette]
        D[Node Config Panel]
        E[Run Workflow Button]
        F[Execution Monitor]
    end

    subgraph "AI Workflow Generation"
        B --> G[AIWorkflowGenerator Modal]
        G --> H[Enter Description]
        H --> I[API: /ai/generate-workflow]
        I --> J[AI Response Processing]
        J --> K[handleApplyAIWorkflow]
        K --> A
    end

    subgraph "Block Customization"
        A --> |Click Node| D
        D --> L[Parameter Form]
        L --> M{Save as Preset?}
        M --> |Yes| N[localStorage]
        M --> |No| O[Update Node Config]
        N --> |Load Preset| L
    end

    subgraph "Workflow Execution"
        E --> P[Validate Nodes]
        P --> Q{Workflow Saved?}
        Q --> |No| R[Auto-save Workflow]
        Q --> |Yes| S[API: POST /workflows/id/run]
        R --> S
        S --> T[Execution Started]
        T --> U[SSE Connection: /executions/id/stream]
    end

    subgraph "Real-Time Monitoring (SSE)"
        U --> V[EventSource Connection]
        V --> W{SSE Event Received}
        W --> |Node Update| X[Update Node Status on Canvas]
        W --> |Execution Data| Y[Update Execution Monitor]
        W --> |Completed/Failed| Z[Close SSE Connection]
        X --> A
        Y --> F
    end

    subgraph "Backend Services"
        I --> BA[Azure OpenAI Service]
        S --> BB[Celery Worker Pool]
        BB --> BC[Block Execution Engine]
        BC --> BD[Redis Result Store]
        BD --> U
    end

    style A fill:#e1f5ff
    style B fill:#f3e5f5
    style D fill:#fff3e0
    style E fill:#c8e6c9
    style F fill:#ffecb3
    style G fill:#f3e5f5
    style N fill:#e1bee7
    style U fill:#ffccbc
    style V fill:#ffccbc
```

## Component Architecture

```mermaid
graph LR
    subgraph "Frontend Components"
        WB[WorkflowBuilder]
        NC[NodeConfigPanel]
        AIW[AIWorkflowGenerator]
        EM[ExecutionMonitor]
        BP[BlockPalette]
        BPF[BlockParameterForm]
    end

    subgraph "State Management"
        NS[Node State - useNodesState]
        ES[Edge State - useEdgesState]
        EX[Execution State - useState]
        PS[Preset State - localStorage]
        SSE[SSE Connection State]
    end

    subgraph "API Services"
        API[apiClient]
        CREATE[createWorkflow]
        RUN[runWorkflow]
        GEN[generateWorkflow]
        TEST[testNode]
    end

    WB --> NS
    WB --> ES
    WB --> EX
    WB --> SSE
    WB --> AIW
    WB --> EM
    WB --> NC
    WB --> BP

    NC --> BPF
    NC --> PS

    AIW --> GEN
    WB --> CREATE
    WB --> RUN
    BPF --> TEST

    API --> CREATE
    API --> RUN
    API --> GEN
    API --> TEST
```

## Data Flow Sequence

```mermaid
sequenceDiagram
    participant User
    participant UI as WorkflowBuilder
    participant AIG as AI Generator
    participant Backend
    participant SSE as SSE Stream
    participant Canvas as React Flow Canvas

    Note over User,Canvas: 1. AI Workflow Generation
    User->>UI: Click "AI Generate"
    UI->>AIG: Open Modal
    User->>AIG: Enter Description
    AIG->>Backend: POST /ai/generate-workflow
    Backend->>AIG: AI Workflow JSON
    AIG->>UI: handleApplyAIWorkflow
    UI->>Canvas: Render Nodes & Edges

    Note over User,Canvas: 2. Block Customization
    User->>Canvas: Click Node
    Canvas->>UI: Select Node
    UI->>UI: Open NodeConfigPanel
    User->>UI: Edit Parameters
    User->>UI: Save as Preset
    UI->>UI: localStorage.setItem

    Note over User,Canvas: 3. Workflow Execution
    User->>UI: Click "Run Workflow"
    UI->>Backend: POST /workflows/{id}/run
    Backend->>UI: Execution ID
    UI->>SSE: EventSource(/executions/{id}/stream)

    Note over User,Canvas: 4. Real-Time Updates
    loop Every Node Update
        Backend->>SSE: Node State Update
        SSE->>UI: onmessage Event
        UI->>Canvas: Update Node Status
    end

    Backend->>SSE: Execution Completed
    SSE->>UI: Final Status
    UI->>SSE: Close Connection
    UI->>Canvas: Show Final State
```

## Block Execution Flow

```mermaid
flowchart TD
    Start([User Clicks Run]) --> Check{Nodes<br/>Configured?}
    Check --> |No| Error1[Show Error:<br/>Add Blocks]
    Check --> |Yes| Saved{Workflow<br/>Saved?}

    Saved --> |No| Save[Auto-Save<br/>Workflow]
    Saved --> |Yes| Execute
    Save --> Execute[API: runWorkflow]

    Execute --> Backend[Backend<br/>Celery Worker]
    Backend --> Init[Initialize<br/>Execution]

    Init --> SSEOpen[Open SSE<br/>Connection]
    SSEOpen --> Process[Process<br/>Workflow Graph]

    Process --> Node1{For Each<br/>Node}
    Node1 --> SSESend1[SSE: Node Pending]
    SSESend1 --> ExecNode[Execute<br/>Block Code]

    ExecNode --> Success{Success?}
    Success --> |Yes| SSESend2[SSE: Node Complete]
    Success --> |No| SSESend3[SSE: Node Failed]

    SSESend2 --> Next{More<br/>Nodes?}
    SSESend3 --> Next

    Next --> |Yes| Node1
    Next --> |No| Final{All<br/>Success?}

    Final --> |Yes| SSEFinal1[SSE: Workflow Complete]
    Final --> |No| SSEFinal2[SSE: Workflow Failed]

    SSEFinal1 --> Close[Close SSE]
    SSEFinal2 --> Close
    Close --> End([Execution<br/>Finished])

    Error1 --> End

    style Start fill:#c8e6c9
    style End fill:#ffcdd2
    style SSEOpen fill:#ffccbc
    style SSESend1 fill:#ffccbc
    style SSESend2 fill:#ffccbc
    style SSESend3 fill:#ffccbc
    style SSEFinal1 fill:#ffccbc
    style SSEFinal2 fill:#ffccbc
```

## Preset Management System

```mermaid
graph TD
    A[Node Configuration Panel] --> B{User Action}

    B --> |Edit Params| C[Parameter Form]
    C --> D[Update Config State]

    B --> |Save Preset| E[Open Preset Dialog]
    E --> F[Enter Name & Description]
    F --> G[Create Preset Object]
    G --> H[Save to localStorage]
    H --> I[Update Presets List]
    I --> A

    B --> |Load Preset| J[Click Preset Card]
    J --> K[Read from localStorage]
    K --> L[Apply to Config State]
    L --> C

    B --> |Delete Preset| M[Click Delete Icon]
    M --> N[Remove from localStorage]
    N --> I

    style A fill:#e1f5ff
    style E fill:#f3e5f5
    style H fill:#e1bee7
    style K fill:#e1bee7
```

## SSE vs WebSocket Comparison

```mermaid
graph TB
    subgraph "SSE Implementation (Chosen)"
        SSE1[Client: EventSource API]
        SSE2[Server: HTTP Stream]
        SSE3[One-Way: Server → Client]
        SSE4[Auto-Reconnect Built-in]
        SSE5[HTTP/2 Compatible]
        SSE6[Lower Overhead]

        SSE1 --> SSE2
        SSE2 --> SSE3
        SSE3 --> SSE4
        SSE4 --> SSE5
        SSE5 --> SSE6
    end

    subgraph "WebSocket Alternative (Not Chosen)"
        WS1[Client: WebSocket API]
        WS2[Server: WebSocket Protocol]
        WS3[Two-Way: Client ↔ Server]
        WS4[Manual Reconnect Logic]
        WS5[Separate Protocol]
        WS6[Higher Overhead]

        WS1 --> WS2
        WS2 --> WS3
        WS3 --> WS4
        WS4 --> WS5
        WS5 --> WS6
    end

    SSE6 -.->|Better for<br/>One-Way Updates| Choice{Selected:<br/>SSE}
    WS6 -.->|Better for<br/>Two-Way Chat| Choice

    style SSE6 fill:#c8e6c9
    style WS6 fill:#ffcdd2
    style Choice fill:#fff9c4
```

## Technology Stack & Integration

```mermaid
graph TB
    subgraph "Frontend Stack"
        React[React 19]
        TS[TypeScript]
        XY[XY Flow/React]
        RQ[React Query]
        Zustand[Zustand]
    end

    subgraph "UI Components"
        Tailwind[TailwindCSS]
        Lucide[Lucide Icons]
        Framer[Framer Motion]
    end

    subgraph "API Integration"
        SSE[EventSource SSE]
        API[REST API Client]
        Azure[Azure OpenAI]
    end

    subgraph "State & Storage"
        LS[localStorage Presets]
        RS[React State]
        NS[Node State]
    end

    React --> XY
    React --> RQ
    React --> Zustand
    TS --> React

    XY --> NS
    RQ --> API
    API --> SSE
    API --> Azure

    RS --> LS
    Tailwind --> React
    Lucide --> React
    Framer --> React

    style React fill:#61dafb
    style XY fill:#ff69b4
    style SSE fill:#ffccbc
    style Azure fill:#0089d6
```

## Design Patterns Used

### 1. Observer Pattern (SSE)
```
EventSource (Observer) → Backend (Subject) → Node Updates
```

### 2. Facade Pattern (API Client)
```
Components → apiClient → Backend APIs
```

### 3. Strategy Pattern (Block Execution)
```
Block Type → Execution Strategy → Result
```

### 4. Factory Pattern (Node Creation)
```
Block Definition → Node Factory → React Flow Node
```

### 5. Repository Pattern (Preset Storage)
```
Preset Operations → localStorage Repository → Data Persistence
```

## Key Features Summary

| Feature | Technology | Status |
|---------|-----------|--------|
| Visual Workflow Builder | React Flow | ✅ Complete |
| AI Workflow Generation | Azure OpenAI API | ✅ Complete |
| Block Customization | React State + localStorage | ✅ Complete |
| Parameter Presets | localStorage | ✅ Complete |
| Real-Time Execution | SSE (EventSource) | ✅ Complete |
| Workflow Execution | Backend API + Celery | ✅ Complete |
| Live Node Status | SSE Updates | ✅ Complete |
| Execution Monitoring | React Components | ✅ Complete |

## Performance Characteristics

```mermaid
graph LR
    A[User Action] -->|< 10ms| B[UI Response]
    B -->|< 100ms| C[API Call]
    C -->|3-10s| D[AI Generation]
    C -->|< 500ms| E[Workflow Save]
    C -->|< 1s| F[Execution Start]
    F -->|Real-time| G[SSE Updates]
    G -->|< 50ms| H[Canvas Update]

    style A fill:#c8e6c9
    style D fill:#fff9c4
    style G fill:#ffccbc
    style H fill:#e1f5ff
```
