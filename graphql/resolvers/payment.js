const Payment = require('../../models/payment');

const { isAuthenticated, isEqualAuthenticated } = require('./auth-helper')
const { transformPayment } = require('./merge');


module.exports = {
    payment: async (_id, req) => {
        isAuthenticated(req)
        const payment = await Payment.findById(_id)
        return transformPayment(payment)
    },

    payments: async (args, req) => {
        isAuthenticated(req)
        // return Payment.find().populate("user").populate('bank').skip(args.pagination.skip).limit(args.pagination.limit).exec()

        const payments = await Payment.find(args.filter).skip(args.pagination.skip).limit(args.pagination.limit);
        return payments.map(payment => {
            return transformPayment(payment);
        });
    },
}