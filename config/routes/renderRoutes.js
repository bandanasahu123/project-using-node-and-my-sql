const renderRoutes = {
    'GET /dashboard': 'UserController.dashboard',
    'GET /superadmin-dashboard': 'UserController.renderSuperadmin',
    'GET /profile-dashboard': 'UserController.userDashboard',
    'GET /admin-dashboard': 'UserController.adminDashboard',
    'GET /team-dashboard': 'UserController.otherAdminDashboard',
    'GET /profile_details/:id': 'UserController.getPortfolioPage',
  };
  
  module.exports = renderRoutes;