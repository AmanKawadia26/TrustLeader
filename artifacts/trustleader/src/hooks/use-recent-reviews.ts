import { useListRecentReviews } from "@workspace/api-client-react";

export function useRecentReviewsQuery() {
  return useListRecentReviews({
    query: {
      queryKey: ["reviews", "recent"],
      staleTime: 5 * 60 * 1000,
    },
  });
}
