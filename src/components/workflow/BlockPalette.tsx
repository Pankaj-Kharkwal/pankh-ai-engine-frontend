import React, { useState } from 'react'
import {
  Search,
  ChevronDown,
  ChevronRight,
  Plus,
  Menu,
  X,
  Zap,
  Database,
  Globe,
  MessageSquare,
  Code,
  Filter,
  Hash,
  FileText,
  Lock,
  Workflow,
  Share2,
  Cpu,
  BookOpen,
  Settings, // Using Settings for utility/logic
} from 'lucide-react'

// --- Interface Definitions (Kept as is) ---
interface BlockType {
  type: string
  manifest: {
    name: string
    description: string
    category: string
    tags?: string[]
  }
  enabled: boolean
  plugin_path?: string
}

interface BlockPaletteProps {
  blocks: BlockType[]
  categories: string[]
  isVisible: boolean
  onToggleVisibility: () => void
  onAddNode: (block: BlockType) => void
  expandedCategories: Set<string>
  onToggleCategory: (category: string) => void
  onLoadDemoWorkflow?: (workflowType: 'simple' | 'ai_research' | 'full_pipeline') => void
}

const BlockPalette: React.FC<BlockPaletteProps> = ({
  blocks = [],
  categories = [],
  isVisible,
  onToggleVisibility,
  onAddNode,
  expandedCategories,
  onToggleCategory,
  onLoadDemoWorkflow,
}) => {
  const [searchTerm, setSearchTerm] = useState('')

  const safeBlocks = Array.isArray(blocks) ? blocks : [] // Enhanced block categories with updated icons and descriptions

  const categoryInfo: Record<
    string,
    { icon: React.ComponentType<any>; description: string; color: string }
  > = {
    ai: {
      icon: Zap,
      description: 'Generative AI, models, and reasoning',
      color: 'text-fuchsia-600', // Brighter AI color
    },
    data: {
      icon: Database,
      description: 'Storage, retrieval, and transformations',
      color: 'text-blue-600',
    },
    network: {
      icon: Globe,
      description: 'HTTP requests, web scraping, and APIs',
      color: 'text-emerald-600', // Richer network green
    },
    integration: {
      icon: Share2,
      description: 'Third-party service connectors (Slack, Google)',
      color: 'text-rose-500',
    },
    communication: {
      icon: MessageSquare,
      description: 'Email, chat, and notification services',
      color: 'text-amber-600', // Richer yellow/amber
    },
    utility: {
      icon: Settings, // Switched to Settings for general logic/config
      description: 'Logic, time, control flow, and debugging',
      color: 'text-slate-600',
    },
    math: {
      icon: Hash,
      description: 'Mathematical and numerical operations',
      color: 'text-orange-600',
    },
    document: {
      icon: BookOpen,
      description: 'File reading/writing and document parsing',
      color: 'text-indigo-600',
    },
    security: {
      icon: Lock,
      description: 'Authentication, secrets, and encryption',
      color: 'text-red-800',
    },
  } // --- Filtering and Grouping Logic (Kept as is) ---

  const filteredBlocks = safeBlocks.filter(block => {
    if (!block || !block.manifest) return false

    try {
      const name = String(block.manifest.name || block.type || '').toLowerCase()
      const type = String(block.type || '').toLowerCase()
      const description = String(block.manifest.description || '').toLowerCase()
      const category = String(block.manifest.category || 'utility').toLowerCase()
      const searchLower = String(searchTerm || '').toLowerCase()

      return (
        name.includes(searchLower) ||
        type.includes(searchLower) ||
        description.includes(searchLower) ||
        category.includes(searchLower)
      )
    } catch (error) {
      return false
    }
  })

  const blocksByCategory = filteredBlocks.reduce(
    (acc, block) => {
      const category = block.manifest?.category || 'utility'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(block)
      return acc
    },
    {} as Record<string, BlockType[]>
  ) // Demo workflows

  const demoWorkflows = [
    {
      name: '🔍 Simple Search',
      description: 'Basic search and filter',
      type: 'simple' as const,
      color: 'bg-blue-50 border-blue-400 text-blue-700 hover:bg-blue-100',
    },
    {
      name: '🤖 AI Content Generator',
      description: 'Advanced prompt engineering',
      type: 'ai_research' as const,
      color: 'bg-fuchsia-50 border-fuchsia-400 text-fuchsia-700 hover:bg-fuchsia-100',
    },
    {
      name: '🔄 Full Data Pipeline',
      description: 'Extract, transform, and load',
      color: 'bg-emerald-50 border-emerald-400 text-emerald-700 hover:bg-emerald-100',
      type: 'full_pipeline' as const,
    },
  ] // --- Render Invisible State (Kept as is) ---

  if (!isVisible) {
    return (
      <div className="w-16 p-3 bg-white border-r border-gray-200 flex flex-col items-center">
               {' '}
        <button
          onClick={onToggleVisibility}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
          title="Show Block Library (Ctrl+B)"
        >
                    <Menu className="w-5 h-5 text-gray-600" />       {' '}
        </button>
             {' '}
      </div>
    )
  } // --- Render Visible State (UI Improved) ---

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-2xl z-30">
            {/* Header & Search (High Contrast) */}     {' '}
      <div className="p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
               {' '}
        <div className="flex items-center justify-between mb-3">
                   {' '}
          <h2 className="text-xl font-extrabold text-gray-900">
                        Block Library          {' '}
          </h2>
                   {' '}
          <button
            onClick={onToggleVisibility}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            title="Hide Block Library (Ctrl+B)"
          >
                        <X className="w-5 h-5 text-gray-500" />         {' '}
          </button>
                 {' '}
        </div>
                {/* Search with Focus Ring */}       {' '}
        <div className="relative">
                   {' '}
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                   {' '}
          <input
            type="text"
            placeholder="Search blocks..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition shadow-inner"
          />
                 {' '}
        </div>
             {' '}
      </div>
            {/* Demo Workflows (Improved borders/shadows) */}     {' '}
      <div className="p-4 border-b border-gray-100">
               {' '}
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 flex items-center">
                    <Workflow className="w-4 h-4 mr-1 text-indigo-500" />          Quick Start
          Templates        {' '}
        </h3>
               {' '}
        <div className="space-y-2">
                   {' '}
          {demoWorkflows.map((workflow, index) => (
            <button
              key={index}
              onClick={() => onLoadDemoWorkflow?.(workflow.type)}
              disabled={!onLoadDemoWorkflow}
              className={`w-full text-left p-3 rounded-xl border-2 transition-all text-xs
                ${workflow.color}
                hover:shadow-md hover:scale-[1.01]
                disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                            <div className="font-bold text-sm">{workflow.name}</div>             {' '}
              <div className="opacity-90 mt-1">{workflow.description}</div>           {' '}
            </button>
          ))}
                 {' '}
        </div>
             {' '}
      </div>
            {/* Scrollable Block Categories (Tighter spacing) */}     {' '}
      <div className="flex-1 overflow-y-auto p-4">
               {' '}
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 flex items-center">
                    <Filter className="w-4 h-4 mr-1 text-gray-400" />         {' '}
          {searchTerm ? 'Search Results' : 'Block Categories'}       {' '}
        </h3>
               {' '}
        <div className="space-y-3">
                   {' '}
          {Object.entries(blocksByCategory).map(([category, categoryBlocks]) => {
            const categoryMeta = categoryInfo[category] || {
              icon: Settings,
              description: 'Miscellaneous blocks',
              color: 'text-slate-600',
            }
            const CategoryIcon = categoryMeta.icon
            const isExpanded = expandedCategories.has(category)

            return (
              <div
                key={category}
                className="border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-shadow duration-200"
              >
                                  {/* Category Header (Clickable Accordion) */}                 {' '}
                <button
                  onClick={() => onToggleCategory(category)}
                  className={`w-full flex items-center justify-between p-3 transition-colors ${isExpanded ? 'bg-gray-100 border-b border-gray-200' : 'bg-white hover:bg-gray-50'}`}
                >
                                     {' '}
                  <div className="flex items-center space-x-3">
                                         {' '}
                    <CategoryIcon className={`w-5 h-5 ${categoryMeta.color}`} />                   
                     {' '}
                    <div className="text-left">
                                             {' '}
                      <div className="font-semibold text-sm capitalize text-gray-800">
                                                  {category}                       {' '}
                      </div>
                                           {' '}
                    </div>
                                       {' '}
                  </div>
                                     {' '}
                  <div className="flex items-center space-x-2">
                                         {' '}
                    <span className="text-xs bg-gray-300 text-gray-800 px-2 py-0.5 rounded-full font-bold">
                                              {categoryBlocks.length}                     {' '}
                    </span>
                                         {' '}
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                                       {' '}
                  </div>
                                   {' '}
                </button>
                                  {/* Category Blocks (Visual lift on hover) */}                 {' '}
                {isExpanded && (
                  <div className="max-h-96 overflow-y-auto bg-gray-50 transition-all duration-300">
                                         {' '}
                    {categoryBlocks.map(block => {
                      const BlockIcon = categoryMeta.icon
                      const blockColor = categoryMeta.color

                      return (
                        <div
                          key={block.type}
                          onClick={() => onAddNode(block)}
                          className="flex items-center p-3 cursor-pointer border-t border-gray-100 transition-all duration-150 bg-white hover:bg-white hover:shadow-md hover:z-10 relative group"
                        >
                                                     {' '}
                          <div className="flex items-center flex-1 min-w-0">
                                                         {' '}
                            {/* Icon Wrapper: Circular, strong background */}                       
                                 {' '}
                            <div
                              className={`p-2.5 rounded-full mr-3 ${blockColor.replace('text-', 'bg-').replace('-600', '-100')} group-hover:bg-blue-200 transition-colors`}
                            >
                                                             {' '}
                              <BlockIcon className={`w-4 h-4 ${blockColor}`} />                     
                                     {' '}
                            </div>
                                                         {' '}
                            <div className="flex-1 min-w-0">
                                                             {' '}
                              <div className="font-semibold text-sm text-gray-900 truncate">
                                                                 {' '}
                                {block.name || block.type}                             
                                 {' '}
                              </div>
                                                             {' '}
                              <div className="text-xs text-gray-500 truncate mt-0.5">
                                                                 {' '}
                                {block.metadata?.description || 'No description available'}         
                                                     {' '}
                              </div>
                                                           {' '}
                            </div>
                                                       {' '}
                          </div>
                                                     {' '}
                          {/* Add Button/Icon: Blue primary color, pops out on hover */}           
                                         {' '}
                          <div className="p-1.5 rounded-full bg-blue-500 text-white opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-200">
                                                          <Plus className="w-4 h-4" />             
                                         {' '}
                          </div>
                                                   {' '}
                        </div>
                      )
                    })}
                                       {' '}
                  </div>
                )}
                               {' '}
              </div>
            )
          })}
                    {/* No Blocks Found State */}         {' '}
          {Object.keys(blocksByCategory).length === 0 && (
            <div className="text-center py-10 px-4 text-gray-500 border border-dashed border-gray-300 rounded-xl">
                            <Search className="w-6 h-6 mx-auto mb-2 text-gray-400" />             {' '}
              <p className="text-sm font-medium">No blocks match "{searchTerm}"</p>             {' '}
              <p className="text-xs text-gray-400 mt-1">
                Try a different keyword or check your spelling.
              </p>
                         {' '}
            </div>
          )}
                 {' '}
        </div>
             {' '}
      </div>
            {/* Footer Stats (Cleaner separation) */}     {' '}
      <div className="p-3 border-t border-gray-100 bg-gray-50">
               {' '}
        <div className="text-xs text-gray-600 text-center">
                    <span className="font-bold text-gray-800">{filteredBlocks.length}</span> blocks
          available           {searchTerm && ` (Showing results for "${searchTerm}")`}       {' '}
        </div>
             {' '}
      </div>
         {' '}
    </div>
  )
}

export default BlockPalette
