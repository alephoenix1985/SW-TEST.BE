const mh = require("../helpers/model.helper");
const uh = require("../helpers/util.helper");

class Author {
    constructor(data) {
        const uuid = require('uuid');
        const date = new Date().toISOString();
        data = data || {};
        const {id, name, email, birthDate} = data;

        this.id = id || uuid.v4('author', new Date().getUTCMilliseconds());

        this.name = name;
        this.email = email;
        this.birthDate = birthDate && uh.parseDate(birthDate).value;

        this.createdAt = date;
        this.updatedAt = date;
        this.deletedAt = null;
    }

    get validate() {
        const validations = [
            {path: 'name', validator: 'REQUIRED', field: 'Name'},
            {path: 'email', validator: 'REQUIRED', field: 'Email'},
            {path: 'birthDate', validator: 'REQUIRED', type: 'date', field: 'BirthDate'}
        ];
        return mh.validate(validations, this)
    }

    clean() {
        const model = Object.assign({}, this);
        delete model["validate"];
        return model;
    }
}

module.exports = Author;
