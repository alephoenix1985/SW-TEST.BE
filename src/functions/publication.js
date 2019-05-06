'use strict';

const uh = require('../helpers/util.helper');
const publicationDao = require('../dao/publication.dao');
const authorDao = require('../dao/author.dao');

module.exports = {
    add: add,
    remove: remove,
    get: get,
    list: list,
    update: update
};

function add(event, context, callback) {
    const data = JSON.parse(event.body);
    if (!(data && data.publication)) return uh.badRequest(callback);

    publicationDao.save(data.publication)
        .then((p) => new Promise((resolve, reject) => {
            authorDao.find({id: p.authorId})
                .then(author => {
                    p.author = author;
                    delete p.authorId;
                    resolve(p)
                })
                .catch(reject)
        }))
        .then(uh.send.bind(this, callback))
        .catch(uh.error.bind(this, callback))
}

function remove(event, context, callback) {
    const id = event.pathParameters.id;

    publicationDao.remove({id: id})
        .then(uh.send.bind(this, callback))
        .catch(uh.error.bind(this, callback))
}

function get(event, context, callback) {
    const id = event.pathParameters.id;

    publicationDao.find({id: id})
        .then((p) => new Promise((resolve, reject) => {
            authorDao.find({id: p.authorId})
                .then(author => {
                    p.author = author;
                    delete p.authorId;
                    resolve(p)
                })
                .catch(reject)
        }))
        .then(uh.send.bind(this, callback))
        .catch(uh.error.bind(this, callback))
}

function list(event, context, callback) {
    event.queryStringParameters = event.queryStringParameters || {};
    let {limit, lastKey, filters, order} = event.queryStringParameters;
    if (filters) {
        filters = JSON.parse(filters)
    }
    const options = {limit: limit, lastKey: lastKey, order: order, filters: filters};
    publicationDao.findAll(options)
        .then((response) =>
            Promise.all(response.Items.map(p => {
                return new Promise((resolve, reject) => {
                    authorDao.find({id: p.authorId})
                        .then(author => {
                            p.author = author;
                            delete p.authorId;
                            resolve(p)
                        })
                        .catch(reject)
                })
            }))
                .then(items => {
                    response.Items = items;
                    return response;
                })
        )
        .then(uh.send.bind(this, callback))
        .catch(uh.error.bind(this, callback))
}

function update(event, context, callback) {
    const id = event.pathParameters.id;
    const data = JSON.parse(event.body);
    if (!(data && data.publication)) return uh.badRequest(callback);

    publicationDao.update({id: id}, data.publication)
        .then(uh.send.bind(this, callback))
        .catch(uh.error.bind(this, callback))
}
