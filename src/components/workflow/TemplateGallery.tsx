import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Star,
  Clock,
  Users,
  Zap,
  Database,
  Globe,
  MessageSquare,
  Download,
  Eye,
  Play,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import type { Node, Edge } from "@xyflow/react";

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: string;
  nodes: Node[];
  edges: Edge[];
  author: string;
  rating: number;
  downloads: number;
  featured: boolean;
  previewImage?: string;
  useCases: string[];
  requiredBlocks: string[];
}

interface TemplateGalleryProps {
  isVisible: boolean;
  onToggleVisibility: () => void;
  onApplyTemplate: (template: WorkflowTemplate) => void;
  availableBlocks: string[];
}

const SAMPLE_TEMPLATES: WorkflowTemplate[] = [
  {
    id: "ai-content-generator",
    name: "AI Content Generator",
    description:
      "Generate blog posts, social media content, and marketing copy using AI",
    category: "content",
    tags: ["ai", "writing", "marketing", "automation"],
    difficulty: "intermediate",
    estimatedTime: "15 min",
    author: "Pankh AI",
    rating: 4.8,
    downloads: 1250,
    featured: true,
    useCases: [
      "Blog writing",
      "Social media",
      "Email marketing",
      "SEO content",
    ],
    requiredBlocks: ["azure_chat", "echo"],
    nodes: [
      {
        id: "content_input",
        type: "visualNode",
        position: { x: 100, y: 100 },
        data: {
          label: "Content Input",
          blockType: "echo",
          category: "utility",
          description: "Input content requirements",
          parameters: { message: "Write a blog post about AI automation" },
          executionState: "idle",
          color: "#f59e0b",
        },
      },
      {
        id: "ai_generator",
        type: "visualNode",
        position: { x: 400, y: 100 },
        data: {
          label: "AI Content Generator",
          blockType: "azure_chat",
          category: "ai",
          description: "Generate content using AI",
          parameters: {
            system: "You are a professional content writer.",
            prompt:
              "Generate high-quality content based on: {content_input.echo}",
            temperature: 0.7,
          },
          executionState: "idle",
          color: "#8b5cf6",
        },
      },
    ],
    edges: [
      {
        id: "e1",
        source: "content_input",
        target: "ai_generator",
        type: "smoothstep",
      },
    ],
  },
  {
    id: "data-analysis-pipeline",
    name: "Data Analysis Pipeline",
    description: "Collect, process, and analyze data from multiple sources",
    category: "data",
    tags: ["data", "analysis", "processing", "automation"],
    difficulty: "advanced",
    estimatedTime: "30 min",
    author: "Pankh AI",
    rating: 4.6,
    downloads: 890,
    featured: true,
    useCases: ["Data processing", "Analytics", "Reporting", "ETL"],
    requiredBlocks: ["searxng_search", "scrape_urls", "azure_chat", "sum"],
    nodes: [
      {
        id: "data_search",
        type: "visualNode",
        position: { x: 100, y: 100 },
        data: {
          label: "Search Data",
          blockType: "searxng_search",
          category: "data",
          description: "Search for relevant data",
          parameters: {
            query: "latest technology trends",
            limit: 5,
            timeout_sec: 15,
          },
          executionState: "idle",
          color: "#3b82f6",
        },
      },
      {
        id: "scrape_content",
        type: "visualNode",
        position: { x: 400, y: 100 },
        data: {
          label: "Scrape Content",
          blockType: "scrape_urls",
          category: "data",
          description: "Extract content from URLs",
          parameters: {
            top_n_from_searx: 3,
            max_chars_per_doc: 3000,
            timeout_sec: 20,
          },
          executionState: "idle",
          color: "#10b981",
        },
      },
      {
        id: "analyze_data",
        type: "visualNode",
        position: { x: 700, y: 100 },
        data: {
          label: "Analyze Data",
          blockType: "azure_chat",
          category: "ai",
          description: "AI-powered data analysis",
          parameters: {
            system: "You are a data analyst.",
            prompt:
              "Analyze this data and provide insights: {scrape_content.scrape_urls}",
            temperature: 0.3,
          },
          executionState: "idle",
          color: "#8b5cf6",
        },
      },
    ],
    edges: [
      {
        id: "e1",
        source: "data_search",
        target: "scrape_content",
        type: "smoothstep",
      },
      {
        id: "e2",
        source: "scrape_content",
        target: "analyze_data",
        type: "smoothstep",
      },
    ],
  },
  {
    id: "social-media-automation",
    name: "Social Media Automation",
    description:
      "Automate social media posting and engagement across platforms",
    category: "social",
    tags: ["social", "automation", "marketing", "posting"],
    difficulty: "intermediate",
    estimatedTime: "20 min",
    author: "Pankh AI",
    rating: 4.4,
    downloads: 675,
    featured: false,
    useCases: [
      "Social media",
      "Content scheduling",
      "Engagement",
      "Multi-platform",
    ],
    requiredBlocks: ["azure_chat", "echo"],
    nodes: [
      {
        id: "content_idea",
        type: "visualNode",
        position: { x: 100, y: 100 },
        data: {
          label: "Content Ideas",
          blockType: "azure_chat",
          category: "ai",
          description: "Generate social media content ideas",
          parameters: {
            system: "You are a social media strategist.",
            prompt:
              "Generate engaging social media post ideas for tech companies",
            temperature: 0.8,
          },
          executionState: "idle",
          color: "#8b5cf6",
        },
      },
      {
        id: "format_posts",
        type: "visualNode",
        position: { x: 400, y: 100 },
        data: {
          label: "Format Posts",
          blockType: "echo",
          category: "utility",
          description: "Format content for different platforms",
          parameters: {
            message:
              "Twitter: {content_idea.azure_chat}\n\nLinkedIn: {content_idea.azure_chat}\n\nInstagram: {content_idea.azure_chat}",
          },
          executionState: "idle",
          color: "#f59e0b",
        },
      },
    ],
    edges: [
      {
        id: "e1",
        source: "content_idea",
        target: "format_posts",
        type: "smoothstep",
      },
    ],
  },
  {
    id: "email-automation",
    name: "Email Marketing Automation",
    description: "Automate email campaigns, newsletters, and follow-ups",
    category: "marketing",
    tags: ["email", "marketing", "automation", "campaigns"],
    difficulty: "intermediate",
    estimatedTime: "25 min",
    author: "Pankh AI",
    rating: 4.7,
    downloads: 920,
    featured: false,
    useCases: ["Email marketing", "Newsletters", "Lead nurturing", "Campaigns"],
    requiredBlocks: ["azure_chat", "echo"],
    nodes: [
      {
        id: "segment_audience",
        type: "visualNode",
        position: { x: 100, y: 100 },
        data: {
          label: "Audience Segmentation",
          blockType: "echo",
          category: "utility",
          description: "Define target audience segments",
          parameters: { message: "Tech professionals interested in AI" },
          executionState: "idle",
          color: "#f59e0b",
        },
      },
      {
        id: "generate_content",
        type: "visualNode",
        position: { x: 400, y: 100 },
        data: {
          label: "Generate Email Content",
          blockType: "azure_chat",
          category: "ai",
          description: "Create personalized email content",
          parameters: {
            system: "You are an email marketing expert.",
            prompt: "Write a compelling email for: {segment_audience.echo}",
            temperature: 0.6,
          },
          executionState: "idle",
          color: "#8b5cf6",
        },
      },
    ],
    edges: [
      {
        id: "e1",
        source: "segment_audience",
        target: "generate_content",
        type: "smoothstep",
      },
    ],
  },
];

export default function TemplateGallery({
  isVisible,
  onToggleVisibility,
  onApplyTemplate,
  availableBlocks,
}: TemplateGalleryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"popular" | "recent" | "rating">(
    "popular",
  );
  const [selectedTemplate, setSelectedTemplate] =
    useState<WorkflowTemplate | null>(null);

  const categories = [
    { id: "all", name: "All Templates", icon: Globe },
    { id: "content", name: "Content", icon: MessageSquare },
    { id: "data", name: "Data & Analytics", icon: Database },
    { id: "social", name: "Social Media", icon: Users },
    { id: "marketing", name: "Marketing", icon: Zap },
  ];

  const filteredTemplates = useMemo(() => {
    let filtered = SAMPLE_TEMPLATES.filter((template) => {
      const matchesSearch =
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        template.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesCategory =
        selectedCategory === "all" || template.category === selectedCategory;
      const matchesDifficulty =
        selectedDifficulty === "all" ||
        template.difficulty === selectedDifficulty;

      // Check if required blocks are available
      const hasRequiredBlocks = template.requiredBlocks.every((block) =>
        availableBlocks.includes(block),
      );

      return (
        matchesSearch &&
        matchesCategory &&
        matchesDifficulty &&
        hasRequiredBlocks
      );
    });

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.downloads - a.downloads;
        case "rating":
          return b.rating - a.rating;
        case "recent":
          return 0; // For now, keep original order
        default:
          return 0;
      }
    });

    return filtered;
  }, [
    searchQuery,
    selectedCategory,
    selectedDifficulty,
    sortBy,
    availableBlocks,
  ]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.icon : Globe;
  };

  if (!isVisible) {
    return (
      <div className="fixed top-4 left-4 z-40">
        <button
          onClick={onToggleVisibility}
          className="bg-white border border-gray-300 rounded-lg p-2 shadow-lg hover:bg-gray-50"
          title="Browse Templates"
        >
          <Globe className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Workflow Templates
              </h2>
              <p className="text-gray-600 mt-1">
                Choose from pre-built workflows to get started quickly
              </p>
            </div>
            <button
              onClick={onToggleVisibility}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Filters and Search */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search */}
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="recent">Recently Added</option>
              </select>
            </div>
          </div>

          {/* Template Grid */}
          <div className="flex-1 overflow-auto p-6">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <Globe className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No templates found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search or filters, or check if required
                  blocks are available.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => {
                  const CategoryIcon = getCategoryIcon(template.category);
                  const isAvailable = template.requiredBlocks.every((block) =>
                    availableBlocks.includes(block),
                  );

                  return (
                    <div
                      key={template.id}
                      className={`border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer ${
                        template.featured
                          ? "border-blue-300 bg-blue-50"
                          : "border-gray-200 bg-white"
                      } ${!isAvailable ? "opacity-60" : ""}`}
                      onClick={() =>
                        isAvailable && setSelectedTemplate(template)
                      }
                    >
                      {/* Template Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <CategoryIcon className="w-5 h-5 text-gray-600" />
                          {template.featured && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(template.difficulty)}`}
                        >
                          {template.difficulty}
                        </span>
                      </div>

                      {/* Template Info */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {template.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {template.tags.length > 3 && (
                          <span className="px-2 py-1 text-xs text-gray-500">
                            +{template.tags.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4" />
                            <span>{template.rating}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Download className="w-4 h-4" />
                            <span>{template.downloads}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{template.estimatedTime}</span>
                        </div>
                      </div>

                      {/* Use Cases */}
                      <div className="mb-3">
                        <p className="text-xs text-gray-600 mb-1">Use cases:</p>
                        <div className="flex flex-wrap gap-1">
                          {template.useCases.slice(0, 2).map((useCase) => (
                            <span
                              key={useCase}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                            >
                              {useCase}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Availability */}
                      {!isAvailable && (
                        <div className="text-xs text-orange-600 mb-2">
                          Some required blocks not available
                        </div>
                      )}

                      {/* Action Button */}
                      <button
                        className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                          isAvailable
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                        disabled={!isAvailable}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isAvailable) {
                            onApplyTemplate(template);
                            onToggleVisibility();
                          }
                        }}
                      >
                        Use Template
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Preview Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedTemplate.name}
                </h3>
                <p className="text-gray-600 mt-1">
                  {selectedTemplate.description}
                </p>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-6">
                {/* Template Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Difficulty:</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(selectedTemplate.difficulty)}`}
                        >
                          {selectedTemplate.difficulty}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span>{selectedTemplate.estimatedTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rating:</span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span>{selectedTemplate.rating}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Downloads:</span>
                        <span>{selectedTemplate.downloads}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Requirements
                    </h4>
                    <div className="space-y-1">
                      {selectedTemplate.requiredBlocks.map((block) => (
                        <div
                          key={block}
                          className={`text-sm px-2 py-1 rounded ${
                            availableBlocks.includes(block)
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {block}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Use Cases */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Use Cases</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.useCases.map((useCase) => (
                      <span
                        key={useCase}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {useCase}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Workflow Preview */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Workflow Preview
                  </h4>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-2">
                      {selectedTemplate.nodes.length} nodes •{" "}
                      {selectedTemplate.edges.length} connections
                    </div>
                    <div className="space-y-2">
                      {selectedTemplate.nodes.map((node, index) => (
                        <div
                          key={node.id}
                          className="flex items-center space-x-3 text-sm"
                        >
                          <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <span className="font-medium">{node.data.label}</span>
                          <span className="text-gray-500">
                            ({node.data.blockType})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Actions */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onApplyTemplate(selectedTemplate);
                    setSelectedTemplate(null);
                    onToggleVisibility();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Use This Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
