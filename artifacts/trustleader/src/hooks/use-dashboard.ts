import {
  useGetCompanyBusiness,
  useGetCompanyReviews,
  useRespondToReview,
  useClaimCompanyBusiness,
  useGetConsumerReviews,
  useGetResellerStats,
  useGetResellerReferrals,
  ApiError,
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
    query: {
      queryKey: ['company-business'],
      retry: (_c, err) => !(err instanceof ApiError && err.status === 404),
    },
  });

  const reviewsQuery = useGetCompanyReviews(
    {},
    {
      request: { headers },
      query: {
        queryKey: ['company-reviews', 'list'],
        enabled: !!businessQuery.data,
      },
    },
  );

  const respondMutation = useRespondToReview({
    request: { headers },
    mutation: {
      onSuccess: () => {
        toast({ title: "Response posted successfully!" });
        queryClient.invalidateQueries({ queryKey: ['company-reviews'] });
      }
    }
  });

  const claimMutation = useClaimCompanyBusiness({
    request: { headers },
    mutation: {
      onSuccess: () => {
        toast({ title: "Business linked to your account." });
        queryClient.invalidateQueries({ queryKey: ['company-business'] });
        queryClient.invalidateQueries({ queryKey: ['company-reviews'] });
      },
      onError: (err: Error) => {
        toast({ title: "Could not claim business", description: err.message, variant: "destructive" });
      }
    }
  });

  return { businessQuery, reviewsQuery, respondMutation, claimMutation };
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
