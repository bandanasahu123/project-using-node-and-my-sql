const Sequelize = require('sequelize')

const sequelize = require('../../config/database')

const tableName = 'subcategories'
const Category = require('./Category')

const SubCategory = sequelize.define(
  'SubCategory',
  {
    cat_id: {
      type: Sequelize.INTEGER,
    },
    subcat_name: {
      type: Sequelize.STRING
    }
  },
  { tableName }
)
// SubCategory.belongsTo(Category, { foreignKey: 'cat_id' })

// eslint-disable-next-line
SubCategory.prototype.toJSON = function () {
  const values = Object.assign({}, this.get())

//   delete values.password

  return values
}

module.exports = SubCategory
