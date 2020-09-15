const User = require('../models/User')
const Category = require('../models/Category')
const SubCategory = require('../models/Subcategory')
const Project = require('../models/Project')
const Invoice = require('../models/Invoice')
const validator = require('validator')
const multer = require('multer')
const path = require('path')
const authService = require('../services/auth.service')
const bcryptService = require('../services/bcrypt.service')
const responseHanlrService = require('../services/responsehandler.service')
const emailTemplateService = require('../services/emailtemplate.service')
const jwt = require('jsonwebtoken')
var config = require('../../helper.json')
const sequelize = require('../../config/database')
const _ = require('lodash')
const async = require('async')

const storage = multer.diskStorage({
  destination: 'public/images/',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname)
    )
  }
})

const upload = multer({ storage: storage }).any()

const UserController = () => {
  const postSignup = async (req, res) => {
    let profilepicArr = [],
      multiImageArr = [],
      uploadCVArr = []
    upload(req, res, async err => {
      if (!err) {
        console.log(req.files)
        if (req.files && req.files.length > 0) {
          Object.keys(req.files).map((i, v) => {
            if (req.files[i].fieldname === 'profile_pic') {
              profilepicArr.push('/images/' + req.files[i].filename)
            } else if (req.files[i].fieldname === 'cvUpload') {
              uploadCVArr.push('/images/' + req.files[i].filename)
            }
          })
        }
        // return true
        const { body } = req
        // console.log(body)
        if (body.password === body.cPassword) {
          try {
            const user = await User.create({
              email: body.email,
              password: body.password,
              name: body.name,
              contact: body.contact,
              category_id: body.category_id,
              subcat_id: body.subcat_id,
              skills: body.skills,
              reference_link: body.reference_link,
              position: body.position,
              location: body.location,
              about: body.about,
              status: 1, // 1-active || 2 - approved || 3 - rejected || 0 - deleted
              role: 1, //For 1 - User || 0 - admin
              availability: 1, //For 1 - yesavailable || 0 - not
              createdAt: Date.now(),
              updatedAt: Date.now(),
              profile_pic:
                profilepicArr.length > 0
                  ? profilepicArr.toString()
                  : '/images/profile_pic-1591013995568.jpg',
              cv_upload: uploadCVArr.length > 0 ? uploadCVArr.toString() : null,
              // multiple_files:
              //   multiImageArr.length > 0 ? multiImageArr.toString() : null
              multiple_files:
                body.multipleImages.lenth > 0
                  ? body.multipleImages.toString()
                  : null
            })
            const emailService = await emailTemplateService.sendVerificationEmailThroughSendgrid(
              user,
              '',
              'welcome'
            )
            return res.json(
              responseHanlrService.successResponse(
                user,
                200,
                'Successfully User Signedup!!'
              )
            )
          } catch (err) {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', err)
            if (err.errors) {
              return res.json(
                responseHanlrService.errorResponse(
                  null,
                  400,
                  err.errors[0].message
                )
              )
            }

            return res.json(
              responseHanlrService.errorResponse(
                '',
                500,
                'Internal server error'
              )
            )
          }
        }
        return res.json(
          responseHanlrService.errorResponse(
            '',
            400,
            "Bad Request: Passwords don't match"
          )
        )
      } else {
        return res.json(
          responseHanlrService.errorResponse(
            '',
            500,
            'Error in uploading files'
          )
        )
      }
    })
  }

  const addAdmin = async (req, res) => {
    const { body } = req
    if (body.password === body.cPassword) {
      try {
        const user = await User.create({
          email: body.email,
          password: body.password,
          name: body.name,
          position: body.position,
          status: 1, // 1-active || 2 - approved || 3 - rejected || 0 - deleted
          admin_status: 0, // 0-pending || 1 - approved
          role: body.role, //For 1 - User || 0 - admin || 2- superadmin
          availability: 1, //For 1 - yesavailable || 0 - not
          createdAt: Date.now(),
          updatedAt: Date.now()
        })

        var info = {}
        info.email = body.email
        info.expiry = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
        var token = jwt.sign(info, config.tokenKey)
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>', token)

        const emailService = await emailTemplateService.sendVerificationEmailThroughSendgrid(
          user,
          token,
          'reset'
        )
        const userUpdate = await User.update(
          {
            passwordToken: token,
            pwdCreatedDate: Date.now()
          },
          {
            where: { email: body.email },
            returning: true,
            plain: true
          }
        )
        if (!userUpdate) {
          return res.json(
            responseHanlrService.errorResponse(
              '',
              400,
              'Bad Request: User not found'
            )
          )
        }

        return res.json(
          responseHanlrService.successResponse(
            user,
            200,
            'Successfully added admin and sent mail to particular admin to reset the password!!'
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
    return res.json(
      responseHanlrService.errorResponse(
        '',
        400,
        "Bad Request: Passwords don't match"
      )
    )
  }

  const postSignin = async (req, res) => {
    console.log('------------------post login--------------------')
    const { email, password } = req.body
    // console.log(req.body)
    if (email && password) {
      try {
        const user = await User.findOne({
          where: {
            email
          }
        })

        if (!user) {
          return res.json(
            responseHanlrService.errorResponse(
              '',
              400,
              'Bad Request: User not found'
            )
          )
        }

        let comaprePass = await bcryptService.compareBcryptHash(
          password,
          user.password
        )
        console.log(comaprePass)
        if (!comaprePass) {
          return res.json(
            responseHanlrService.errorResponse(
              '',
              401,
              'Unauthorized! Password is wrong'
            )
          )
        }
        const token = authService().issue({ id: user.id })
        let data = { token, user }
        console.log('------------ req.sessionId -------------', req.sessionID)
        user.role === 0
          ? (req.session.role = 'admin')
          : user.role === 2
          ? (req.session.role = 'superadmin')
          : user.role === 3
          ? (req.session.role = 'mainadmin')
          : (req.session.role = 'user')
        req.session.user = data
        let updateSession = await User.update(
          { sessionId: req.sessionID },
          { where: { id: user.id } }
        )
        console.log('--------------success -------------', req.session)
        return res.json(
          responseHanlrService.successResponse(
            data,
            200,
            'Successfully LoggedIn!!'
          )
        )
      } catch (err) {
        console.log(err)
        return res.json(
          responseHanlrService.errorResponse('', 500, 'Internal server error')
        )
      }
    }

    return res.json(
      responseHanlrService.errorResponse(
        '',
        500,
        'Bad Request: Email or password is wrong'
      )
    )
  }

  const getSignup = async (req, res) => {
    console.log('------------- get register page------------')
    res.render('register', {
      title: 'Signup || OrigamiResource',
      sessionData: false
    })
  }

  const getSignin = async (req, res) => {
    res.render('login', {
      title: 'Login || Admin',
      sessionData: false
    })
  }

  const renderThankyou = async (req, res) => {
    res.render('thankyou', {
      title: 'Thank you || User'
    })
  }

  const dashboard = async (req, res) => {
    console.log('-------dashboard---------', req.session.user, req.session.role)
    if (req.session.user) {
      const category = await Category.findAll()
      res.render('dashboard', {
        sessionData: true,
        role: req.session.role,
        title: 'Dashboard || Admin',
        data: JSON.stringify(category)
      })
    } else {
      console.log('--------- else ------------')
      res.redirect('/public/login')
    }
  }

  const renderSuperadmin = async (req, res) => {
    if (req.session.user) {
      let projectData = []
      let getAdmin, allUsers, invoices, projectDetails

      try {
        getAdmin = await User.findAll({
          where: {
            role: [0, 3]
          }
        })
        allUsers = await User.findAll({
          where: {
            role: 1
          }
        })
        invoices = await Invoice.findAll()
        projectDetails = await Project.findAll({
          include: [
            {
              model: Category
            }
          ]
        })

        await Promise.all(
          projectDetails.map(async project => {
            let userIds = project.user_id.split(',')
            const contents = await User.findAll({
              attributes: ['name', 'position'],
              where: {
                id: userIds
              }
            })
            projectData.push({
              project: project,
              user: contents
            })
          })
        )
        res.render('superadmin', {
          sessionData: true,
          role: req.session.role,
          adminDetails: getAdmin,
          usersDetails: allUsers,
          invoiceDetails: invoices,
          projectDetails: projectData,
          title: 'Dashboard || Admin'
        })
      } catch (error) {
        console.log(error)
      }
    } else {
      console.log('--------- else ------------')
      res.redirect('/public/login')
    }
  }

  const adminDashboard = async (req, res) => {
    if (req.session.user) {
      const category = await Category.findAll()
      const allUsers = await User.findAll({
        where: {
          role: 1
        }
      })
      const newUsers = await User.findAll({
        where: {
          role: 1,
          assigned_to: null
        }
      })
      const allAdmins = await User.findAll({
        where: {
          role: 0
        }
      })
      const mainAdmins = await User.findAll({
        where: {
          role: 3
        }
      })
      let projectData = []
      projectDetails = await Project.findAll({
        include: [
          {
            model: Category
          }
        ]
      })

      await Promise.all(
        projectDetails.map(async project => {
          let userIds = project.user_id.split(',')
          const contents = await User.findAll({
            attributes: ['name', 'position'],
            where: {
              id: userIds
            }
          })
          projectData.push({
            project: project,
            user: contents
          })
        })
      )

      const profileRequested = await User.findAll({
        where: {
          role: 1,
          profile_request: 1
        }
      })

      const invoices = await Invoice.findAll({
        include: [
          {
            model: Project
          },
          {
            model: User
          }
        ]
      })
      res.render('admin_dashboard', {
        categoryList: category,
        userList: allUsers,
        adminList: allAdmins,
        newUserList: newUsers,
        mainAdminList: mainAdmins,
        projectDetails: projectData,
        invoiceList: invoices,
        profRequestedList: profileRequested,
        sessionData: true,
        role: req.session.role,
        title: 'Dashboard || Admin'
      })
    } else {
      console.log('--------- else ------------')
      res.redirect('/public/login')
    }
  }

  const otherAdminDashboard = async (req, res) => {
    if (req.session.user) {
      console.log(req.session.user)
      const allUsers = await User.findAll({
        where: {
          role: 1,
          assigned_to: req.session.user.user.id
        }
      })
      const requestedProfiles = await User.findAll({
        where: {
          role: 1,
          assigned_to: req.session.user.user.id,
          status: 1
          // profile_request: 0
        }
      })

      const adminDetails = await User.findOne({
        where: {
          role: 0,
          id: req.session.user.user.id
        }
      })

      res.render('other_admin', {
        userList: allUsers,
        adminList: adminDetails,
        pendingProfiles: requestedProfiles,
        sessionData: true,
        role: req.session.role,
        title: 'Dashboard || Admin'
      })
    } else {
      console.log('--------- else ------------')
      res.redirect('/public/login')
    }
  }

  const userDashboard = async (req, res) => {
    if (req.session.user) {
      const userDetails = await User.findAll({
        where: {
          role: 1,
          id: req.session.user.user.id
        }
      })

      res.render('userportfolio_detail', {
        sessionData: true,
        role: req.session.role,
        userData: userDetails,
        title: 'Dashboard || User'
      })
    } else {
      console.log('--------- else ------------')
      res.redirect('/public/login')
    }
  }

  const publicDashboard = async (req, res) => {
    console.log('-------dashboard---------', req.session.user)
    const category = await Category.findAll()
    res.render('dashboard', {
      title: 'Dashboard || Admin',
      data: JSON.stringify(category),
      sessionData: false
    })
  }

  const getPortfolioPage = async (req, res) => {
    if (req.session.user) {
      const category = await Category.findAll()
      res.render('portfolio_detail', {
        sessionData: true,
        role: req.session.role,
        title: 'Portfolio Details || Admin',
        data: JSON.stringify(category)
      })
    } else {
      console.log('--------- else ------------')
      res.redirect('/public/login')
    }
  }

  const publicGetPortfolioPage = async (req, res) => {
    const category = await Category.findAll()
    res.render('portfolio_detail', {
      title: 'Portfolio Details || Admin',
      data: JSON.stringify(category),
      sessionData: false
    })
  }

  const getResetPassword = async (req, res) => {
    console.log('-------------------')
    res.render('resetpassword', {
      title: 'Reset password || Admin',
      sessionData: false
    })
  }

  const forgetPassword = async (req, res) => {
    const { email } = req.body

    if (email) {
      try {
        var info = {}
        info.email = email
        info.expiry = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
        var token = jwt.sign(info, config.tokenKey)
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>', token)

        const user = await User.findOne({
          where: {
            email
          }
        })

        if (!user) {
          return res.json(
            responseHanlrService.errorResponse(
              '',
              400,
              'Bad Request: User not found'
            )
          )
        }

        const emailService = await emailTemplateService.sendVerificationEmailThroughSendgrid(
          user,
          token,
          'reset'
        )

        const userUpdate = await User.update(
          {
            passwordToken: token,
            pwdCreatedDate: Date.now()
          },
          {
            where: { email: email },
            returning: true,
            plain: true
          }
        )
        if (!userUpdate) {
          return res.json(
            responseHanlrService.errorResponse(
              '',
              400,
              'Bad Request: User not found'
            )
          )
        }
        return res.json(
          responseHanlrService.successResponse(
            null,
            200,
            'Mail sent succesfully, Pleas check your mail!!'
          )
        )
      } catch (err) {
        console.log(err)
        return res.json(
          responseHanlrService.errorResponse('', 500, 'Internal server error')
        )
      }
    }

    return res.json(
      responseHanlrService.errorResponse('', 500, 'Bad Request: Email is wrong')
    )
  }

  const resetPassword = async (req, res) => {
    const { newPassword, confirmPassword, token } = req.body

    if (newPassword === confirmPassword) {
      try {
        var decodedToken = jwt.decode(token, config.tokenKey)
        console.log(decodedToken)
        if (new Date(decodedToken.expiry) > new Date()) {
          const user = await User.findOne({
            where: {
              email: decodedToken.email,
              passwordToken: token
            }
          })
          if (!user) {
            return res.json(
              responseHanlrService.errorResponse(
                '',
                400,
                'No token is there or Already updated the password'
              )
            )
          }

          let hashedNewPwd = await bcryptService.computeBcryptHash(
            confirmPassword
          )
          console.log('hashedNewPwd', hashedNewPwd)
          const userUpdate = await User.update(
            {
              passwordToken: null,
              password: hashedNewPwd,
              admin_status: 1
            },
            {
              where: { email: decodedToken.email },
              returning: true,
              plain: true
            }
          )

          return res.json(
            responseHanlrService.successResponse(
              '',
              200,
              'Successfully changed the password!!'
            )
          )
        }

        return res.json(
          responseHanlrService.errorResponse('', 400, 'Token expired!!')
        )
      } catch (err) {
        console.log(err)
        return res.json(
          responseHanlrService.errorResponse('', 500, 'Internal server error')
        )
      }
    }

    return res.json(
      responseHanlrService.errorResponse(
        '',
        400,
        `Bad Request: Passwords don't match`
      )
    )
  }

  const assignProfileToAdmin = async (req, res) => {
    const { userId, adminId } = req.body

    if (adminId) {
      try {
        // var info = {}
        // info.email = email
        // info.expiry = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
        // var token = jwt.sign(info, config.tokenKey)
        // console.log('>>>>>>>>>>>>>>>>>>>>>>>>', token)

        const adminDetails = await User.findOne({
          where: {
            id: adminId
          }
        })

        if (!adminDetails) {
          return res.json(
            responseHanlrService.errorResponse(
              '',
              400,
              'Bad Request: User not found'
            )
          )
        }

        const emailService = await emailTemplateService.sendVerificationEmailThroughSendgrid(
          adminDetails,
          '',
          'assignment-email'
        )

        const userUpdate = await User.update(
          {
            assigned_to: adminId
          },
          {
            where: { id: userId },
            returning: true,
            plain: true
          }
        )
        if (!userUpdate) {
          return res.json(
            responseHanlrService.errorResponse(
              '',
              400,
              'Bad Request: User not found'
            )
          )
        }
        return res.json(
          responseHanlrService.successResponse(
            null,
            200,
            'Successfully assigned admin to review the user profilel!!'
          )
        )
      } catch (err) {
        console.log(err)
        return res.json(
          responseHanlrService.errorResponse('', 500, 'Internal server error')
        )
      }
    }

    return res.json(
      responseHanlrService.errorResponse(
        '',
        500,
        'Bad Request: No admin has been assigned'
      )
    )
  }

  const getUserInfo = async (req, res) => {
    let { id } = req.body
    // if (req.session.role === 'user') {
    //   id = req.session.user.user.id
    // }
    // console.log('---------------', id, req.session.role, req.session.user)
    if (id) {
      try {
        const userDetails = await User.findAll({
          where: { id: id },
          include: [Category, SubCategory]
        })

        let userInfo = []
        await Promise.all(
          userDetails.map(async project => {
            let names = null
            if (project.project_id) {
              let projectIds = project.project_id.split(',')
              names = await Project.findAll({
                attributes: ['name'],
                where: {
                  id: projectIds
                }
              })
            }

            userInfo.push({
              project: names,
              user: project
            })
          })
        )

        if (!userDetails) {
          return res.json(
            responseHanlrService.errorResponse(
              '',
              400,
              'Bad request! No user found.'
            )
          )
        }
        return res.json(
          responseHanlrService.successResponse(userInfo, 200, 'Success!!')
        )
      } catch (err) {
        console.log(err)
        return res.json(
          responseHanlrService.errorResponse('', 500, 'Internal server error')
        )
      }
    }
  }

  const getUserByCategory = async (req, res) => {
    const { catId, subcatId } = req.body
    let users,
      subcategory = ''
    try {
      if (subcatId) {
        if (req.session.user && req.session.role === 'admin') {
          users = await User.findAll({
            where: {
              status: [1, 2],
              subcat_id: subcatId,
              availability: [1],
              role: 1
            }
            // include: [Category]
          })
        } else {
          users = await User.findAll({
            where: {
              status: [1, 2, 3],
              subcat_id: subcatId,
              availability: [0, 1],
              role: 1
            }
            // include: [Category]
          })
        }
        subcategory = await SubCategory.findAll({
          where: {
            cat_id: catId
          }
        })
      } else if (catId) {
        if (req.session.user && req.session.role === 'admin') {
          users = await User.findAll({
            where: {
              status: [1, 2],
              category_id: catId,
              availability: [1],
              role: 1
            },
            include: [Category]
          })
        } else {
          users = await User.findAll({
            where: {
              status: [1, 2, 3],
              category_id: catId,
              availability: [0, 1],
              role: 1
            },
            include: [Category]
          })
        }
        subcategory = await SubCategory.findAll({
          where: {
            cat_id: catId
          }
        })
      } else {
        console.log(req.session.user)
        if (req.session.user && req.session.role === 'admin') {
          users = await User.findAll({
            where: {
              status: [1, 2],
              availability: [1],
              role: 1
            }
          })
        } else {
          users = await User.findAll({
            where: {
              status: [1, 2, 3],
              availability: [0, 1],
              role: 1
            }
          })
        }
      }

      // console.log(users)
      if (!users) {
        return res.json(
          responseHanlrService.errorResponse(
            '',
            400,
            'Bad request! No user found.'
          )
        )
      }

      const data = {
        users: users,
        subcategory: subcategory
      }
      return res.json(
        responseHanlrService.successResponse(
          data,
          200,
          'Success!! All the registered users'
        )
      )
    } catch (err) {
      console.log(err)
      return res.json(
        responseHanlrService.errorResponse('', 500, 'Internal server error')
      )
    }
  }

  const getUsers = async (req, res) => {
    const { catId } = req.body

    try {
      const users = await User.findAll({
        where: {
          status: [1, 2, 3],
          category_id: catId,
          availability: [0, 1],
          role: 1
        }
      })

      if (!users) {
        return res.json(
          responseHanlrService.errorResponse(
            '',
            400,
            'Bad request! No user found.'
          )
        )
      }

      return res.json(
        responseHanlrService.successResponse(
          users,
          200,
          'Success!! All the users'
        )
      )
    } catch (err) {
      console.log(err)
      return res.json(
        responseHanlrService.errorResponse('', 500, 'Internal server error')
      )
    }
  }

  // const Op = Sequelize.Op;
  const seachCategory = async (req, res) => {
    const { name } = req.body
    let users
    try {
      if (req.session.user && req.session.role === 'admin') {
        // users = await User.findAll({
        //   where: {
        //     status: [1, 2],
        //     category_id: catId,
        //     availability: [1]
        //   },
        //   include: [Category]
        // })

        users = await Category.findAll({
          include: [
            {
              model: SubCategory,
              where: {
                subcat_name: sequelize.where(
                  sequelize.fn('LOWER', sequelize.col('subcat_name')),
                  'LIKE',
                  '%' + name + '%'
                )
              },
              name: sequelize.where(
                sequelize.fn('LOWER', sequelize.col('Category.name')),
                'LIKE',
                '%' + name + '%'
              )
            },
            {
              model: User,
              where: {
                status: [1, 2],
                availability: [1]
              }
            }
          ]
        })
      } else {
        users = await Category.findAll({
          include: [
            {
              model: SubCategory,
              where: {
                subcat_name: sequelize.where(
                  sequelize.fn('LOWER', sequelize.col('subcat_name')),
                  'LIKE',
                  '%' + name + '%'
                )
              },
              name: sequelize.where(
                sequelize.fn('LOWER', sequelize.col('Category.name')),
                'LIKE',
                '%' + name + '%'
              )
            },
            {
              model: User,
              where: {
                status: [1, 2, 3],
                availability: [0, 1]
              }
            }
          ]
        })
      }

      // console.log(users)
      if (!users) {
        return res.json(
          responseHanlrService.errorResponse(
            '',
            400,
            'Bad request! No user found.'
          )
        )
      }
      return res.json(
        responseHanlrService.successResponse(
          users,
          200,
          'Success!! All the registered users'
        )
      )
    } catch (err) {
      console.log(err)
      return res.json(
        responseHanlrService.errorResponse('', 500, 'Internal server error')
      )
    }
  }

  const updateuserStatus = async (req, res) => {
    const { status, userId } = req.body
    console.log('---------------', parseInt(status), typeof parseInt(status))
    // return true;
    try {
      let users
      // status 0 means profile approved and 1 means profile rejected
      if (parseInt(status) === 0) {
        users = await User.update(
          { status: 2, profile_request: 0 },
          { where: { id: userId } }
        )
      } else {
        users = await User.update(
          { status: 3, profile_request: 0 },
          { where: { id: userId } }
        )
      }

      if (!users) {
        return res.json(
          responseHanlrService.errorResponse(
            '',
            400,
            'Bad request! No user found.'
          )
        )
      }
      return res.json(
        responseHanlrService.successResponse(
          '',
          200,
          'Successfully updated user status.'
        )
      )
    } catch (err) {
      console.log(err)
      return res.json(
        responseHanlrService.errorResponse('', 500, 'Internal server error')
      )
    }
  }

  const updateuserRating = async (req, res) => {
    const { rating, userId } = req.body
    console.log('---------------', rating)
    try {
      let users = await User.update(
        { rating: rating },
        { where: { id: userId } }
      )

      if (!users) {
        return res.json(
          responseHanlrService.errorResponse(
            '',
            400,
            'Bad request! No user found.'
          )
        )
      }
      return res.json(
        responseHanlrService.successResponse(
          '',
          200,
          'Successfully updated user rating.'
        )
      )
    } catch (err) {
      console.log(err)
      return res.json(
        responseHanlrService.errorResponse('', 500, 'Internal server error')
      )
    }
  }

  const rejectOrAcceptprofile = async (req, res) => {
    const { status, userId, feedback } = req.body
    console.log('--------feedback-------', status, feedback)
    try {
      let users
      let emailData

      // status 0 means profile rejected and 1 means profile approved
      if (status == 0) {
        emailData = {
          email: 'bandanasahu8@gmail.com',
          profile_type_request: 2
        }
        const emailService = await emailTemplateService.sendVerificationEmailThroughSendgrid(
          emailData,
          '',
          'profile-request'
        )
        users = await User.update(
          {
            profile_request: 1,
            profile_type_request: 2,
            feedback: feedback
          },
          { where: { id: userId } }
        )
      } else {
        emailData = {
          email: 'bandanasahu8@gmail.com',
          profile_type_request: 1
        }
        const emailService = await emailTemplateService.sendVerificationEmailThroughSendgrid(
          emailData,
          '',
          'profile-request'
        )

        users = await User.update(
          { profile_request: 1, profile_type_request: 1, feedback: feedback },
          { where: { id: userId } }
        )
      }

      if (!users) {
        return res.json(
          responseHanlrService.errorResponse(
            '',
            400,
            'Bad request! No user found.'
          )
        )
      }
      return res.json(
        responseHanlrService.successResponse(
          '',
          200,
          'Successfully updated user status.'
        )
      )
    } catch (err) {
      console.log(err)
      return res.json(
        responseHanlrService.errorResponse('', 500, 'Internal server error')
      )
    }
  }

  const deleteAdmin = async (req, res) => {
    const { userId } = req.body
    console.log('---------------', userId)
    try {
      let users = await User.destroy({ where: { id: userId } })

      if (!users) {
        return res.json(
          responseHanlrService.errorResponse(
            '',
            400,
            'Bad request! No user found.'
          )
        )
      }
      const getAdmin = await User.findAll({
        where: {
          role: [0, 3]
        }
      })
      return res.json(
        responseHanlrService.successResponse(
          getAdmin,
          200,
          'Successfully deleted admin.'
        )
      )
    } catch (err) {
      console.log(err)
      return res.json(
        responseHanlrService.errorResponse('', 500, 'Internal server error')
      )
    }
  }

  const updateUserProfile = async (req, res) => {
    upload(req, res, async err => {
      if (!err) {
        console.log(req.body)
        const { body } = req
        const userId = body.userId
        const allUsers = await User.findOne({
          where: { id: userId }
        })
        console.log(allUsers.dataValues.profile_pic)
        req.files && req.files.length > 0
          ? (req.body.profile_pic = '/images/' + req.files[0].filename)
          : (req.body.profile_pic = allUsers.dataValues.profile_pic)

        console.log(req.body)

        delete body.userId
        console.log('---------------', body, userId)
        try {
          const users = await User.update(body, { where: { id: userId } })
          const userData = await User.findOne({
            where: { id: userId }
          })
          console.log(users)
          if (!users) {
            return res.json(
              responseHanlrService.errorResponse(
                '',
                400,
                'Bad request! No user found.'
              )
            )
          }
          return res.json(
            responseHanlrService.successResponse(
              userData,
              200,
              'Successfully updated user info!!.'
            )
          )
        } catch (err) {
          console.log(err)
          return res.json(
            responseHanlrService.errorResponse('', 500, 'Internal server error')
          )
        }
      } else {
        return res.json(
          responseHanlrService.errorResponse(
            '',
            500,
            'Error in uploading files'
          )
        )
      }
    })
  }

  const uploadImage = async (req, res) => {
    upload(req, res, async err => {
      if (!err) {
        let uploadedPic = ''
        let multiImageArr = [],
          multiImageArr1 = []

        if (req.files && req.files.length > 0) {
          Object.keys(req.files).map((i, v) => {
            if (req.files[i].fieldname === 'image') {
              multiImageArr.push('/images/' + req.files[i].filename)
            } else {
              multiImageArr1.push('/images/' + req.files[i].filename)
            }
          })
        }

        // ? (uploadedPic = '/images/' + req.files[0].filename)
        // : (uploadedPic = null)

        return res.json(
          responseHanlrService.successResponse(
            multiImageArr,
            200,
            'Successfully uploaded the image!!.'
          )
        )
      } else {
        return res.json(
          responseHanlrService.errorResponse(
            '',
            500,
            'Error in uploading files'
          )
        )
      }
    })
  }

  const logoutUser = async (req, res) => {
    try {
      console.log('=====================', req.session)
      let userId = req.body.id || req.session.user.user.id
      const update = await User.update(
        { sessionId: null },
        { where: { id: userId } }
      )
      if (!update) {
        return res.json(
          responseHanlrService.errorResponse(
            '',
            400,
            'Bad request! No user found.'
          )
        )
      }
      return res.json(
        responseHanlrService.successResponse('', 200, 'Successfully loggedout.')
      )
    } catch (err) {
      console.log(err, '>>>>>>>>>>>>>>>>>>>>>>>>>')
      return res.json(
        responseHanlrService.errorResponse('', 500, 'Internal server error.')
      )
    }
  }

  const privacy = async (req, res) => {
    res.render('privacy', {
      sessionData: false
    })
  }
  const help = async (req, res) => {
    res.render('help', {
      sessionData: false
    })
  }
  const community = async (req, res) => {
    res.render('community', {
      sessionData: false
    })
  }

  return {
    uploadImage,
    getSignup,
    postSignup,
    postSignin,
    getSignin,
    forgetPassword,
    resetPassword,
    getUserInfo,
    getUserByCategory,
    rejectOrAcceptprofile,
    dashboard,
    getPortfolioPage,
    seachCategory,
    renderThankyou,
    getResetPassword,
    logoutUser,
    updateuserRating,
    publicGetPortfolioPage,
    publicDashboard,
    userDashboard,
    updateUserProfile,
    addAdmin,
    deleteAdmin,
    renderSuperadmin,
    adminDashboard,
    getUsers,
    otherAdminDashboard,
    assignProfileToAdmin,
    updateuserStatus,
    help,
    privacy,
    community
  }
}

module.exports = UserController
