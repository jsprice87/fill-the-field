
import { useQuery } from '@tanstack/react-query';

export const useClassSchedule = (classScheduleId: string) => {
  return useQuery({
    queryKey: ['class-schedule', classScheduleId],
    queryFn: async () => {
      // Stub implementation - returns null
      return null;
    },
    enabled: !!classScheduleId,
  });
};
