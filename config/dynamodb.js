'use strict';

const AWS = require('aws-sdk/index'); // eslint-disable-line import/no-extraneous-dependencies

let options = {};
const env = process.env.STAGE;
if (!AWS.config.credentials.accessKeyId) {
    options = require('./dynamodb.json')[env];
}
const client = new AWS.DynamoDB.DocumentClient(
    process.env.IS_OFFLINE ? {region: 'localhost', endpoint: 'http://localhost:8000'} : options
);
module.exports = client;
