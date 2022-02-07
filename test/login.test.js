const app = require('../app/index');
const request = require('supertest');

const failedCredentialsNative = {
    email: 'dfafasf@dsaf.com',
    password: 'dfsaf',
    login_in_type: 'NATIVE',
};

const successCredentialsGoogle = {
    email: 'thomasligreat11@gmail.com',
    password: 'fdasfas',
    login_in_type: 'GOOGLE',
};

const failedCredentialsFacebook = {
    email: 'amazingfacebook@qq.com',
    password: 'sfadfsafas',
    login_in_type: 'FACEBOOK',
};

const failedCredentialsFacebookNative = {
    email: '2586709983@qq.com',
    password: 'fdasf',
    login_in_type: 'NATIVE',
};

const failedCredentialsNativeWrongPass = {
    email: 'thomasligreat11@gmail.com',
    password: 'dsafd',
    login_in_type: 'NATIVE',
};

const failCredentials = {
    email: 'test@test.com',
    password: 'nopassword',
    login_in_type: 'NATIVE',
};

const authenticateUser = request.agent(app);

describe('authentication test', function(){
    beforeEach(function(done) {
        setTimeout(function(){
            done();
        }, 350);
    });

    describe('POST /api/user_authenticate with native log in', function() {
        it('Should return a 404 response if the user is not natively signed up', function(done){
            request(app).post('/api/user_authenticate')
                .send({userData: failedCredentialsNative})
                .expect(404, done);
        });
    });

    describe('POST /api/user_authenticate with successful log in', function() {
        it('Should return a 404 response if the user log in does not exist', function(done){
            request(app).post('/api/user_authenticate')
                .send({userData: failedCredentialsFacebook})
                .expect(404, done);
        });
    });

    describe('POST /api/user_authenticate with google log in', function() {
        it('Should return a 200 response if the user is logged in', function(done){
            request(app).post('/api/user_authenticate')
                .send({userData: successCredentialsGoogle})
                .expect(202, done);
        });
    });

    describe('POST /api/user_authenticate with failed log in', function() {
        it('Should return a 404 response if the user log in failed', function(done){
            request(app).post('/api/user_authenticate')
                .send({userData: failCredentials})
                .expect(404, done);
        });
    });

    describe('POST /api/user_authenticate with failed log in', function() {
        it('Should return a 401 response if the user not correctly logged in', function(done){
            request(app).post('/api/user_authenticate')
                .send({userData: failedCredentialsNativeWrongPass})
                .expect(401, done);
        });
    });

    describe('POST /api/user_authenticate with failed log in', function() {
        it('Should return a 404 response if the user does not exist', function(done){
            request(app).post('/api/user_authenticate')
                .send({userData: failedCredentialsFacebookNative})
                .expect(404, done);
        });
    });

    describe('POST /api/user_authenticate/social with successful log in', function() {
        it('Should return a 202 response if the user signed up with a different method', function(done){
            request(app).post('/api/user_authenticate/social')
                .send({userData: successCredentialsGoogle})
                .expect(202, done);
        });
    });

    describe('POST /api/user_authenticate/social with failed log in', function() {
        it('Should return a 401 response if the user signed up with a different method', function(done){
            request(app).post('/api/user_authenticate/social')
                .send({userData: failedCredentialsNative})
                .expect(401, done);
        });
    });
});
