import { Star, Download, Heart, TrendingUp, Search, Filter } from 'lucide-react'

const workflows = [
  {
    id: 1,
    name: 'E-commerce Analytics Pipeline',
    author: 'DataFlow Pro',
    description: 'Complete analytics solution for e-commerce platforms with real-time dashboards',
    price: '$29.99',
    rating: 4.8,
    downloads: 1234,
    tags: ['Analytics', 'E-commerce', 'Dashboard'],
    image: '🛒',
    featured: true
  },
  {
    id: 2,
    name: 'Social Media Automation',
    author: 'AutoBot Inc',
    description: 'Schedule, post, and analyze social media content across multiple platforms',
    price: 'Free',
    rating: 4.6,
    downloads: 2567,
    tags: ['Social Media', 'Automation', 'Marketing'],
    image: '📱',
    featured: false
  },
  {
    id: 3,
    name: 'Customer Support AI',
    author: 'AI Solutions',
    description: 'Intelligent customer support system with sentiment analysis and auto-routing',
    price: '$49.99',
    rating: 4.9,
    downloads: 892,
    tags: ['AI', 'Customer Support', 'NLP'],
    image: '🤖',
    featured: true
  },
  {
    id: 4,
    name: 'Document Processing Engine',
    author: 'DocFlow',
    description: 'Extract, transform, and analyze documents with OCR and AI classification',
    price: '$19.99',
    rating: 4.5,
    downloads: 1567,
    tags: ['Document', 'OCR', 'Processing'],
    image: '📄',
    featured: false
  },
  {
    id: 5,
    name: 'Financial Data Aggregator',
    author: 'FinTech Solutions',
    description: 'Aggregate financial data from multiple sources with real-time monitoring',
    price: '$39.99',
    rating: 4.7,
    downloads: 743,
    tags: ['Finance', 'Data', 'Real-time'],
    image: '💰',
    featured: false
  },
  {
    id: 6,
    name: 'Email Campaign Manager',
    author: 'MarketFlow',
    description: 'Design, send, and track email campaigns with advanced segmentation',
    price: '$24.99',
    rating: 4.4,
    downloads: 1891,
    tags: ['Email', 'Marketing', 'Campaigns'],
    image: '✉️',
    featured: false
  }
]

export default function Marketplace() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Marketplace</h1>
          <p className="text-gray-400 mt-2">Discover and share workflows with the community</p>
        </div>
        <button className="glass-button px-6 py-3 bg-blue-600 hover:bg-blue-700 hover:animate-glow">
          Publish Workflow
        </button>
      </div>

      {/* Search & Filters */}
      <div className="glass-card p-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search workflows, blocks, or authors..."
              className="glass-input w-full pl-10"
            />
          </div>
          <button className="glass-button px-4 py-2 flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
        
        <div className="flex gap-2 mt-4">
          <button className="glass-button px-3 py-1 text-sm bg-blue-600">All</button>
          <button className="glass-button px-3 py-1 text-sm">Free</button>
          <button className="glass-button px-3 py-1 text-sm">Premium</button>
          <button className="glass-button px-3 py-1 text-sm">Featured</button>
          <button className="glass-button px-3 py-1 text-sm">Most Popular</button>
        </div>
      </div>

      {/* Featured Workflows */}
      <div>
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-yellow-400" />
          Featured Workflows
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.filter(w => w.featured).map((workflow) => (
            <div key={workflow.id} className="glass-card p-6 hover:animate-glow transition-all duration-300 cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="text-4xl">{workflow.image}</div>
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4 text-gray-400 hover:text-red-400 cursor-pointer" />
                  <span className="text-xs text-gray-400">Save</span>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-2">{workflow.name}</h3>
              <p className="text-sm text-gray-400 mb-3">{workflow.description}</p>
              
              <div className="flex items-center space-x-2 mb-3">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-300 ml-1">{workflow.rating}</span>
                </div>
                <div className="flex items-center">
                  <Download className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300 ml-1">{workflow.downloads}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {workflow.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-glass-300 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-400">by {workflow.author}</div>
                  <div className="text-lg font-bold text-blue-400">{workflow.price}</div>
                </div>
                <button className="glass-button px-4 py-2 bg-blue-600 hover:bg-blue-700">
                  Get Workflow
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Workflows */}
      <div>
        <h2 className="text-xl font-semibold mb-6">All Workflows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="glass-card p-6 hover:animate-glow transition-all duration-300 cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="text-4xl">{workflow.image}</div>
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4 text-gray-400 hover:text-red-400 cursor-pointer" />
                  <span className="text-xs text-gray-400">Save</span>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-2">{workflow.name}</h3>
              <p className="text-sm text-gray-400 mb-3">{workflow.description}</p>
              
              <div className="flex items-center space-x-2 mb-3">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-300 ml-1">{workflow.rating}</span>
                </div>
                <div className="flex items-center">
                  <Download className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300 ml-1">{workflow.downloads}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {workflow.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-glass-300 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-400">by {workflow.author}</div>
                  <div className="text-lg font-bold text-blue-400">{workflow.price}</div>
                </div>
                <button className="glass-button px-4 py-2 bg-blue-600 hover:bg-blue-700">
                  Get Workflow
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}