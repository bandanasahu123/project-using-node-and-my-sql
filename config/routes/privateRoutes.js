const privateRoutes = {
    'POST /api/update-profile': 'UserController.rejectOrAcceptprofile',
    'POST /api/update-user': 'UserController.updateUserProfile',
    'POST /api/add-admin': 'UserController.addAdmin',
    'DELETE /api/delete-admin': 'UserController.deleteAdmin',
    'POST /logout': 'UserController.logoutUser',
    'POST /api/get-user': 'UserController.getUsers',
    'POST /api/assign-profile': 'UserController.assignProfileToAdmin',
    'POST /api/update-requested-profile': 'UserController.updateuserStatus',
    'POST /api/update-rating': 'UserController.updateuserRating',

    'POST /api/add-project': 'ProjectController.addProject',
    'POST /api/add-invoice': 'InvoiceController.addInvoice',
    'POST /api/get-invoice-details': 'InvoiceController.getInvoiceDetails',
  };
  
  module.exports = privateRoutes;