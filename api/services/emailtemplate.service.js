// dependencies
var fs = require('fs')
var config = require('../../helper.json')

const sendgrid = require('@sendgrid/mail')
sendgrid.setApiKey(
  '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'
)

function sendVerificationEmailThroughSendgrid (userData, token, type) {
  let subject, resetLink, dirName, finalData,toMail
  if (type === 'welcome') {
    subject = 'Welcome Mail'
    dirName = '../../../public/templates/welcome.html'
    resetLink = config.LOGIN_PAGE
  }
  if (type === 'reset') {
    subject = 'Reset password Mail'
    resetLink = config.RESET_PAGE + '/' + token
    dirName = '../../../public/templates/reset.html'
  }
  if (type === 'assignment-email') {
    subject = 'Review profile Mail'
    resetLink = config.DASHBAORD_PAGE
    dirName = '../../../public/templates/assignment-email.html'
  }
  if (type === 'profile-request') {
    subject = 'Reviewed profile Mail'
    resetLink = config.DASHBAORD_PAGE
    dirName = '../../../public/templates/profile-request.html'
  }
  console.log('--------------------------------------', dirName)
  return new Promise(function (resolve, reject) {
    fs.readFile(__dirname+ dirName, 'utf8', (err, contents) => {
      if (err) {
        console.log('error in read file----------------------', err)
        reject(err)
      } else {
        if (type === 'welcome') {
          var str = contents.replace('username', userData.name)
          var str1 = str.replace('useremail', userData.email)
          var str2 = str1.replace('login_url', resetLink)
          finalData = str2.replace('2016', new Date().getFullYear())
          toMail = 'deepa@origamicreative.com';
        }
        if (type === 'reset') {
          var str = contents.replace('username', userData.name)
          var str1 = str.replace('reset_url', resetLink)
          var str2 = str1.replace('reset_url1', resetLink)
          finalData = str2.replace('2016', new Date().getFullYear())
          toMail = userData.email;
        }
        if (type === 'assignment-email') {
          var str = contents.replace('AdminName', userData.name)
          var str1 = str.replace('review_url', resetLink)
          var str2 = str1.replace('review_url1', resetLink)
          finalData = str2.replace('2016', new Date().getFullYear())
          toMail = userData.email;
        }
        if (type === 'profile-request') {
          var str = contents.replace('check', userData.profile_type_request === 1 ? 'is' : 'is not')
          var str1 = str.replace('reviewprofile', userData.profile_type_request === 1 ? 'accpted' : 'rejected')
          var str2 = str1.replace('review_url', resetLink)
          var str3 = str2.replace('review_url1', resetLink)
          finalData = str3.replace('2016', new Date().getFullYear())
          toMail = userData.email;
        }
        console.log(config.EMAIL_SOURCE,toMail)
        const params = {
          to: toMail,
          from: config.EMAIL_SOURCE,
          subject: subject,
          html: finalData
        }

        return sendgrid
          .send(params)
          .then(function (data) {
            console.log('=============success mail===========',data)
            // console.log(data.MessageId)
            return resolve(data)
          })
          .catch(function (err) {
            console.error(
              '=========== eror in sending email================',
              err,
              err.stack
            )
            return reject(err)
          })
      }
    })
  })
}

module.exports = {
  sendVerificationEmailThroughSendgrid
}
