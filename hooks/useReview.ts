import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addReview } from '../services/api';

export const useSubmitReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ artisanId, customerId, jobId, rating, comment }: {
      artisanId: string;
      customerId: string;
      jobId: string;
      rating: number;
      comment: string;
    }) => addReview(artisanId, customerId, jobId, rating, comment),
    onSuccess: () => {
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['artisans'] });
    },
  });
};
