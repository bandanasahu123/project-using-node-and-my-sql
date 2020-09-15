const Sequelize = require('sequelize')

const sequelize = require('../../config/database')

const tableName = 'projects'
const Category = require('../models/Category')

const Project = sequelize.define(
  'Project',
  {
    name: {
      type: Sequelize.STRING
    },
    user_id: {
      type: Sequelize.STRING
    },
    department: {
      type: Sequelize.INTEGER
    },
    project_lead: {
      type: Sequelize.STRING
    },
    assign_by: {
      type: Sequelize.INTEGER
    },
    status: {
      type: Sequelize.INTEGER
    },
    staging: {
      type: Sequelize.INTEGER
    },
    start_date: {
      type: 'TIMESTAMP',
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false
    },
    end_date: {
      type: 'TIMESTAMP',
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false
    }
  },
  { tableName }
)

// Project.belongsTo(Category, { foreignKey: 'department' })

// Category.hasMany(Project, { foreignKey: 'department' })

// eslint-disable-next-line
Project.prototype.toJSON = function () {
  const values = Object.assign({}, this.get())

  return values
}

module.exports = Project
