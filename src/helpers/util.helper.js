module.exports = {
    badRequest: badRequest,
    cleanNestedObject: cleanNestedObject,
    error: error,
    send: send,
    parseDate: parseDate
}

function badRequest(callback, errors) {
    console.error(errors);
    return callback(null, {
        statusCode: 400,
        headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        body: typeof errors === 'object' ? JSON.stringify(errors) : typeof errors === 'string' ? errors : 'Bad Request',
    })
}

function error(callback, errors, code) {
    console.error(errors);
    const errorMSG = errors && typeof errors === 'object' ?
        errors.message || JSON.stringify(errors) :
        typeof errors === 'string' ? errors : 'Unknown';

    return callback(null, {
        statusCode: errors && errors.statusCode || code || 500,
        headers: {"Content-Type": "application/json", 'Access-Control-Allow-Origin': '*'},
        body: errorMSG
    })
}

function send(callback, data) {
    return callback(null, {
        statusCode: 200,
        headers: {"Content-Type": "application/json", 'Access-Control-Allow-Origin': '*'},
        body: JSON.stringify(data),
    })
}

function parseDate(value) {
    const comesAsDate = value && typeof value === 'function' && value instanceof Date;
    const comesAsTimeStamp = value && (new Date(value)) instanceof Date;

    if (comesAsDate || comesAsTimeStamp) {
        // TODO check range validation
        const date = comesAsDate ? value : new Date(value);
        return {valid: true, value: date.toISOString()};
    } else {
        return {valid: false};
    }
}

function cleanNestedObject(object) {
    Object
        .entries(object)
        .forEach(([k, v]) => {
            if (v && typeof v === 'object') {
                cleanNestedObject(v);
            }
            if (v && typeof v === 'object' && !Object.keys(v).length || v === null || v === undefined) {
                if (Array.isArray(object)) {
                    object.splice(parseInt(k), 1);
                } else {
                    delete object[k];
                }
            }
        });
    return object;
}
