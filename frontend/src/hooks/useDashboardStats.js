import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

export const useDashboardStats = () => {
    return useQuery({
        queryKey: ['adminDashboardStats'],
        queryFn: async () => {
            const { data } = await api.get('/dashboard/stats');
            return data.data;
        },
        refetchInterval: 30000, // Refresh every 30 seconds automatically
    });
};
