const User = require('../models/User')

exports.checkSessionId = async function (req, res, next) {
  console.log('--------------- session -----------', req.session)
  if (!req.session.user) {
    console.log('no sesson ---------------')
    next()
  } else {
    const user = await User.findOne({
      where: {
        id: req.session.user.user.id
      }
    })
    if (!user) {
    } else {
      console.log(user.sessionId, '------------------------', req.sessionID)
      if (user.sessionId === req.sessionID) {
        next()
      } else {
        console.log('--------- destroy session id --------------------')
        req.session.destroy()
        res.redirect('/public/login')
      }
    }
  }
}
