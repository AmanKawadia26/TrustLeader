import { 
  useListBusinesses, 
  useGetBusiness,
  type ListBusinessesParams 
} from '@workspace/api-client-react';

export function useBusinessesQuery(params: ListBusinessesParams) {
  return useListBusinesses(params, {
    query: {
      queryKey: ['businesses', params],
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  });
}

export function useBusinessQuery(id: string) {
  return useGetBusiness(id, {
    query: {
      queryKey: ['business', id],
      enabled: !!id,
    }
  });
}
