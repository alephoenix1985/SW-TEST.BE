'use strict';

const ud = require('./util.dao');
const tableName = process.env.DYNAMODB_TABLE_PUBLICATION;
const Publication = require('../models/publication.model');

module.exports = {
    save: save,
    find: find,
    findAll: findAll,
    update: update,
    removeAll: removeAll,
    remove: remove
};

function save(values) {
    return ud.save(values, {model: Publication, tableName: tableName})
}

function find(where) {
    return ud.find(where, {model: Publication, tableName: tableName})
}

function findAll(options) {
    return ud.find(null, {
        model: Publication,
        tableName: tableName,
        all: true,
        filters: options.filters,
        limit: options.limit,
        order: options.order,
        lastKey: options.lastKey
    })
}

function update(where, setValues) {
    return ud.update(where, setValues, {model: Publication, tableName: tableName})
}

function remove(where) {
    return ud.remove(where, {model: Publication, tableName: tableName})
}

function removeAll(where) {
    return ud.remove(where, {model: Publication, tableName: tableName, all: true, key: 'id'})
}
