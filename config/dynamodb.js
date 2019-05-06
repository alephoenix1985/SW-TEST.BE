'use strict';

const AWS = require('aws-sdk/index'); // eslint-disable-line import/no-extraneous-dependencies

let options = {};
const env = process.env.STAGE === 'dev' || !process.env.STAGE ? 'local' : process.env.STAGE;
if (!AWS.config.credentials.accessKeyId) {
    options = require('./dynamodb.json')[env];
} else if (env === 'local' || env === 'dev') {// connect to local DB if running offline
    options = {
        region: 'localhost',
        endpoint: 'http://localhost:8000',
    }
}

const client = new AWS.DynamoDB.DocumentClient(options);
module.exports = client;
