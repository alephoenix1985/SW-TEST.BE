'use strict';

const dynamoDB = require('../../config/dynamodb');
const uh = require('../helpers/util.helper');

module.exports = {
    save: save,
    find: find,
    update: update,
    remove: remove
};

function save(values, options) {
    return new Promise((resolve, reject) => {
        const model = new options.model(values);
        if (!model.validate.isValid) return reject({status: 400, error: model.validate.errors});

        const params = {
            TableName: options.tableName,
            Item: model.clean(),
        };

        dynamoDB.put(params, (error, result) => {
            if (error) return reject(error);
            resolve(params.Item)
        });
    })
}

function find(where, options) {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: options.tableName
        };
        if (options.all) {
            options.limit = parseInt(options.limit) || 10;
            if (options.lastKey) {
                params['ExclusiveStartKey'] = options.lastKey
            }

            if (options.filters) {
                params['Limit'] = options.limit;
                // params['ScanIndexForward'] = !!parseInt(options.order);
                const modelParsed = uh.cleanNestedObject(parseModel(new options.model(), options.filters));
                params['ExpressionAttributeNames'] = modelParsed.names;
                params['ExpressionAttributeValues'] = modelParsed.values;
                params['FilterExpression'] = modelParsed.filter;
                dynamoDB.scan(params, function scanUntilDone(error, result) {
                    if (error) return reject(error);
                    // if (result.LastEvaluatedKey) {
                    //     params.ExclusiveStartKey = result.LastEvaluatedKey;
                    //     dynamoDB.scan(params, scanUntilDone);
                    // } else {
                    //     // all results scanned. done!
                    resolve(result)
                    // }
                });
            } else {
                dynamoDB.scan(params, function scanUntilDone(error, result) {
                    if (error) return reject(error);
                    resolve(result)
                });
            }
        } else {
            if (!(where && Object.keys(where).length)) return reject({status: 400, error: 'No key criteria'});
            if (where) {
                if (where && Object.entries(where)[0] && Object.entries(where)[0][1] && Object.entries(where)[0][1] !== 'undefined') {
                    params['Key'] = where
                } else {
                    return reject({status: 400, error: 'No key criteria'});
                }
                if (!(where && Object.keys(where).length)) return reject({status: 400, error: 'No key criteria'});
                dynamoDB.get(params, (error, result) => {
                    if (error) return reject(error);
                    resolve(result.Item)
                });
            }

        }
    })
}

function update(where, setValues, options) {
    return new Promise((resolve, reject) => {
        const modelParsed = parseModel(removeWhereKeys(new options.model(), where), setValues);
        if (!(modelParsed && modelParsed.mapped && Object.keys(modelParsed.mapped))) return reject({
            status: 400,
            error: 'No keys valid'
        });

        const params = {
            TableName: options.tableName
        };
        if (where) {
            params['Key'] = where;
        }
        if (setValues) {
            params['ExpressionAttributeNames'] = modelParsed.names;
            params['ExpressionAttributeValues'] = modelParsed.values;
            params['UpdateExpression'] = modelParsed.query;
            params['ReturnValues'] = 'UPDATED_NEW';
        }
        dynamoDB.update(params, (error, result) => {
            if (error) return reject(error);
            resolve(result.Attributes)
        });
    })
}

function remove(where, options) {
    return new Promise((resolve, reject) => {
            if (options.all) {
                let ids = where[options.key], requests = [];
                if (ids) {
                    requests = ids.map(i => ({
                        DeleteRequest: {
                            Key: {[options.key]: i}
                        }
                    }))
                }
                const params = {
                    RequestItems: {
                        [options.tableName]: requests
                    }
                };

                dynamoDB.batchWrite(params, (error, result) => {
                    if (error) return reject(error);
                    resolve(result)
                });
            } else {
                const params = {
                    TableName: options.tableName
                };
                if (where) {
                    params['Key'] = where
                }
                dynamoDB.delete(params, (error, result) => {
                    if (error) return reject(error);
                    resolve(result)
                });
            }

        }
    )
}

function removeWhereKeys(model, where) {
    const keys = where && Object.keys(where);
    keys.forEach((k) => {
        delete model[k];
    });
    return model
}

function parseModel(model, values) {
    const mapped = {}, queryValues = {}, queryNames = {};
    const query = [];
    Object.entries(model)
        .forEach(([k, v]) => {
            const validations = model.validations;
            const isRequired = validations && validations.find(vd => vd.path.includes(k));
            const ifRequiredMustHaveValue = isRequired && !!values[k] || !!values[k];

            if (isRequired && isRequired.type === 'date') {
                values[k] = uh.parseDate(values[k]).value
            }
            if (ifRequiredMustHaveValue) {
                mapped[k] = values[k];
                query.push('#' + k + ' = :' + k);
                queryValues[':' + k] = values[k];
                queryNames['#' + k] = k;
            }
        });
    return {
        mapped: mapped,
        query: 'SET ' + query.join(', '),
        filter: query.map(q => 'contains (' + q.replace(' =', ',') + ')').join(', '),
        values: queryValues,
        names: queryNames
    }
}
