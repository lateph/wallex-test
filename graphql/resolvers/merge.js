const DataLoader = require('dataloader');
const User = require('../../models/user');
const Bank = require('../../models/bank');
const Account = require('../../models/account');
const Payment = require('../../models/payment');
const Deposit = require('../../models/deposit');
const Transfer = require('../../models/transfer');

const userLoader = new DataLoader(userIds => {
    console.log("userLoader",userIds)
    return User.find({ _id: { $in: userIds } }).populate("accounts");
});

const bankLoader = new DataLoader(bankIds => {
    console.log("bankLoader",bankIds)
    return Bank.find({ _id: { $in: bankIds } });
});

const accountLoader = new DataLoader((accountsIds) => {
    console.log("accountLoader",accountsIds)
    return accounts(accountsIds);
});

const paymentLoader = new DataLoader((paymentsIds) => {
  console.log("paymentLoader",paymentsIds)
  return payments(paymentsIds);
});

const depositByIdPaymentLoader = new DataLoader((paymentsIds) => {
  console.log("depositByIdPaymentLoader",paymentsIds)
  return depositByIdPayments(paymentsIds);
});

const transferByIdPaymentFromLoader = new DataLoader((paymentsIds) => {
  console.log("transferByIdPaymentLoader",paymentsIds)
  return transferByIdPaymentsFrom(paymentsIds);
});

const transferByIdPaymentToLoader = new DataLoader((paymentsIds) => {
  console.log("transferByIdPaymenToLoader",paymentsIds)
  return transferByIdPaymentsTo(paymentsIds);
});

const accounts = async accountsIds => {
  try {
    const accounts = await Account.find({ _id: { $in: accountsIds } });
    accounts.sort((a, b) => {
      return (
        accountsIds.indexOf(a._id.toString()) - accountsIds.indexOf(b._id.toString())
      );
    });
    return accounts.map(event => {
      return transformAccount(event);
    });
  } catch (err) {
    throw err;
  }
};

const payments = async paymentsIds => {
  try {
    const payments = await Payment.find({ _id: { $in: paymentsIds } });
    payments.sort((a, b) => {
      return (
        paymentsIds.indexOf(a._id.toString()) - paymentsIds.indexOf(b._id.toString())
      );
    });
    return payments.map(event => {
      return transformPayment(event);
    });
  } catch (err) {
    throw err;
  }
};

const depositByIdPayments = async paymentsIds => {
  try {
    const deposits = await Deposit.find({ payment: { $in: paymentsIds } });
    deposits.sort((a, b) => {
      return (
        paymentsIds.indexOf(a.payment.toString()) - paymentsIds.indexOf(b.payment.toString())
      );
    });
    return deposits.map(event => {
      return transformDeposit(event);
    });
  } catch (err) {
    console.log(err)
    throw err;
  }
};

const transferByIdPaymentsFrom = async paymentsIds => {
  try {
    const transfers = await Transfer.find({ fromPayment: { $in: paymentsIds } });
    transfers.sort((a, b) => {
      return (
        paymentsIds.indexOf(a.fromPayment.toString()) - paymentsIds.indexOf(b.fromPayment.toString())
      );
    });
    console.log("transferids", transfers)
    return transfers.map(t => {
      return transformTransfer(t);
    });
  } catch (err) {
    console.log(err)
    throw err;
  }
};

const transferByIdPaymentsTo = async paymentsIds => {
  try {
    const transfers = await Transfer.find({ toPayment: { $in: paymentsIds } });
    transfers.sort((a, b) => {
      return (
        paymentsIds.indexOf(a.toPayment.toString()) - paymentsIds.indexOf(b.toPayment.toString())
      );
    });
    console.log("transferids", transfers)
    return transfers.map(t => {
      return transformTransfer(t);
    });
  } catch (err) {
    console.log(err)
    throw err;
  }
};

const user = async userId => {
    try {
      const user = await userLoader.load(userId.toString());
      return transformUser(user);
    } catch (err) {
      throw err;
    }
};

const bank = async bankId => {
    try {
      const bank = await bankLoader.load(bankId.toString());
      return {
        ...bank._doc,
        _id: bank.id,
      };
    } catch (err) {
      throw err;
    }
};

const account = async accountId => {
  try {
    const account = await accountLoader.load(accountId.toString());
    return account;
  } catch (err) {
    throw err;
  }
};

const payment = async paymentId => {
  try {
    const payment = await paymentLoader.load(paymentId.toString());
    return payment;
  } catch (err) {
    throw err;
  }
};

const transformUser = user => {
    return {
        ...user._doc,
        _id: user.id,
        accounts: () => accountLoader.loadMany(user.accounts.map(ret => {
            return ret._id
        }))
    };
};

const transformAccount = account => {
    console.log("account")
    return {
        ...account._doc,
        _id: account.id,
        user: user.bind(this, account._doc.user),
        bank: bank.bind(this, account._doc.bank),
    };
};

const transformPayment = payment => {
  // console.log("payment")
  return {
      ...payment._doc,
      _id: payment.id,
      account: account.bind(this, payment._doc.account),
      detail: () => {
        if(payment._doc.paymentType == "deposit"){
          return depositByIdPaymentLoader.load(payment.id.toString())
        }
        if(payment._doc.paymentType == "transfer"){
          if(payment._doc.credit == 0){
            return transferByIdPaymentFromLoader.load(payment.id.toString())
          }
          else{
            return transferByIdPaymentToLoader.load(payment.id.toString())
          }
        }
      }
  };
};

const transformDeposit = deposit => {
  console.log("deposit")
  return {
      ...deposit._doc,
      _id: deposit.id,
      account: account.bind(this, deposit._doc.account),
      payment: payment.bind(this, deposit._doc.payment),
      __typename: 'Deposit',
  };
};

const transformTransfer = transfer => {
  console.log("transfer")
  return {
      ...transfer._doc,
      _id: transfer.id,
      fromAccount: account.bind(this, transfer._doc.fromAccount),
      fromPayment: payment.bind(this, transfer._doc.fromPayment),
      toAccount: account.bind(this, transfer._doc.toAccount),
      toPayment: payment.bind(this, transfer._doc.toPayment),
      __typename: 'Transfer',
  };
};

exports.transformAccount = transformAccount;
exports.transformDeposit = transformDeposit;
exports.transformPayment = transformPayment;
exports.transformTransfer = transformTransfer;
exports.transformUser = transformUser;