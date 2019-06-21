const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true});

userSchema.virtual('accounts', {
    ref: 'Account',
    localField: '_id',
    foreignField: 'user',
    justOne: false // set true for one-to-one relationship
})

module.exports = mongoose.model('User', userSchema);