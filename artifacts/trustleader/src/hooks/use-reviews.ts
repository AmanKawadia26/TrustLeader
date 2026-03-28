import { 
  useGetBusinessReviews,
  useCreateReview,
  useUpdateReview,
  type GetBusinessReviewsParams,
  type CreateReviewRequest,
  type UpdateReviewRequest
} from '@workspace/api-client-react';
import { useAuth } from './use-auth';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export function useBusinessReviewsQuery(id: string, params: GetBusinessReviewsParams) {
  return useGetBusinessReviews(id, params, {
    query: {
      queryKey: ['business-reviews', id, params],
      enabled: !!id,
    }
  });
}

export function useCreateReviewMutation() {
  const { getAuthHeaders } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useCreateReview({
    request: {
      headers: getAuthHeaders()
    },
    mutation: {
      onSuccess: (_, variables) => {
        toast({ title: "Review submitted successfully!" });
        queryClient.invalidateQueries({ queryKey: ['business-reviews', variables.data.business_id] });
        queryClient.invalidateQueries({ queryKey: ['business', variables.data.business_id] });
      },
      onError: (error) => {
        toast({ 
          title: "Failed to submit review", 
          description: error.message || "Please try again.",
          variant: "destructive" 
        });
      }
    }
  });
}

export function useUpdateReviewMutation() {
  const { getAuthHeaders } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useUpdateReview({
    request: {
      headers: getAuthHeaders()
    },
    mutation: {
      onSuccess: () => {
        toast({ title: "Review updated successfully!" });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/consumer/reviews'] });
      },
      onError: (error) => {
        toast({ 
          title: "Failed to update review", 
          description: error.message || "Please try again.",
          variant: "destructive" 
        });
      }
    }
  });
}
