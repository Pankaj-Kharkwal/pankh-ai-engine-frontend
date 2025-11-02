import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../services/api'

// Workflows
export function useWorkflows() {
  return useQuery({
    queryKey: ['workflows'],
    queryFn: () => apiClient.getWorkflows(),
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

export function useRegistryStats() {
  return useQuery({
    queryKey: ['registry-stats'],
    queryFn: () => apiClient.getRegistryStats(),
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

export function useGenerateBlock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ description, autoDeploy }: { description: string; autoDeploy?: boolean }) =>
      apiClient.generateBlock(description, autoDeploy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocks'] })
      queryClient.invalidateQueries({ queryKey: ['registry-stats'] })
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

// Health and Metrics
export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.getHealth(),
    refetchInterval: 30000, // Check every 30 seconds
  })
}

export function useMetrics() {
  return useQuery({
    queryKey: ['metrics'],
    queryFn: () => apiClient.getMetrics(),
    refetchInterval: 30000, // Update every 30 seconds
  })
}
