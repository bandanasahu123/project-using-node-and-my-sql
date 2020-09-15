const Project = require('../models/Project')
const User = require('../models/User')
const responseHanlrService = require('../services/responsehandler.service')
var config = require('../../helper.json')
const sequelize = require('../../config/database')
const Sequelize = require('sequelize')
const _ = require('lodash')

const ProjectController = () => {
  const addProject = async (req, res) => {
    const { body } = req
    console.log(typeof body['userIds[]'])
    console.log(body)
    try {
      const project = await Project.create({
        name: body.name,
        user_id: body['userIds[]'].toString(),
        department: body.department,
        project_lead: body.leadName,
        assign_by: body.assignBy,
        status: body.projStatus,
        staging: body.statging,
        start_date: Date.parse(body.startDate),
        end_date: Date.parse(body.endDate),
        createdAt: Date.now(),
        updatedAt: Date.now()
      })

      const users = await User.findAll({
        where: { id: body['userIds[]'] }
      })
      let updateUser
      if (users) {
        _.forEach(users, async user => {
          if (user.project_id === null) {
            updateUser = await User.update(
              {
                project_id: project.id
              },
              { where: { id: user.id } }
            )
          } else {
            updateUser = await User.update(
              {
                project_id: Sequelize.fn(
                  'CONCAT',
                  Sequelize.col('project_id'),
                  ',',
                  project.id
                )
              },
              { where: { id: user.id } }
            )
          }
        })
      }

     

      // if (!user) {
      //   return res.json(
      //     responseHanlrService.errorResponse('', 401, 'Error in updating user')
      //   )
      // }

      return res.json(
        responseHanlrService.successResponse(
          project,
          200,
          'Successfully Project has been added!!'
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

  return {
    addProject
  }
}

module.exports = ProjectController
