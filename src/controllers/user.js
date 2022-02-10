const sharp = require('sharp')
const User = require('../models/user')
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')

exports.createUser = async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error) 
    }
}

exports.login = async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (error) {
        res.status(400).send()
    }
}

exports.logout = async (req, res) => {   
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)

        await req.user.save()

        res.status(200).send()
    } catch (error) {
        res.status(500).send(error)
    }
}

exports.logoutAll = async (req, res) => {   
    try {
        req.user.tokens = []

        await req.user.save()

        res.status(200).send()
    } catch (error) {
        res.status(500).send(error)
    }
}

exports.getProfile = async (req, res) => {
    res.send(req.user)
}

exports.updateProfile = async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (error) {
        res.status(400).send(error)
    }
}

exports.deleteProfile = async (req, res) => {
    try {       
        await req.user.remove() 
        sendCancelationEmail(req.user.email, req.user.name)       
        res.send(req.user)
    } catch (error) {
        res.status(500).send()
    }
}


exports.uploadAvatar = async (req, res, next) => {        
    try {
        const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
        req.user.avatar = buffer
        await req.user.save()
        res.send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
}

exports.deleteAvatar = async (req, res, next) => {
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.status(200).send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
}

exports.getProfileAvatar = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error('User or User avatar not found')
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)

    } catch (error) {
        res.sendStatus(404)
    }
}
