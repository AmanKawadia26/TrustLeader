import {
  useGetCompanyBusiness,
  useGetCompanyReviews,
  useRespondToReview,
  useGetConsumerReviews,
  useGetResellerStats,
  useGetResellerReferrals,
  type GetCompanyReviewsParams,
  type GetConsumerReviewsParams,
  type GetResellerReferralsParams
} from '@workspace/api-client-react';
import { useAuth } from './use-auth';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export function useCompanyDashboard() {
  const { getAuthHeaders } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const headers = getAuthHeaders();

  const businessQuery = useGetCompanyBusiness({
    request: { headers },
    query: { queryKey: ['company-business'] }
  });

  const reviewsQuery = (params: GetCompanyReviewsParams) => useGetCompanyReviews(params, {
    request: { headers },
    query: { queryKey: ['company-reviews', params] }
  });

  const respondMutation = useRespondToReview({
    request: { headers },
    mutation: {
      onSuccess: () => {
        toast({ title: "Response posted successfully!" });
        queryClient.invalidateQueries({ queryKey: ['company-reviews'] });
      }
    }
  });

  return { businessQuery, reviewsQuery, respondMutation };
}

export function useConsumerDashboard(params: GetConsumerReviewsParams) {
  const { getAuthHeaders } = useAuth();
  const headers = getAuthHeaders();

  return useGetConsumerReviews(params, {
    request: { headers },
    query: { queryKey: ['consumer-reviews', params] }
  });
}

export function useResellerDashboard() {
  const { getAuthHeaders } = useAuth();
  const headers = getAuthHeaders();

  const statsQuery = useGetResellerStats({
    request: { headers },
    query: { queryKey: ['reseller-stats'] }
  });

  const referralsQuery = (params: GetResellerReferralsParams) => useGetResellerReferrals(params, {
    request: { headers },
    query: { queryKey: ['reseller-referrals', params] }
  });

  return { statsQuery, referralsQuery };
}
