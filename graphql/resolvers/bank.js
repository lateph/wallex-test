const Bank = require('../../models/bank');
const Account = require('../../models/account');
const { isAuthenticated } = require('./auth-helper')

module.exports = {
    bank: (_id, req) => {
        isAuthenticated(req)
        return Bank.findById(_id)
    },
    banks: (args, req) => {
        isAuthenticated(req)
        return Bank.find().skip(args.pagination.skip).limit(args.pagination.limit).exec()
    },
    updateBank: async ({_id, input}, req) => {
        isAuthenticated(req)
        const bank = await Bank.findByIdAndUpdate(_id, input);
        if (!bank) {
            throw new Error('Bank not found')
        }
        return await Bank.findById(_id);
    },
    createBank: async (args, req) => {
        isAuthenticated(req)
        const bank = new Bank(args.input);
        return newBank = await bank.save()
    },
    deleteBank: async (_id, req) => {
        isAuthenticated(req)
        const account = await Account.findOne({ bank: _id })
        if (account) {
            throw new Error('Bank cant be deleted')
        }
        const bank = await Bank.findByIdAndRemove(_id)
        if (!bank) {
            throw new Error('Bank not found')
        }
        return bank;
    },
}