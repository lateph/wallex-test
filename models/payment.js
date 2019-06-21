const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema(
    {
        account: {
            type: Schema.Types.ObjectId,
            ref: 'Account',
            required: true
        },
        paymentType: {
            type: String,
            enum : ['deposit','transfer'],
            required: true
        },
        debit: {
            type: Number,
            required: true
        },
        credit: {
            type: Number,
            required: true
        },
        saldo: {
            type: Number,
            required: true
        },
    },
    { timestamps: true}
);

module.exports = mongoose.model('Payment', paymentSchema);