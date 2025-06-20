
import { useQuery } from '@tanstack/react-query';

export const useClassSchedules = (franchiseeId?: string) => {
  return useQuery({
    queryKey: ['class-schedules', franchiseeId],
    queryFn: async () => {
      // Stub implementation - returns empty array
      return [];
    },
    enabled: !!franchiseeId,
  });
};
