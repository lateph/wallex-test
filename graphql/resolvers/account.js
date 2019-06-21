const Account = require('../../models/account');
const User = require('../../models/user');
const Bank = require('../../models/bank');
const Payment = require('../../models/payment');

const { isAuthenticated, isEqualAuthenticated } = require('./auth-helper')
const { transformAccount } = require('./merge');


module.exports = {
    account: async (_id, req) => {
        isAuthenticated(req)
        const account = await Account.findById(_id)
        return transformAccount(account)
    },

    accounts: async (args, req) => {
        isAuthenticated(req)
        // return Account.find().populate("user").populate('bank').skip(args.pagination.skip).limit(args.pagination.limit).exec()

        const accounts = await Account.find().skip(args.pagination.skip).limit(args.pagination.limit);
        return accounts.map(account => {
            return transformAccount(account);
        });
    },
    
    createAccount: async ({ input }, req) => {
        isAuthenticated(req)
        try {
            const user = await User.findOne({ _id: req.user.userId})
            if(!user){
                throw new Error("User not found")
            }
            const bank = await Bank.findOne({ _id: input.bank})
            if(!bank){
                throw new Error("Bank not found")
            }
            const account = await Account.findOne({ bank: input.bank, user: req.user.userId})
            if(account){
                throw new Error("Account already exists")
            }
            const newAccount = new Account({
                user: req.user.userId,
                bank: input.bank,
                accountNumber: input.accountNumber,
                balance: 0
            });
            const result = await newAccount.save()
            return transformAccount(result);
        } catch (error) {
            throw error
        }
    },

    updateAccount: async ({_id, input}, req) => {
        const account = await Account.findByIdAndUpdate(_id, input);
        if (!account) {
            throw new Error('Account not found')
        }
        isEqualAuthenticated(req, account.user)

        return await module.exports.account(_id, req)
    },

    deleteAccount: async (_id, req) => {
        isAuthenticated(req)
        const payment = await Payment.findOne({ account: _id })
        if (payment) {
            throw new Error('Account cant be deleted')
        }
        const bank = await Account.findByIdAndRemove(_id)
        if (!bank) {
            throw new Error('Account not found')
        }
        return bank;
    },
}