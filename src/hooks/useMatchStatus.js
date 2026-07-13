import { useQuery } from '@tanstack/react-query';
import { mockMatch } from '../services/mockData';

export const useMatchStatus = () => {
  return useQuery({
    queryKey: ['match'],
    queryFn: async () => {
      return mockMatch;
    },
    refetchInterval: 30000 // Refresh every 30 seconds (for live updates)
  });
};
