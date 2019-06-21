const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    scalar DateTime
    union DetailPayment = Deposit | Transfer

    type Bank {
        _id: ID!
        name: String!
        code: String!
        createdAt: DateTime
        updatedAt: DateTime
    }
    input BankInput {
        name: String!
        code: String!
    }
    input BankInputEdit {
        name: String
        code: String
    }


    type User {
        _id: ID!
        email: String!
        createdAt: DateTime
        updatedAt: DateTime
        accounts: [Account!]
    }
    input UserInput {
        email: String!
        password: String
    }
    input UserInputEdit {
        email: String
    }

    type AuthData {
        userId: ID!
        token: String!
        tokenExpiration: Int!
    }

    type Payment {
        _id: ID!
        account: Account!
        paymentType: String!
        debit: Float!
        credit: Float!
        saldo: Float!
        detail: DetailPayment
        createdAt: DateTime
        updatedAt: DateTime
    }

    input PaymentInputFilter {
        account: ID
        paymentType: String
    }

    type Account {
        _id: ID!
        user: User!
        bank: Bank!
        accountNumber: String!
        balance: Float!
        createdAt: DateTime
        updatedAt: DateTime
    }
    input AccountInput {
        bank: ID!
        accountNumber: String!
    }
    input AccountInputEdit {
        accountNumber: String!
    }
    input PaginationArg {
        skip: Int = 0
        limit: Int = 0
    }

    type Deposit {
        _id: ID!
        payment: Payment!
        account: Account!
        amount: Float!
        notes: String
        createdAt: DateTime
        updatedAt: DateTime
    }
    input DepositInput {
        account: ID!
        amount: Float!
        notes: String
    }
    input DepositInputEdit {
        notes: String
    }
    input DepositInputFilter {
        account: ID
    }

    type Transfer {
        _id: ID!
        fromPayment: Payment!
        fromAccount: Account!
        toPayment: Payment!
        toAccount: Account!
        amount: Float!
        notes: String
        createdAt: DateTime
        updatedAt: DateTime
    }
    input TransferInput {
        account: ID!
        to: ID!
        amount: Float!
        notes: String
    }
    input TransferInputEdit {
        notes: String
    }
    input TransferInputFilter {
        toAccount: ID
        fromAccount: ID
    }
    
    type RootQuery {
        banks(pagination: PaginationArg= {}): [Bank!]!
        bank(_id: ID!): Bank!
        users(pagination: PaginationArg= {}): [User!]!
        user(_id: ID!): User!
        login(email: String!, password: String!): AuthData! 
        accounts(pagination: PaginationArg= {}): [Account!]!
        account(_id: ID!): Account!
        deposits(pagination: PaginationArg= {}, filter: DepositInputFilter = {}): [Deposit!]!
        deposit(_id: ID!): Deposit!
        transfers(pagination: PaginationArg= {}, filter: TransferInputFilter = {}): [Transfer!]!
        transfer(_id: ID!): Transfer!
        payments(pagination: PaginationArg= {}, filter: PaymentInputFilter = {}): [Payment!]!
        payment(_id: ID!): Payment!
    }
    type RootMutation {
        createBank(input: BankInput): Bank
        updateBank(_id: ID!, input: BankInputEdit): Bank
        deleteBank(_id: ID!): Bank

        createUser(input: UserInput): User
        updateUser(_id: ID!, input: UserInputEdit): User
        deleteUser(_id: ID!): User

        createAccount(input: AccountInput): Account
        updateAccount(_id: ID!, input: AccountInputEdit): Account
        deleteAccount(_id: ID!): Account

        createDeposit(input: DepositInput): Deposit
        updateDeposit(_id: ID!, input: DepositInputEdit): Deposit

        createTransfer(input: TransferInput): Transfer
        updateTransfer(_id: ID!, input: TransferInputEdit): Transfer
    }
    schema {
        query: RootQuery
        mutation: RootMutation
    }
`)