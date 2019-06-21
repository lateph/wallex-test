const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const Account = require('../../models/account');
const jwt = require('jsonwebtoken');
const { isAuthenticated } = require('./auth-helper')
module.exports = {
    user: (_id, req) => {
        isAuthenticated(req)
        return User.findById(_id)
    },
    users: (args, req) => {
        isAuthenticated(req)
        return User.find().skip(args.pagination.skip).limit(args.pagination.limit).exec()
    },
    createUser: async ({ input }) => {
        let user = await User.findOne({ email: input.email})
        if(user){
            throw new Error("User already exists")
        }
        let hashedPassword = await bcrypt.hash(input.password, 12)
        console.log(hashedPassword)
        const newUser = new User({
            email: input.email,
            password: hashedPassword
        })
        return await newUser.save()
    },
    updateUser: async ({_id, input}, req) => {
        isAuthenticated(req)
        const user = await User.findByIdAndUpdate(_id, input);
        if (!user) {
            throw new Error('User not found')
        }
        return await User.findById(_id);
    },
    deleteUser: async (_id, req) => {
        isAuthenticated(req)
        const account = await Account.findOne({ user: _id })
        if (account) {
            throw new Error('User cant be deleted')
        }
        const user = await User.findByIdAndRemove(_id)
        if (!user) {
            throw new Error('User not found')
        }
        return user;
    },
    login: async ({email, password}) => {
        const user = await User.findOne({ email })
        if (!user) {
            throw new Error('User not found')
        }
        const isEqual = await bcrypt.compare(password, user.password)
        if(!isEqual){
            throw new Error('Password is incorrect')
        }

        const token = jwt.sign({userId: user._id, email: user.email}, 'supergantengbanget', {
            expiresIn: '1d'
        })

        return {userId:user._id, token: token, tokenExpiration: 24};
    },
}