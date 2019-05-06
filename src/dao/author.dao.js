'use strict';

const ud = require('./util.dao');
const tableName = process.env.DYNAMODB_TABLE_AUTHOR;
const Author = require('../models/author.model');

module.exports = {
    save: save,
    find: find,
    findAll: findAll,
    update: update,
    removeAll: removeAll,
    remove: remove
};

function save(values) {
    return ud.save(values, {model: Author, tableName: tableName})
}

function find(where) {
    return ud.find(where, {model: Author, tableName: tableName})
}

function findAll(options) {
    return ud.find(null, {
        model: Author,
        tableName: tableName,
        all: true,
        filters: options.filters,
        limit: options.limit,
        order: options.order,
        lastKey: options.lastKey
    })
}

function update(where, setValues) {
    return ud.update(where, setValues, {model: Author, tableName: tableName})
}

function remove(where) {
    return ud.remove(where, {model: Author, tableName: tableName})
}

function removeAll(where) {
    return ud.remove(where, {model: Author, tableName: tableName, all: true, key: 'id'})
}
