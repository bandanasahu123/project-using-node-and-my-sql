const publicRoutes = {
    'GET /register': 'UserController.getSignup', 
    'GET /dashboard': 'UserController.publicDashboard',
    'GET /profile_details/:id': 'UserController.publicGetPortfolioPage',
    'POST /api/register': 'UserController.postSignup', 
    'POST /api/login': 'UserController.postSignin', 
    'GET /login': 'UserController.getSignin', // alias for GET /getSignin
    'GET /superadmin/login': 'UserController.getSignin', // alias for GET /getSignin
    'POST /api/forgot-password': 'UserController.forgetPassword', // alias for POST /forgot-password
    'POST /api/reset-password': 'UserController.resetPassword', // alias for POST /forgot-password
    'POST /api/get-subcategory': 'CategoryController.categoryById', // alias for POST /categoryById
    'GET /api/all-category': 'CategoryController.getAllCategory',
    'GET /thank-you': 'UserController.renderThankyou',
    'GET /reset-password/:token': 'UserController.getResetPassword',

    'POST /api/get-user-by-category': 'UserController.getUserByCategory',
    'POST /api/get-user': 'UserController.getUserInfo',
    'POST /api/upload-image': 'UserController.uploadImage',
    'POST /api/search-category': 'UserController.seachCategory',

    'GET /privacy': 'UserController.privacy', 
    'GET /community': 'UserController.community', 
    'GET /help': 'UserController.help', 

  };
  
  module.exports = publicRoutes;