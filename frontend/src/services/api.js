import api from '../utils/api';

export default api;

export const revenueService = {
  getRevenueMetrics: async (role) => {
    const { data } = await api.get(`/${role}/analytics/detailed`);
    return data.data.revenueData; 
  },
  getRevenueKPIs: async (role) => {
    const { data } = await api.get(`/${role}/analytics/detailed`);
    return {
       total: data.data.totalRevenue,
       growth: null, 
       activeLearners: data.data.totalActiveLearners
    };
  }
};

export const performanceService = {
  getPerformanceData: async (role) => {
     const { data } = await api.get(`/${role}/analytics/detailed`);
     return data.data; 
  }
};

export const teachingService = {
  getTeachingActivity: async (role) => {
     const { data } = await api.get(`/${role}/analytics/detailed`);
     return data.data.engagementData;
  }
};
