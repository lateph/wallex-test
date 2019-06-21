const express = require('express');
const bodyParser = require('body-parser');
const grapqlHttp = require('express-graphql');
const mongoose = require('mongoose');
const jwt = require('express-jwt');
mongoose.set('useFindAndModify', false);

const schema = require('./graphql/schema/index')
const resolvers = require('./graphql/resolvers/index')
const app = express();

const cors = require('cors')
const helmet = require('helmet'); 
const auth = jwt({
    secret: "supergantengbanget",
    credentialsRequired: false
})

app.use(bodyParser.json());
app.use(cors());
app.use(helmet());
app.use(auth);

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-xjpks.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`)
    .then((conn) => {
        app.use('/graphql', grapqlHttp((request, response, graphQLParams) => ({
            schema: schema,
            rootValue: resolvers,
            graphiql: true,
            context: {
              ...request,
              conn: conn
            }
        })))
        app.listen(3000);
    })
    .catch(err => {
        console.log(err)
    })


