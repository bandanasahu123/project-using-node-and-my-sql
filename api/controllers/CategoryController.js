const Category = require('../models/Category')
const Subcategory = require('../models/Subcategory')
const responseHanlrService = require('../services/responsehandler.service')
var config = require('../../helper.json')
const sequelize = require('../../config/database')

const CategoryController = () => {
  const getAllCategory = async (req, res) => {
    try {
      const category = await Category.findAll()
      if (!category) {
        return res.json(
          responseHanlrService.errorResponse(
            '',
            400,
            'Bad request! No category data found'
          )
        )
      }
      return res.json(
        responseHanlrService.successResponse(
          category,
          200,
          'All category details'
        )
      )
    } catch (err) {
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', err)
      return res.json(
        responseHanlrService.errorResponse('', 500, 'Internal server error')
      )
    }
  }

  const categoryById = async (req, res) => {
    try {
      let { catId } = req.body
      const subcategoryDetails = await Subcategory.findAll({
        where: {
          cat_id: catId
        }
      })
      if (!subcategoryDetails) {
        return res.json(
          responseHanlrService.errorResponse(
            '',
            400,
            'Bad request! No category data found'
          )
        )
      }
      return res.json(
        responseHanlrService.successResponse(
          subcategoryDetails,
          200,
          'All category details'
        )
      )
    } catch (err) {
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', err)
      return res.json(
        responseHanlrService.errorResponse('', 500, 'Internal server error')
      )
    }
  }

  return {
    getAllCategory,
    categoryById
  }
}

module.exports = CategoryController
