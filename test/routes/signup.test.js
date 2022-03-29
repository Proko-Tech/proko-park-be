const app = require('../../app/index');
const supertest = require('supertest');

const usersModel = require('../../database/models/usersModel');
const stripeCustomer = require('../../services/stripe/customers');
const mailer = require('../../app/modules/mailer');

jest.mock('../../database/models/usersModel');
jest.mock('../../services/stripe/customers');
jest.mock('../../app/modules/mailer');

describe('Signup Endpoint', () => {

});
