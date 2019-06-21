const Account = require('../../models/account');
const Transfer = require('../../models/transfer');
const Payment = require('../../models/payment');

const { isAuthenticated, isEqualAuthenticated } = require('./auth-helper')
const { transformTransfer } = require('./merge');


module.exports = {
    transfer: async (_id, req) => {
        isAuthenticated(req)
        const transfer = await Transfer.findById(_id)
        return transformTransfer(transfer)
    },

    transfers: async (args, req) => {
        isAuthenticated(req)
        // return Transfer.find().populate("user").populate('bank').skip(args.pagination.skip).limit(args.pagination.limit).exec()

        const transfers = await Transfer.find(args.filter).skip(args.pagination.skip).limit(args.pagination.limit);
        return transfers.map(transfer => {
            return transformTransfer(transfer);
        });
    },
    
    createTransfer: async ({ input }, req) => {
        isAuthenticated(req)
        const session = await req.conn.startSession();
        await session.startTransaction();
        console.log("start session")
        await Payment.createCollection()
        await Transfer.createCollection()
        try {
            const opts = { session };
            const account = await Account.findOne({ _id: input.account})
            const accountTo = await Account.findOne({ _id: input.to})
            if(!account){
                throw new Error("Account not found")
            }
            if(!accountTo){
                throw new Error("Account not found")
            }
            if(account._id == accountTo._id){
                throw new Error("Cant Transfer same account")
            }
            if(account.user != req.user.userId){
                throw new Error("You dont own the account")
            }
            
            console.log("check ok")
            let newSaldoFrom = account.balance - input.amount
            let newSaldoTo = accountTo.balance + input.amount

            if(!newSaldoFrom < 0){
                throw new Error("Balance is not enaught")
            }

            const newPaymentFrom = new Payment({
                account: input.account,
                paymentType: 'transfer',
                debit: input.amount,
                credit: 0,
                saldo: newSaldoFrom,
            });

            await newPaymentFrom.save(opts)
            account.balance = newSaldoFrom
            await account.save(opts)

            const newPaymentTo = new Payment({
                account: input.to,
                paymentType: 'transfer',
                debit: 0,
                credit: input.amount,
                saldo: newSaldoTo,
            });

            await newPaymentTo.save(opts)
            accountTo.balance = newSaldoTo
            await accountTo.save(opts)

            const newTransfer = new Transfer({
                fromPayment: newPaymentFrom._id,
                fromAccount: input.account,
                toPayment: newPaymentTo._id,
                toAccount: input.to,
                
                amount: input.amount,
                notes: input.notes,
            });

            
            const result = await newTransfer.save(opts)

            let response = transformTransfer(result);
            
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

    updateTransfer: async ({_id, input}, req) => {
        isAuthenticated(req)
        const transfer = await Transfer.findByIdAndUpdate(_id, input);
        if (!transfer) {
            throw new Error('Transfer not found')
        }
        return await Transfer.findById(_id);
    },
}