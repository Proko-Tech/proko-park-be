const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt-nodejs');
const appleSignin = require('apple-signin-auth');

const usersModel = require('../../../../database/models/usersModel');
const tokenUtil = require('../../../auth/users/tokenUtil');
const stripeCustomer = require('../../../../services/stripe/customers');

const pick = require('../../../../utils/pick');

router.post('/', async function(req, res) {
    try {
        const {userData} = req.body;
        const result = await usersModel.getByEmail(userData.email);
        const isUserExist = !(result.length === 0);
        const isSignUpNative = isUserExist ?
            result[0].sign_up_type === 'NATIVE' :
            false;
        const isCorrectPassword =
            isUserExist && result[0].password && isSignUpNative ?
                bcrypt.compareSync(userData.password, result[0].password) :
                false;
        const isUserMatchedNative = isUserExist && isCorrectPassword;

        if (!isUserExist)
            return res
                .status(404)
                .json({
                    status: 'failed',
                    message: 'Email/password you entered is incorrect',
                });

        const isSignUpTypeSocial =
            result[0].sign_up_type === 'GOOGLE' ||
            result[0].sign_up_type === 'FACEBOOK' ||
            result[0].sign_up_type === 'APPLE';
        const isUserMatchedSocially =
            isUserExist && isSignUpTypeSocial ?
                result[0].sign_up_type === userData.login_in_type :
                false;

        const isLogInTypeGoogle = userData.login_in_type === 'GOOGLE';
        const isLoginGoogleWithNativeSignUp =
            isUserExist && isSignUpNative && isLogInTypeGoogle;
        // add in password Check
        const isValidAuth =
            isUserMatchedNative ||
            isUserMatchedSocially ||
            isLoginGoogleWithNativeSignUp;

        if (isValidAuth) {
            const userInfo = {
                ...pick(result[0], ['id', 'email']),
            };
            const token = await tokenUtil.generateToken(userInfo);
            return res.status(202).json({status: 'success', data: token});
        } else {
            if (isUserExist && isSignUpTypeSocial) {
                return res
                    .status(401)
                    .json({
                        status: 'failed',
                        message:
                            'Account was signed up with a different method',
                    });
            } else {
                return res
                    .status(404)
                    .json({
                        status: 'failed',
                        message: 'Email/password you entered is incorrect',
                    });
            }
        }
    } catch (err) {
        return res
            .status(500)
            .json({err, message: 'Unable to get user from database'});
    }
});

router.post('/social', async function(req, res) {
    try {
        const {userData} = req.body;
        if (userData.login_in_type === 'NATIVE')
            return res
                .status(401)
                .json({
                    status: 'failed',
                    message: 'Account was signed up with a different method',
                });
        const result = await usersModel.getByEmail(userData.email);
        const isUserExist = !(result.length === 0);
        if (!isUserExist) {
            const stripe_profile = await stripeCustomer.create(
                userData.first_name + ' ' + userData.last_name,
                userData.email,
            );
            const user = {
                email: userData.email,
                first_name: userData.first_name,
                last_name: userData.last_name,
                password: bcrypt.hashSync(userData.password, null, null),
                verify_code: 'SOCIAL_SIGNUP',
                sign_up_type: userData.login_in_type,
                is_verified: true,
                stripe_customer_id: stripe_profile.id,
            };
            const {user_status} = await usersModel.insert(user);
            const inserted_user = await usersModel.getByEmail(userData.email);
            const userInfo = {
                ...pick(inserted_user[0], ['id', 'email']),
            };
            const token = await tokenUtil.generateToken(userInfo);
            return res
                .status(202)
                .json({status: 'success', data: token, type: 'SIGNUP'});
        } else {
            const userInfo = {
                ...pick(result[0], ['id', 'email']),
            };
            const token = await tokenUtil.generateToken(userInfo);
            return res
                .status(202)
                .json({status: 'success', data: token, type: 'LOGIN'});
        }
        // }
    } catch (err) {
        return res
            .status(500)
            .json({err, message: 'Unable to get user from database'});
    }
});

router.post('/sign-in-with-apple', async function(req, res, next) {
    try {
        const {body} = req;
        const {
            email,
            first_name,
            last_name,
            identity_token,
            apple_user,
            login_in_type,
        } = body.userData;

        try {
            const clientId = process.env.APPLE_APP_ID;
            // verify token (will throw error if failure)
            const {sub} = await appleSignin.verifyIdToken(identity_token, {
                audience: clientId,
                ignoreExpiration: true, // ignore token expiry (never expires)
            });
            if (sub !== apple_user) {
                return res.status(404).json({message: 'authentication failed'});
            }

            const result = await usersModel.getByAppleUser(apple_user);
            const isUserExist = !(result.length === 0);

            if (!isUserExist) {
                const stripe_profile = await stripeCustomer.create(
                    first_name + ' ' + last_name,
                    email,
                );
                const user = {
                    email,
                    first_name,
                    last_name,
                    password: bcrypt.hashSync(apple_user, null, null),
                    verify_code: 'SOCIAL_SIGNUP',
                    sign_up_type: login_in_type,
                    is_verified: true,
                    stripe_customer_id: stripe_profile.id,
                    apple_user,
                };
                const {user_status} = await usersModel.insert(user);
                const inserted_user = await usersModel.getByEmail(email);

                const userInfo = {
                    ...pick(inserted_user[0], ['id', 'email']),
                };
                const token = await tokenUtil.generateToken(userInfo);
                return res
                    .status(202)
                    .json({status: 'success', data: token, type: 'SIGNUP'});
            } else {
                const userInfo = {
                    ...pick(result[0], ['id', 'email']),
                };
                const token = await tokenUtil.generateToken(userInfo);
                return res
                    .status(202)
                    .json({status: 'success', data: token, type: 'LOGIN'});
            }
        } catch (e) {
            return res.status(500).json({
                ack: 'error',
                message: 'failed to verify identityToken',
            });
        }
    } catch (err) {
        return res
            .status(500)
            .json({err, message: 'Unable to get user from database'});
    }
});

module.exports = router;
