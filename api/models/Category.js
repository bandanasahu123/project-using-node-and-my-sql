const Sequelize = require('sequelize')

const sequelize = require('../../config/database')

const tableName = 'categories'
const Subcategory = require('./Subcategory')
const Project = require('./Project')

const Category = sequelize.define(
  'Category',
  {
    name: {
      type: Sequelize.STRING
    },
    cat_image: {
      type: Sequelize.STRING
    }
  },
  { tableName }
)

Category.hasMany(Subcategory,{ foreignKey: 'cat_id' })
Project.belongsTo(Category, { foreignKey: 'department' })



// eslint-disable-next-line
Category.prototype.toJSON = function () {
  const values = Object.assign({}, this.get())

  return values
}

module.exports = Category
