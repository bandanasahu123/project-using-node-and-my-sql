const Sequelize = require('sequelize')

const sequelize = require('../../config/database')

const tableName = 'invoices'
const Project = require('../models/Project')
const User = require('../models/User')

const Invoice = sequelize.define(
  'Invoice',
  {
    invoice_number: {
      type: Sequelize.STRING
    },
    project_id: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.STRING
    },
    amount: {
      type: Sequelize.DOUBLE
    },
    date: {
      type: 'TIMESTAMP',
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false
    },
    invoice_to: {
      type: Sequelize.STRING
    },
    total_days: {
      type: Sequelize.INTEGER
    },
    project_details: {
      type: Sequelize.STRING
    },
    created_by: {
      type: Sequelize.INTEGER
    }
  },
  { tableName }
)

Invoice.belongsTo(Project, { foreignKey: 'project_id' })
Invoice.belongsTo(User, { foreignKey: 'created_by' })
Invoice.belongsTo(User, { foreignKey: 'invoice_to' })

// eslint-disable-next-line
Invoice.prototype.toJSON = function () {
  const values = Object.assign({}, this.get())

  return values
}

module.exports = Invoice
