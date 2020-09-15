'use strict'

module.exports = {
  successResponse: (data, code = 200, message = 'request successfull!!') => {
    return {
      type: 'application/json',
      statusCode: code,
      data: data,
      status: code,
      success: true,
      message: message
    }
  },

  errorResponse: (data = {}, code = 400, message = 'request failed!!') => {
    console.log('================', data)
    return {
      type: 'application/json',
      statusCode: code,
      status: code,
      success: false,
      message: message,
      data: data || null
    }
  }
}
