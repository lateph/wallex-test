const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const accountSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bank: {
        type: Schema.Types.ObjectId,
        ref: 'Bank',
        required: true
    },
    accountNumber: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
}, { timestamps: true});

module.exports = mongoose.model('Account', accountSchema);