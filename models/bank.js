const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bankSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        code: {
            type: String,
            required: true
        }
    },
    { timestamps: true}
);

module.exports = mongoose.model('Bank', bankSchema);