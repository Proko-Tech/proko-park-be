const app = require('../../app/index');
const supertest = require('supertest');

jest.mock('../../database/models/usersModel');
jest.mock('../../services/stripe/customers');
const usersModel = require('../../database/models/usersModel');
const stripeCustomer = require('../../services/stripe/customers');

describe('authentication endpoints', () => {
    describe('POST /api/user_authenticate', () => {
        it('should return status 202 when the user is found', async () => {
            usersModel.getByEmail = (email) => {
                return [
                    {
                        id: 1,
                        first_name: 'test',
                        last_name: 'test',
                        email,
                        password:
                            '$2a$10$JhHw7tbG9bDdMKoSqjGa0.HoKSWKTZM37kShbE0VjfCPo0bGU4Phu',
                        sign_up_type: 'NATIVE',
                    },
                ];
            };

            const res = await supertest(app)
                .post('/api/user_authenticate/')
                .send({
                    userData: {
                        email: 'test@email.com',
                        password: '123',
                        login_in_type: 'NATIVE',
                    },
                });
            expect(res.status).toBe(202);
        });

        it('should return status 404 when password not match', async () => {
            usersModel.getByEmail = (email) => {
                return [
                    {
                        email,
                        password:
                            '$2a$10$JhHw7tbG9bDdMKoSqjGa0.HoKSWKTZM37kShbE0VjfCPo0bGU4Phu',
                        sign_up_type: 'NATIVE',
                    },
                ];
            };

            const res = await supertest(app)
                .post('/api/user_authenticate/')
                .send({
                    userData: {
                        email: 'test@email.com',
                        password: 'fasdfsa',
                        login_in_type: 'NATIVE',
                    },
                });
            expect(res.status).toBe(404);
        });

        it('should return status 404 when email not found', async () => {
            usersModel.getByEmail = () => {
                return [];
            };

            const res = await supertest(app)
                .post('/api/user_authenticate/')
                .send({
                    userData: {
                        email: 'test@email.com',
                        password: 'fasdfsa',
                        login_in_type: 'NATIVE',
                    },
                });
            expect(res.status).toBe(404);
        });

        it('should return status 401 when login type not match', async () => {
            usersModel.getByEmail = (email) => {
                return [
                    {
                        email,
                        password:
                            '$2a$10$JhHw7tbG9bDdMKoSqjGa0.HoKSWKTZM37kShbE0VjfCPo0bGU4Phu',
                        sign_up_type: 'FACEBOOK',
                    },
                ];
            };

            const res = await supertest(app)
                .post('/api/user_authenticate/')
                .send({
                    userData: {
                        email: 'test@email.com',
                        password: 'fasdfsa',
                        login_in_type: 'NATIVE',
                    },
                });
            expect(res.status).toBe(401);
        });

        it('should return status 401 when login type not match', async () => {
            usersModel.getByEmail = (email) => {
                return [
                    {
                        email,
                        password:
                            '$2a$10$JhHw7tbG9bDdMKoSqjGa0.HoKSWKTZM37kShbE0VjfCPo0bGU4Phu',
                        sign_up_type: 'GOOGLE',
                    },
                ];
            };

            const res = await supertest(app)
                .post('/api/user_authenticate/')
                .send({
                    userData: {
                        email: 'test@email.com',
                        password: 'fasdfsa',
                        login_in_type: 'NATIVE',
                    },
                });
            expect(res.status).toBe(401);
        });
    });

    describe('/api/user_authenticate/social', () => {
        it('should return status 401 when login type is native', async () => {
            const res = await supertest(app)
                .post('/api/user_authenticate/social')
                .send({
                    userData: {
                        email: 'test@email.com',
                        password: 'fasdfsa',
                        login_in_type: 'NATIVE',
                    },
                });
            expect(res.status).toBe(401);
        });

        it('should return status 202 when user info matched', async () => {
            usersModel.getByEmail = (email) => {
                return [
                    {
                        email,
                        password:
                            '$2a$10$JhHw7tbG9bDdMKoSqjGa0.HoKSWKTZM37kShbE0VjfCPo0bGU4Phu',
                        sign_up_type: 'GOOGLE',
                    },
                ];
            };
            const res = await supertest(app)
                .post('/api/user_authenticate/social')
                .send({
                    userData: {
                        email: 'test@email.com',
                        password: 'fasdfsa',
                        login_in_type: 'GOOGLE',
                    },
                });
            expect(res.status).toBe(202);
        });

        it('should return status 202 when user not found but successfully inserted', async () => {
            usersModel.getByEmail = jest
                .fn()
                .mockImplementationOnce(() => {
                    return [];
                })
                .mockImplementationOnce(() => {
                    return [
                        {
                            id: 1,
                            email: 'test@email.com',
                            password: 'fasdfsa',
                            sign_up_type: 'GOOGLE',
                        },
                    ];
                });
            stripeCustomer.create = () => {
                return {id: 'stripeId'};
            };
            usersModel.insert = () => {
                return {user_status: 'success'};
            };
            const res = await supertest(app)
                .post('/api/user_authenticate/social')
                .send({
                    userData: {
                        email: 'test@email.com',
                        password: 'fasdfsa',
                        login_in_type: 'GOOGLE',
                    },
                });
            expect(res.status).toBe(202);
        });
    });
});
