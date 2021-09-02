const express = require('express');
const limiter = require('../../../middlewares/rate_limiters/config');
const router = express.Router();
const bcrypt = require('bcrypt-nodejs');

const userModel = require('../../../../database/models/usersModel');
const tokenUtil = require('../../../auth/users/tokenUtil');

const mailer = require('../../../modules/mailer');
const stripeCustomer = require('../../../../services/stripe/customers');

const makeRandomCode = require('../../../../utils/makeRandomCode');
const pick = require('../../../../utils/pick');


router.post('/', limiter.signUpLimiter, async function(req, res){
    const user = {
        ...req.body,
        verify_code: makeRandomCode(6),
    };
    try {
        const users = await userModel.getByEmail(user.email);
        user.password = bcrypt.hashSync(user.password, null, null);
        if (users.length!==0) {
            res.status(401)
                .json({status: 'failed', message: 'Another account using this email was found'});
        } else {
            const stripe_profile = await stripeCustomer.create(user.first_name+' '+user.last_name, user.email);
            user.stripe_customer_id = stripe_profile.id;
            const {user_status} = await userModel.insert(user);
            if (user_status === 'failed'){
                res.status(502)
                    .json({status: 'failed', message: 'Signed up failed due to server error.'})
            }
            const result = await userModel.getByEmail(user.email);
            const userInfo = {
                ...pick(result[0], ['id', 'email']),
            };
            const token = await tokenUtil.generateToken(userInfo);
            const mailerInfo = {
                ...pick(result[0], ['first_name', 'last_name', 'email', 'verify_code']),
            };
            await mailer.sendEmail(mailerInfo, async function(err, resData) {
                if (err) {
                    console.log(err);
                }
            });
            res.status(200)
                .json({status: 'success', data:token, message: 'success'});
        }
    } catch (err) {
        console.log(err);
        res.status(500)
            .json({err, message: 'Unable to get user from database'})
    }
});

router.get('/checkEmail/:email', async function(req, res){
    const {email} = req.params;
    try {
        const users = await userModel.getByEmail(email);
        if (users.length!==0) {
            res.status(401)
                .json({status: 'failed', msg: 'Another account using this email was found'});
        } else {
            res.status(200)
                .json({status: 'success', message: 'success'});
        }
    } catch (err) {
        res.status(500)
            .json({err, message: 'Unable to get user from database'})
    }
});

module.exports = router;
