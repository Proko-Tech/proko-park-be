const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt-nodejs');

const usersModel = require('../../../../database/models/usersModel');
const tokenUtil = require('../../../auth/users/tokenUtil');

const pick = require('../../../../utils/pick');

router.post('/', async function(req, res){
    try {
        const {userData} = req.body;
        const result = await usersModel.getByEmail(userData.email);

        const isUserExist = !(result.length === 0);
        const isSignUpNative = isUserExist ? result[0].sign_up_type === "NATIVE" : false;
        const isCorrectPassword = isUserExist && result[0].password && isSignUpNative ?
            bcrypt.compareSync(userData.password, result[0].password) : false;
        const isUserMatchedNative = isUserExist && (isCorrectPassword);

        if (!isUserExist) return res.status(404).json({status: 'failed', message: 'Email/password you entered is incorrect'});

        const isSignUpTypeSocial = result[0].sign_up_type === 'GOOGLE' ||
            result[0].sign_up_type === 'FACEBOOK' ||
            result[0].sign_up_type === 'APPLE';
        const isUserMatchedSocially = isUserExist && isSignUpTypeSocial ? result[0].sign_up_type === userData.login_in_type : false;

        const isLogInTypeGoogle = userData.login_in_type === 'GOOGLE';
        const isLoginGoogleWithNativeSignUp = isUserExist && isSignUpNative && isLogInTypeGoogle;
        // add in password Check
        const isValidAuth = isUserMatchedNative || isUserMatchedSocially || isLoginGoogleWithNativeSignUp;

        if (isValidAuth) {
            const userInfo = {
                ...pick(result[0], ['id', 'email']),
            };
            const token = await tokenUtil.generateToken(userInfo);
            return res.status(202)
                .json({status: 'success', data: token});
        } else {
            if (isUserExist && isSignUpTypeSocial) {
                return res.status(401).json({status: 'failed', message: 'Account was signed up with a different method'});
            } else {
                return res.status(404).json({status: 'failed', message: 'Email/password you entered is incorrect'});
            }
        }
    } catch (err){
        return res.status(500)
            .json({err, message: 'Unable to get user from database'})
    }
});

router.post('/social', async function(req, res){
    try {
        const {userData} = req.body;
        const result = await usersModel.getByEmail(userData.email);
        const isUserExist = !(result.length === 0);
        if (!isUserExist){
            const user = {
                email: userData.email,
                first_name: userData.first_name,
                last_name: userData.last_name,
                password: bcrypt.hashSync(userData.password, null, null),
                verify_code: 'SOCIAL_SIGNUP',
                sign_up_type: userData.login_in_type,
                is_verified: true,
            };
            const {user_status} = await usersModel.insert(user);
            const inserted_user = await usersModel.getByEmail(userData.email);
            const userInfo = {
                ...pick(inserted_user[0], ['id', 'email']),
            };
            const token = await tokenUtil.generateToken(userInfo);
            return res.status(202)
                .json({status: 'success', data: token});
        } else {
            // const isPasswordMatch = bcrypt.compareSync(userData.password, result[0].password);
            // if (!isPasswordMatch) return res.status(404).json({status: 'failed', message: 'Unauthorized action'});
            // else {
            const userInfo = {
                ...pick(result[0], ['id', 'email']),
            };
            const token = await tokenUtil.generateToken(userInfo);
            return res.status(202)
                .json({status: 'success', data: token});
        }
        // }
    } catch (err){
        return res.status(500)
            .json({err, message: 'Unable to get user from database'})
    }
});

module.exports = router;
