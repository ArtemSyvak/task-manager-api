const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(email){
            if(!validator.isEmail(email)){
                throw new Error('Email is invalid')
            }            
        }
    },  
    age: {
        type: Number,
        default: 0,
        validate(value){
           if(value < 0){
               throw new Error('Age must be a positive number')
           } 
        },         
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 6,
        validate(pass){
            if(validator.contains(pass, 'password')){
                throw new Error('Password contains "password" word.')
            }            
        }
    },
    avatar:{
        type: Buffer
    },
    tokens: [{
        token:{
            type: String,
            required: true
        }
    }]
}, {
   timestamps: true 
 })

UserSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

UserSchema.methods.toJSON = function(){
    const user = this
    const userPublic = user.toObject()

    delete userPublic.password
    delete userPublic.tokens
    delete userPublic.avatar

    return userPublic
}

UserSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'thisismynewcourse')

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

UserSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if(!user){
        throw new Error('User not found')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error('Invalid password')
    }

    return user
}

// hash the plain text password before saving
UserSchema.pre('save', async function(next){
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

UserSchema.pre('remove', async function(next){
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})

const User = mongoose.model('User', UserSchema)

module.exports = User
