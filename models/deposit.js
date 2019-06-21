const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const depositSchema = new Schema(
    {
        payment: {
            type: Schema.Types.ObjectId,
            ref: 'Payment',
            required: true
        },
        account: {
            type: Schema.Types.ObjectId,
            ref: 'Account',
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        notes: {
            type: String,
            required: true
        },
    },
    { timestamps: true}
);

module.exports = mongoose.model('Deposit', depositSchema);