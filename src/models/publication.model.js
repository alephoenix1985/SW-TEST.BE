const mh = require("../helpers/model.helper");
const uh = require("../helpers/util.helper");

class Publication {
    constructor(data) {
        const uuid = require('uuid');
        const date = new Date().toISOString();
        data = data || {};
        const {id, authorId, body, title, publishedAt} = data;

        this.id = id || uuid.v4('publication', new Date().getUTCMilliseconds());

        this.body = body;
        this.authorId = authorId;
        this.title = title;
        this.publishedAt = publishedAt && uh.parseDate(publishedAt).value;

        this.createdAt = date;
        this.updatedAt = date;
        this.deletedAt = null;
    }

    get validate() {
        const validations = [
            {path: 'publishedAt', validator: 'REQUIRED', type: 'date', field: 'Date when it was published'},
            {path: 'authorId', validator: 'REQUIRED', field: 'Author'},
            {path: 'body', validator: 'REQUIRED', field: 'Publication Body'},
            {path: 'title', validator: 'REQUIRED', field: 'Publication  Title'}
        ];
        return mh.validate(validations, this)
    }

    clean() {
        const model = Object.assign({}, this);
        delete model["validate"];
        return model;
    }
}

module.exports = Publication;
