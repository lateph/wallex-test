const Account = require('../../models/account');
const Deposit = require('../../models/deposit');
const Payment = require('../../models/payment');

const { isAuthenticated, isEqualAuthenticated } = require('./auth-helper')
const { transformDeposit } = require('./merge');


module.exports = {
    deposit: async (_id, req) => {
        isAuthenticated(req)
        const deposit = await Deposit.findById(_id)
        return transformDeposit(deposit)
    },

    deposits: async (args, req) => {
        isAuthenticated(req)
        // return Deposit.find().populate("user").populate('bank').skip(args.pagination.skip).limit(args.pagination.limit).exec()
        const deposits = await Deposit.find(args.filter).skip(args.pagination.skip).limit(args.pagination.limit);
        return deposits.map(deposit => {
            return transformDeposit(deposit);
        });
    },
    
    createDeposit: async ({ input }, req) => {
        isAuthenticated(req)
        const session = await req.conn.startSession();
        await session.startTransaction();
        console.log("start session")
        await Payment.createCollection()
        await Deposit.createCollection()
        try {
            const opts = { session };
            const account = await Account.findOne({ _id: input.account})
            if(!account){
                throw new Error("Account not found")
            }
            if(account.user != req.user.userId){
                throw new Error("You dont own the account")
            }
            
            console.log("check ok")
            let newSaldo = account.balance + input.amount
            const newPayment = new Payment({
                account: input.account,
                paymentType: 'deposit',
                debit: 0,
                credit: input.amount,
                saldo: newSaldo,
            });

            await newPayment.save(opts)
            console.log("save payment ok", newPayment)

            const newDeposit = new Deposit({
                payment: newPayment._id,
                account: input.account,
                amount: input.amount,
                notes: input.notes,
            });

            account.balance = newSaldo
            await account.save(opts)
            const result = await newDeposit.save(opts)

            let response = transformDeposit(result);
            
            await session.commitTransaction();
            session.endSession();
            return response;
            // return result;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error
        }
    },

    updateDeposit: async ({_id, input}, req) => {
        isAuthenticated(req)
        const deposit = await Deposit.findByIdAndUpdate(_id, input);
        if (!deposit) {
            throw new Error('Deposit not found')
        }
        return await Deposit.findById(_id);
    },
}