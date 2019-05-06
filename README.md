# SweatWorks Test App - Back End 
## Serverless REST API with DynamoDB and offline support

This example demonstrates how to run a service locally, using the
[serverless-offline](https://github.com/dherault/serverless-offline) plugin. It
provides a REST API to manage Authors stored in a DynamoDB, similar to the
[aws-node-rest-api-with-dynamodb](https://github.com/serverless/examples/tree/master/aws-node-rest-api-with-dynamodb)
example. A local DynamoDB instance is provided by the
[serverless-dynamodb-local](https://github.com/99xt/serverless-dynamodb-local)
plugin.

## Use-case

Test your service locally, without having to deploy it first.

## Setup

```bash
npm install
serverless dynamodb install
serverless offline start
```

## AWS - Credentials

The Serverless Framework needs access to a cloud provider's account so that it can create and manage resources on your behalf.


For this test i did use AWS from Amazon. I use next command to register credentials.

```bash
serverless config credentials --provider aws --key [AWS_KEY] --secret [AWS_SECRET]
```
you could also modify credentials in the [config/dynamodb.json] file (It is needed for testing offline)



If you have doubts about how to do it, please checkout next link from [Serverless docs site](https://serverless.com/framework/docs/providers/aws/guide/credentials/)

## Run service offline

```bash
serverless offline start
```
or
```bash
npm start
```

## Test

Endpoints has unit test using supertest. To execute the tests run:

```bash
npm run test
``` 
It will first run an offline service with local dynamoDB locally, 
and execute a full cycle of CRUD for Author and Publication. Creating and deleting the same item.

## Stages

You change dev or prod with preset script

```bash
npm run deploy-dev
npm run deploy-prod
```

or any with sls command and stage remember adding AWS configuration for each.

## Usage

You can create, retrieve, update, or delete authors with the following commands:

### Create a Author

```bash
curl -X POST -H "Content-Type:application/json" http://localhost:3000/author --data '{"name":"name1","email": "email1","birthDate": "12/01/1985"}'
```

Example Result:
```bash
{"text":"Learn Serverless","id":"ee6490d0-aa11e6-9ede-afdfa051af86","createdAt":1479138570824,"checked":false,"updatedAt":1479138570824}%
```

### List all Authors

```bash
curl -H "Content-Type:application/json" http://localhost:3000/author
```

Example output:
```bash
[{"text":"Deploy my first service","id":"ac90feaa11e6-9ede-afdfa051af86","checked":true,"updatedAt":1479139961304},{"text":"Learn Serverless","id":"206793aa11e6-9ede-afdfa051af86","createdAt":1479139943241,"checked":false,"updatedAt":1479139943241}]%
```

### Get one Author

```bash
# Replace the <id> part with a real id from your authors table
curl -H "Content-Type:application/json" http://localhost:3000/author/<id>
```

Example Result:
```bash
{"text":"Learn Serverless","id":"ee6490d0-aa11e6-9ede-afdfa051af86","createdAt":1479138570824,"checked":false,"updatedAt":1479138570824}%
```

### Update a Author

```bash
# Replace the <id> part with a real id from your authors table
curl -X PUT -H "Content-Type:application/json" http://localhost:3000/author/<id> --data '{ "text": "Learn Serverless", "checked": true }'
```

Example Result:
```bash
{"text":"Learn Serverless","id":"ee6490d0-aa11e6-9ede-afdfa051af86","createdAt":1479138570824,"checked":true,"updatedAt":1479138570824}%
```

### Delete a Author

```bash
# Replace the <id> part with a real id from your authors table
curl -X DELETE -H "Content-Type:application/json" http://localhost:3000/author/<id>
```

No output
