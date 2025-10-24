// Mock data for development when API is not available

export const mockWorkflows = [
  {
    id: "1",
    name: "AI Content Analysis",
    status: "active",
    created_at: "2025-01-15T10:00:00Z",
    graph: {
      nodes: [
        { id: "search", type: "searxng_search", parameters: { query: "AI trends 2025" } },
        { id: "analyze", type: "azure_chat", parameters: { prompt: "Analyze content" } }
      ],
      edges: [{ from_node: "search", to_node: "analyze" }]
    }
  },
  {
    id: "2",
    name: "Data Processing Pipeline",
    status: "active",
    created_at: "2025-01-14T15:30:00Z",
    graph: {
      nodes: [
        { id: "fetch", type: "http_get", parameters: { url: "https://api.example.com/data" } },
        { id: "process", type: "json_processor", parameters: { filter: "*.results" } }
      ],
      edges: [{ from_node: "fetch", to_node: "process" }]
    }
  },
  {
    id: "3",
    name: "Web Scraping Workflow",
    status: "inactive",
    created_at: "2025-01-13T09:15:00Z",
    graph: {
      nodes: [
        { id: "scrape", type: "scrape_urls", parameters: { urls: ["https://example.com"] } }
      ],
      edges: []
    }
  }
];

export const mockBlocks = [
  {
    type: "searxng_search",
    manifest: {
      name: "SearXNG Search",
      category: "data",
      summary: "Search the web using SearXNG",
      inputs: ["query"],
      outputs: ["results"]
    },
    enabled: true,
    plugin_path: null,
    last_modified: Date.now(),
    load_error: null
  },
  {
    type: "azure_chat",
    manifest: {
      name: "Azure OpenAI Chat",
      category: "ai",
      summary: "Generate responses using Azure OpenAI",
      inputs: ["prompt", "system"],
      outputs: ["response"]
    },
    enabled: true,
    plugin_path: null,
    last_modified: Date.now(),
    load_error: null
  },
  {
    type: "scrape_urls",
    manifest: {
      name: "URL Scraper",
      category: "data",
      summary: "Scrape content from web URLs",
      inputs: ["urls"],
      outputs: ["content"]
    },
    enabled: true,
    plugin_path: null,
    last_modified: Date.now(),
    load_error: null
  },
  {
    type: "http_get",
    manifest: {
      name: "HTTP GET Request",
      category: "utility",
      summary: "Make HTTP GET requests",
      inputs: ["url", "headers"],
      outputs: ["response"]
    },
    enabled: true,
    plugin_path: null,
    last_modified: Date.now(),
    load_error: null
  },
  {
    type: "echo",
    manifest: {
      name: "Echo",
      category: "utility",
      summary: "Output a message",
      inputs: ["message"],
      outputs: ["output"]
    },
    enabled: true,
    plugin_path: null,
    last_modified: Date.now(),
    load_error: null
  }
];

export const mockRegistryStats = {
  total_blocks: mockBlocks.length,
  enabled_blocks: mockBlocks.filter(b => b.enabled).length,
  categories: ["ai", "data", "utility"],
  last_updated: new Date().toISOString()
};

export const mockHealth = {
  status: "healthy",
  timestamp: new Date().toISOString(),
  services: {
    api: "online",
    database: "online",
    redis: "online"
  }
};

export const mockExecution = {
  id: "exec_123",
  workflow_id: "1",
  status: "completed",
  created_at: new Date().toISOString(),
  completed_at: new Date().toISOString(),
  results: {
    search: ["Result 1", "Result 2"],
    analyze: "Analysis complete"
  }
};