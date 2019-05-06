'use strict';
let _tempData;
let _tempAuthorData;

const request = require('supertest');
const SERVER_URL = 'http://localhost:3000';

describe('publication.create request', () => {
    const author = {
        "name": "Name Test Created",
        "email": "email@test.com",
        "birthDate": "1985-01-12"
    };
    let publication = {
        "title": "Title Test Created",
        "body": "Body Test",
        "publishedAt": "1985-01-12T01:05"
    };

    it('CREATE AUTHOR FOR PUBLICATION TEST', (done) => {
        request(SERVER_URL)
            .post('/author')
            .send({author})
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                _tempAuthorData = res.body;
                console.log('Done Creating Author: id = ' + _tempAuthorData.id);
                done();
            });
    });

    it('CREATE PUBLICATION TEST', (done) => {
        publication.authorId = _tempAuthorData.id;
        console.log('publication', publication);
        request(SERVER_URL)
            .post('/publication')
            .send({publication})
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                _tempData = res.body;
                console.log('Done Creating: id = ' + _tempData.id);
                done();
            });
    });
    it('EDIT PUBLICATION DATA WITH ID', (done) => {
        const oldValue = _tempData.title;
        _tempData.title = _tempData.title.replace('Created', 'Updated');
        const updatePublication = _tempData;
        request(SERVER_URL)
            .put('/publication/' + updatePublication.id)
            .send({publication: updatePublication})
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                console.log('Done Editing field[Title]: [' + oldValue + '] -> [' + res.body.title + ']');
                _tempData = Object.assign(_tempData, res.body);
                done();
            });
    });
    it('GET PUBLICATION DATA WITH ID', (done) => {
        const updatePublication = _tempData;
        request(SERVER_URL)
            .get('/publication/' + updatePublication.id)
            .set('Accept', 'application/json')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                _tempData = res.body;
                console.log('Done Getting: id' + _tempData.id);
                done();
            });
    });
    it('GET ALL PUBLICATION DATA', (done) => {
        request(SERVER_URL)
            .get('/publication')
            .set('Accept', 'application/json')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                console.log('Done Getting: ' + res.body.Count + ' Publication' + (res.body.Count > 1 ? '(s)' : ''));
                done();
            });
    });
    it('DELETE PUBLICATION DATA WITH ID', (done) => {
        const updatePublication = _tempData;
        request(SERVER_URL)
            .delete('/publication/' + updatePublication.id)
            .set('Accept', 'application/json')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                // _tempData = res.body;
                console.log('Done Deleting: id' + _tempData.id);
                done();
            });
    });
});
