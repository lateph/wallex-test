const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transferSchema = new Schema(
    {
        fromPayment: {
            type: Schema.Types.ObjectId,
            ref: 'Payment',
            required: true
        },
        toPayment: {
            type: Schema.Types.ObjectId,
            ref: 'Payment',
            required: true
        },
        fromAccount: {
            type: Schema.Types.ObjectId,
            ref: 'Account',
            required: true
        },
        toAccount: {
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

module.exports = mongoose.model('Transfer', transferSchema);