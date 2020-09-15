const Sequelize = require('sequelize')
const bcryptService = require('../services/bcrypt.service')
const Category = require('./Category')
const Project = require('./Project')
const Subcategory = require('./Subcategory')
const sequelize = require('../../config/database')

const hooks = {
  async beforeCreate (user) {
    console.log(user.password, '=====================')
    user.password = await bcryptService.computeBcryptHash(user.password) // eslint-disable-line no-param-reassign
  }
}

const tableName = 'users'

const User = sequelize.define(
  'User',
  {
    email: {
      type: Sequelize.STRING,
      unique: true
    },
    password: {
      type: Sequelize.STRING
    },
    name: {
      type: Sequelize.STRING
    },
    contact: {
      type: Sequelize.STRING
    },
    category_id: {
      type: Sequelize.INTEGER
    },
    subcat_id: {
      type: Sequelize.INTEGER
    },
    project_id: {
      type: Sequelize.STRING
    },
    skills: {
      type: Sequelize.STRING
    },
    reference_link: {
      type: Sequelize.STRING
    },
    position: {
      type: Sequelize.STRING
    },
    location: {
      type: Sequelize.STRING
    },
    about: {
      type: Sequelize.STRING
    },
    profile_pic: {
      type: Sequelize.STRING
    },
    cv_upload: {
      type: Sequelize.STRING
    },
    multiple_files: {
      type: Sequelize.STRING
    },
    assigned_to: {
      type: Sequelize.INTEGER
    },
    status: {
      type: Sequelize.INTEGER
    },
    admin_status: {
      type: Sequelize.INTEGER
    },
    availability: {
      type: Sequelize.INTEGER
    },
    role: {
      type: Sequelize.INTEGER
    },
    rating: {
      type: Sequelize.STRING
    },
    feedback: {
      type: Sequelize.STRING
    },
    profile_request: {
      type: Sequelize.BOOLEAN
    },
    profile_type_request: {
      type: Sequelize.INTEGER // 1-approved || 2 - rejected
    },
    sessionId: {
      type: Sequelize.STRING
    },
    passwordToken: {
      type: Sequelize.INTEGER
    },
    pwdCreatedDate: {
      type: Sequelize.INTEGER
    }
  },
  { hooks, tableName }
)
User.belongsTo(Category, { foreignKey: 'category_id' })
Category.hasMany(User, { foreignKey: 'category_id' })
User.belongsTo(Subcategory, { foreignKey: 'subcat_id' })
User.belongsTo(Project, { foreignKey: 'project_id' })
Project.hasMany(User, { foreignKey: 'project_id' })

// eslint-disable-next-line
User.prototype.toJSON = function () {
  const values = Object.assign({}, this.get())

  delete values.password

  return values
}

module.exports = User
