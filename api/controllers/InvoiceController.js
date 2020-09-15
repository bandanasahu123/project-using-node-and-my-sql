const Invoice = require('../models/Invoice')
const User = require('../models/User')
const responseHanlrService = require('../services/responsehandler.service')
var config = require('../../helper.json')
const sequelize = require('../../config/database')

const InvoiceController = () => {
  const addInvoice = async (req, res) => {
    const { body } = req
    console.log(typeof body['invoiceUsers[]'])
    console.log(body)
    try {
      const invoice = await Invoice.create({
        invoice_number: body.invoiceNum,
        project_id: body.project_id,
        invoice_to: body['invoiceUsers[]'].toString(),
        description: body.desc,
        date: Date.parse(body.date),
        total_days: body.totalDays,
        amount: body.amount,
        project_details: body.details,
        created_by: req.session.user.user.id,
        createdAt: Date.now(),
        updatedAt: Date.now()
      })

      return res.json(
        responseHanlrService.successResponse(
          invoice,
          200,
          'Successfully Invoice has been added!!'
        )
      )
    } catch (err) {
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', err)
      if (err.errors) {
        return res.json(
          responseHanlrService.errorResponse(null, 400, err.errors[0].message)
        )
      }

      return res.json(
        responseHanlrService.errorResponse('', 500, 'Internal server error')
      )
    }
  }
  const getInvoiceDetails = async (req, res) => {
    const { body } = req
    try {
      const invoiceDetails = await Invoice.findOne({
        where: {
          id: body.id
        },
        include: [User]
      })

      if (!invoiceDetails) {
        return res.json(
          responseHanlrService.errorResponse(null, 400, 'No id found')
        )
      }

      return res.json(
        responseHanlrService.successResponse(
          invoiceDetails,
          200,
          'Successfully fetched invoice details!!'
        )
      )
    } catch (err) {
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', err)
      if (err.errors) {
        return res.json(
          responseHanlrService.errorResponse(null, 500, 'Internal server error')
        )
      }
    }
  }

  return {
    addInvoice,
    getInvoiceDetails
  }
}

module.exports = InvoiceController
