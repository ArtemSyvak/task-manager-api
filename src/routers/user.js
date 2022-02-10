const express = require('express')
const router = new express.Router()
const authMiddleware = require('../middleware/auth')
const UserController = require('../controllers/user')
const multer = require('multer')

const uploadUserAvatar = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload one of jpg, jpeg, png image format.'))
        }        
        cb(undefined, true)
    }
})

const uploadAvatarErrorHandler = (error, req, res, next) => {
    res.status(400).send({ error: error.message })
}

router.post('/signup', UserController.createUser)

router.post('/login', UserController.login)

router.post('/logout', authMiddleware, UserController.logout)

router.post('/logoutAll', authMiddleware, UserController.logoutAll)

router.get('/me', authMiddleware, UserController.getProfile)

router.patch('/me', authMiddleware, UserController.updateProfile)

router.delete('/me', authMiddleware, UserController.deleteProfile)

router.post('/me/avatar', [authMiddleware, uploadUserAvatar.single('avatar')], UserController.uploadAvatar, uploadAvatarErrorHandler)

router.get('/:id/avatar', UserController.getProfileAvatar)

router.delete('/me/avatar', authMiddleware, UserController.deleteAvatar)


module.exports = router
