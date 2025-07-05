import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { JobRequest } from '../types';
import { 
  getJobRequestsForCustomer, 
  getAllJobRequests, 
  addJobRequest, 
  getCustomersByIds,
  getArtisansByIds
} from '../services/api';

// Job Requests Hooks
export const useJobRequests = (customerId: string) => {
  return useQuery({
    queryKey: ['jobs', 'customer', customerId],
    queryFn: () => getJobRequestsForCustomer(customerId),
    staleTime: 30000,
    enabled: !!customerId,
  });
};

export const useAllJobRequests = () => {
  return useQuery({
    queryKey: ['jobs', 'all'],
    queryFn: getAllJobRequests,
    staleTime: 30000,
  });
};

export const useCustomers = (customerIds: string[]) => {
  return useQuery({
    queryKey: ['customers', customerIds],
    queryFn: () => getCustomersByIds(customerIds),
    enabled: customerIds.length > 0,
    staleTime: 60000, // 1 minute
  });
};

export const useArtisans = (artisanIds: string[]) => {
  return useQuery({
    queryKey: ['artisans', artisanIds],
    queryFn: () => getArtisansByIds(artisanIds),
    enabled: artisanIds.length > 0,
    staleTime: 60000, // 1 minute
  });
};

// Mutations
export const useCreateJobRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ customerId, jobData }: { 
      customerId: string; 
      jobData: Omit<JobRequest, "id" | "customerId" | "createdAt" | "status" | "bids" | "chatHistory" | "paymentStatus" | "escrowAmount"> 
    }) => addJobRequest(customerId, jobData),
    onSuccess: () => {
      // Invalidate and refetch job requests
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};

export const useUpdateJobRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<JobRequest> }) => {
      // TODO: Implement updateJobRequest in API
      console.warn('updateJobRequest not implemented in API');
      return Promise.resolve({ id, ...updates } as JobRequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};

// Advanced hooks with optimistic updates
export const useOptimisticJobUpdate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<JobRequest> }) => {
      // TODO: Implement updateJobRequest in API
      console.warn('updateJobRequest not implemented in API');
      return Promise.resolve({ id, ...updates } as JobRequest);
    },
    onMutate: async ({ id, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['jobs'] });
      
      // Snapshot the previous value
      const previousJobs = queryClient.getQueryData(['jobs', 'all']);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['jobs', 'all'], (old: JobRequest[] | undefined) => {
        if (!old) return old;
        return old.map(job => job.id === id ? { ...job, ...updates } : job);
      });
      
      return { previousJobs };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousJobs) {
        queryClient.setQueryData(['jobs', 'all'], context.previousJobs);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};
