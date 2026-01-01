/**
 * Workflow Layout Utility
 * Uses dagre for hierarchical DAG layout of workflow nodes
 */

import dagre from 'dagre'
import type { Node, Edge } from '@xyflow/react'

export type LayoutDirection = 'TB' | 'LR' | 'BT' | 'RL'
export type LayoutSpacing = 'compact' | 'normal' | 'spacious'

export interface LayoutOptions {
  direction: LayoutDirection
  spacing: LayoutSpacing
  nodeWidth?: number
  nodeHeight?: number
}

const SPACING_CONFIG: Record<LayoutSpacing, { horizontal: number; vertical: number }> = {
  compact: { horizontal: 80, vertical: 60 },
  normal: { horizontal: 120, vertical: 100 },
  spacious: { horizontal: 180, vertical: 150 },
}

const DEFAULT_NODE_WIDTH = 260
const DEFAULT_NODE_HEIGHT = 120

/**
 * Apply dagre layout to nodes and edges
 * Returns new nodes with updated positions
 */
export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions
): { nodes: Node[]; edges: Edge[] } {
  if (nodes.length === 0) {
    return { nodes, edges }
  }

  const { direction, spacing, nodeWidth = DEFAULT_NODE_WIDTH, nodeHeight = DEFAULT_NODE_HEIGHT } = options
  const spacingConfig = SPACING_CONFIG[spacing]

  // Create a new dagre graph
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))

  // Configure graph direction and spacing
  const isHorizontal = direction === 'LR' || direction === 'RL'
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: isHorizontal ? spacingConfig.vertical : spacingConfig.horizontal,
    ranksep: isHorizontal ? spacingConfig.horizontal : spacingConfig.vertical,
    marginx: 50,
    marginy: 50,
  })

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  })

  // Add edges to dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  // Run the layout algorithm
  dagre.layout(dagreGraph)

  // Get positioned nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    if (!nodeWithPosition) {
      return node
    }

    return {
      ...node,
      position: {
        // Dagre returns center coordinates, we need top-left for React Flow
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    }
  })

  return {
    nodes: layoutedNodes,
    edges,
  }
}

/**
 * Get display label for layout direction
 */
export function getDirectionLabel(direction: LayoutDirection): string {
  const labels: Record<LayoutDirection, string> = {
    TB: 'Top to Bottom',
    LR: 'Left to Right',
    BT: 'Bottom to Top',
    RL: 'Right to Left',
  }
  return labels[direction]
}

/**
 * Get display label for spacing option
 */
export function getSpacingLabel(spacing: LayoutSpacing): string {
  const labels: Record<LayoutSpacing, string> = {
    compact: 'Compact',
    normal: 'Normal',
    spacious: 'Spacious',
  }
  return labels[spacing]
}

/**
 * Calculate the bounding box of all nodes
 */
export function getNodesBounds(nodes: Node[]): {
  minX: number
  minY: number
  maxX: number
  maxY: number
  width: number
  height: number
} {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 }
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  nodes.forEach((node) => {
    const { x, y } = node.position
    const width = DEFAULT_NODE_WIDTH
    const height = DEFAULT_NODE_HEIGHT

    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x + width)
    maxY = Math.max(maxY, y + height)
  })

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

/**
 * Center nodes in the viewport
 */
export function centerNodes(
  nodes: Node[],
  viewportWidth: number,
  viewportHeight: number
): Node[] {
  const bounds = getNodesBounds(nodes)
  const offsetX = (viewportWidth - bounds.width) / 2 - bounds.minX
  const offsetY = (viewportHeight - bounds.height) / 2 - bounds.minY

  return nodes.map((node) => ({
    ...node,
    position: {
      x: node.position.x + offsetX,
      y: node.position.y + offsetY,
    },
  }))
}
