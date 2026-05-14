import dashboardService from '../services/dashboardService.js';

class DashboardController {
    async getAdminStats(req, res) {
        try {
            const stats = await dashboardService.getAdminStats();
            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error fetching admin dashboard stats:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch dashboard stats',
                error: error.message
            });
        }
    }
}

export default new DashboardController();
