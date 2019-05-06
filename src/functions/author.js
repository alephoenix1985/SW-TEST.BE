'use strict';

const uh = require('../helpers/util.helper');
const authorDao = require('../dao/author.dao');
const publicationDao = require('../dao/publication.dao');

module.exports = {
    add: add,
    remove: remove,
    get: get,
    list: list,
    update: update
};

function add(event, context, callback) {
    console.log('event.body', event.body);
    const data = JSON.parse(event.body);
    if (!(data && data.author)) return uh.badRequest(callback);

    authorDao.save(data.author)
        .then(uh.send.bind(this, callback))
        .catch(uh.error.bind(this, callback))
}

function remove(event, context, callback) {
    const id = event.pathParameters.id;
    const pk = event.pathParameters.key || 'id';

    //Ensure Pulbications are deleted before author
    publicationDao.findAll({filters: {authorId: id}})
        .then(pubsByAuthor => {
            if (pubsByAuthor && pubsByAuthor.Items && pubsByAuthor.Items.length) {
                publicationDao.removeAll({[pk]: pubsByAuthor.Items.map(p => p[pk])})
                    .then(pubsDeleted => {
                        authorDao.remove({id: id})
                            .then(uh.send.bind(this, callback))
                            .catch(uh.error.bind(this, callback))
                    })
                    .catch(uh.error.bind(this, callback))
            } else {
                authorDao.remove({id: id})
                    .then(uh.send.bind(this, callback))
                    .catch(uh.error.bind(this, callback))
            }
        })
        .catch(uh.error.bind(this, callback))
}

function get(event, context, callback) {
    const id = event.pathParameters.id;

    authorDao.find({id: id})
        .then((a) => new Promise((resolve, reject) => {
            publicationDao.findAll({filters: {authorId: a.id}})
                .then(publications => {
                    a.publications = publications;
                    resolve(a)
                })
                .catch(reject)
        }))
        .then(uh.send.bind(this, callback))
        .catch(uh.error.bind(this, callback))
}

function list(event, context, callback) {
    event.queryStringParameters = event.queryStringParameters || {};
    const {limit, lastKey, filters, order} = event.queryStringParameters;
    const options = {limit: limit, lastKey: lastKey, order: order, filters: filters};

    authorDao.findAll(options)
        .then(uh.send.bind(this, callback))
        .catch(uh.error.bind(this, callback))
}

function update(event, context, callback) {
    const id = event.pathParameters.id;
    const data = JSON.parse(event.body);
    if (!(data && data.author)) return uh.badRequest(callback);

    authorDao.update({id: id}, data.author)
        .then(uh.send.bind(this, callback))
        .catch(uh.error.bind(this, callback))
}
