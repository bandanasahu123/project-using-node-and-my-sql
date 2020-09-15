// const bcrypt = require('bcrypt-nodejs')
const bcrypt = require('bcryptjs')
const saltRounds = 10

async function computeBcryptHash (password) {
  console.log('------------', password)
  return await bcrypt.hash(password, saltRounds)
}

async function compareBcryptHash (password, hash) {
  return await bcrypt.compare(password, hash)
}

module.exports = {
  compareBcryptHash,
  computeBcryptHash
}
