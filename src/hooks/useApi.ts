import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../services/api'

// Workflows
export function useWorkflows(options = {}) {
  return useQuery({
    queryKey: ['workflows'],
    queryFn: () => apiClient.getWorkflows(),
    staleTime: 30000, // 30 seconds
    retry: 2,
    ...options,
  })
}

export function useWorkflow(id: string) {
  return useQuery({
    queryKey: ['workflow', id],
    queryFn: () => apiClient.getWorkflow(id),
    enabled: !!id,
  })
}

export function useCreateWorkflow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; graph: any }) => apiClient.createWorkflow(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
    },
  })
}

export function useRunWorkflow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.runWorkflow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
    },
  })
}

// Blocks
export function useBlocks(category?: string, enabledOnly = true) {
  return useQuery({
    queryKey: ['blocks', category, enabledOnly],
    queryFn: () => apiClient.listBlocks(category, enabledOnly),
  })
}

export function useBlockCategories() {
  return useQuery({
    queryKey: ['block-categories'],
    queryFn: () => apiClient.getBlockCategories(),
  })
}

export function useRegistryStats(options = {}) {
  return useQuery({
    queryKey: ['registry-stats'],
    queryFn: () => apiClient.getRegistryStats(),
    staleTime: 30000, // 30 seconds
    retry: 2,
    ...options,
  })
}

export function useBlockInfo(blockType: string) {
  return useQuery({
    queryKey: ['block-info', blockType],
    queryFn: () => apiClient.getBlockInfo(blockType),
    enabled: !!blockType,
  })
}

export function useBlockSchema(blockType: string) {
  return useQuery({
    queryKey: ['block-schema', blockType],
    queryFn: () => apiClient.getBlockSchema(blockType),
    enabled: !!blockType,
  })
}

export function useRegisterBlock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      block_type: string
      python_code: string
      manifest?: any
      enable_immediately?: boolean
    }) => apiClient.registerBlock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocks'] })
      queryClient.invalidateQueries({ queryKey: ['registry-stats'] })
    },
  })
}

type GenerateBlockArgs = {
  description: string
  autoDeploy?: boolean
  persist?: boolean
  verify?: boolean
  runPreview?: boolean
  previewInputs?: Record<string, any>
}

export function useGenerateBlock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      description,
      autoDeploy,
      persist,
      verify,
      runPreview,
      previewInputs,
    }: GenerateBlockArgs) =>
      apiClient.generateBlock(description, autoDeploy, {
        persist,
        verify,
        runPreview,
        previewInputs,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocks'] })
      queryClient.invalidateQueries({ queryKey: ['registry-stats'] })
    },
  })
}

export function useVerifyBlock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (blockId: string) => apiClient.verifyBlock(blockId),
    onSuccess: (data, blockId) => {
      queryClient.invalidateQueries({ queryKey: ['blocks'] })
      queryClient.invalidateQueries({ queryKey: ['block', blockId] })
    },
  })
}

export function useHealBlock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ blockId, issues }: { blockId: string; issues: any[] }) =>
      apiClient.healBlock(blockId, issues),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blocks'] })
      queryClient.invalidateQueries({ queryKey: ['block', variables.blockId] })
    },
  })
}

export function useEnableBlock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (blockType: string) => apiClient.enableBlock(blockType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocks'] })
      queryClient.invalidateQueries({ queryKey: ['registry-stats'] })
    },
  })
}

export function useDisableBlock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (blockType: string) => apiClient.disableBlock(blockType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocks'] })
      queryClient.invalidateQueries({ queryKey: ['registry-stats'] })
    },
  })
}

export function useReloadPlugins() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => apiClient.reloadPlugins(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocks'] })
      queryClient.invalidateQueries({ queryKey: ['block-categories'] })
      queryClient.invalidateQueries({ queryKey: ['registry-stats'] })
    },
  })
}

// Executions
export function useExecutions(params?: { status?: string }) {
  return useQuery({
    queryKey: ['executions', params],
    queryFn: () => apiClient.getExecutions(params),
    retry: 1, // Only retry once since this endpoint may not be available
  })
}

export function useExecution(id: string) {
  return useQuery({
    queryKey: ['execution', id],
    queryFn: () => apiClient.getExecution(id),
    enabled: !!id,
  })
}

export function useExecutionLogs(id: string) {
  return useQuery({
    queryKey: ['execution-logs', id],
    queryFn: () => apiClient.getExecutionLogs(id),
    enabled: !!id,
    refetchInterval: query => {
      // Only refetch if we're getting actual data and not in error state
      if (query.state.status === 'error') return false
      return 3000 // Refresh logs every 3 seconds for live updates
    },
    retry: 1, // Only retry once since endpoint may not be available
  })
}

export function useExecutionStatus(id: string) {
  return useQuery({
    queryKey: ['execution-status', id],
    queryFn: () => apiClient.getExecutionStatus(id),
    enabled: !!id,
    refetchInterval: query => {
      // Only refetch if execution is still running
      if (query.state.status === 'error') return false
      const execution = query.state.data as any
      if (execution?.status === 'completed' || execution?.status === 'failed') {
        return false // Stop polling when execution is done
      }
      return 2000 // Refresh status every 2 seconds while running
    },
    retry: 1, // Only retry once since endpoint may not be available
  })
}

// Health and Metrics
export function useHealth(options = {}) {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.getHealth(),
    refetchInterval: 30000, // Check every 30 seconds
    staleTime: 10000, // 10 seconds
    retry: 2,
    ...options,
  })
}

export function useMetrics() {
  return useQuery({
    queryKey: ['metrics'],
    queryFn: () => apiClient.getMetrics(),
    refetchInterval: 30000, // Update every 30 seconds
  })
}
