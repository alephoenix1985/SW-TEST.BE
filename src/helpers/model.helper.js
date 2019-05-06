const REQUIRED = 'REQUIRED';
const MAX = 'MAX';
const MIN = 'MIN';
const RANGE = 'RANGE';
const LENGTH = 'LENGTH';
const GREATER_THAN = 'GREATERTHAN';
const LESS_THAN = 'LESSTHAN';
const BETWEEN = 'BETWEEN';

const uh = require('./util.helper');

module.exports = {
    REQUIRED: REQUIRED,
    MAX: MAX,
    MIN: MIN,
    RANGE: RANGE,
    LENGTH: LENGTH,
    GREATER_THAN: GREATER_THAN,
    LESS_THAN: LESS_THAN,
    BETWEEN: BETWEEN,

    validateError: validateError,
    validateErrors: validateErrors,
    cleanModel: cleanModel,
    parse: parse,
    isValid: isValid,

    errors: errors,
    validatePath: validatePath,

    validateModel: validateModel,
    validate: validate
};

function validateErrors(model, validations) {
    return validations.map(v => {
        return validateError(model, v.path, v.validator, v.values, v.field, v.mandatory, v.type);
    });
}

function cleanModel(data) {
    const model = Object.assign({}, data);
    delete model.validate;
    return model;
}

function parse(values, validations) {
    const mapped = {}, queryValues = {}, queryNames = {};
    const query = [];
    Object.entries(this)
        .forEach(([k, v]) => {
            const isRequired = validations.find(vd => vd.path.includes(k));
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
    return {mapped: mapped, query: 'SET ' + query.join(', '), values: queryValues, names: queryNames}
}

function isValid(model, validations) {
    const vs = validateModel(model, validations);
    return !(vs && vs.find(v => !v.valid));
}

function errors(model, validations) {
    const vs = validateModel(model, validations);
    return vs && vs.filter(v => !v.valid);
}

function validatePath(model, path, validations) {
    const val = validations.find(v => v.path === path);
    return val ? validateErrors(model, [val])[0] : {valid: true};
}

function validateModel(model, validations) {
    return validateErrors(model, validations);
}

function validate(validations, model, path) {
    return {
        isValid: isValid(model, validations),
        errors: errors(model, validations),
        validatePath: validatePath(model, path, validations),
        validateModel: validateModel(model, validations)
    }
}

function validateError(o, p, validator, values, field = '', mandatory = false, shouldBeType, msg = '') {
    let valid = true;
    if (validator && o && p) {
        const pSplit = p.split('.');
        let key = o;

        // parse key in case it comes as 'name.last' (mongo)
        pSplit.forEach(k => {
            key = key && key[k];
            if (!key) {
                return {valid: false, msg: 'Validation fail', field: field, mandatory: mandatory};
            }
        });
        const valueStr = key && key.toString();
        if (shouldBeType === 'date') {
            return {
                valid: uh.parseDate(key).valid,
                msg: uh.parseDate(key).valid ? msg : 'Validation fail Bad Date',
                field: field,
                mandatory: mandatory
            };
        } else {
            switch (validator) {
                case REQUIRED:
                    valid = !!(valueStr && valueStr.length);
                    msg = 'Missing field';
                    break;
                case MIN:
                    valid = !!(valueStr && valueStr.length <= values);
                    msg = 'Minimum (' + values + ') characters' + (values ? 's' : '');
                    break;
                case MAX:
                    valid = !!(valueStr && valueStr.length >= values);
                    msg = 'Maximum (' + values + ') characters' + (values ? 's' : '');
                    break;
                case RANGE:
                    valid = !!(valueStr && valueStr.length >= values[0] && valueStr.length >= values[1]);
                    msg = 'Minimum (' + values + ') and maximum (' + values + ') characters';
                    break;
                case LENGTH:
                    valid = !!(valueStr && valueStr.length === values);
                    msg = 'Required (' + values + ') character' + (values ? 's' : '');
                    break;
                case GREATER_THAN:
                    valid = !!(key > values);
                    msg = 'Not more than (' + values + ') character' + (values ? 's' : '');
                    break;
                case LESS_THAN:
                    valid = !!(key < values);
                    msg = 'At least (' + values + ') character' + (values ? 's' : '');
                    break;
                case BETWEEN:
                    valid = !!(key >= values[0] && key <= values[1]);
                    msg = '(' + values + ') character' + (values ? 's' : '');
                    break;
            }
        }


    } else {
        return {valid: false, msg: 'Validation fail', field: field, mandatory: mandatory};
    }
    return {valid: valid, msg: msg, field: field, mandatory: mandatory};
}
