const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt-nodejs');

const usersModel = require('../../../../database/models/usersModel');
const tokenUtil = require('../../../auth/users/tokenUtil');

const pick = require('../../../../utils/pick');

router.post('/', async function(req, res){
    const {userData} = req.body;
    const result = await usersModel.getByEmail(userData.email);

    const isUserExist = !(result.length === 0);
    const isSignUpNative = isUserExist? result[0].sign_up_type === "NATIVE" : false;
    const isCorrectPassword = isUserExist && result[0].password && isSignUpNative ?
        bcrypt.compareSync(userData.password, result[0].password) : false;
    const isUserMatchedNative = isUserExist && (isCorrectPassword);

    const isSignUpTypeSocial = result[0].sign_up_type === 'GOOGLE' ||
        result[0].sign_up_type === 'FACEBOOK' ||
        result[0].sign_up_type === 'APPLE';
    const isUserMatchedSocially = isUserExist && isSignUpTypeSocial? result[0].sign_up_type === userData.sign_up_type : false;

    const isLogInTypeGoogle = userData.sign_up_type === 'GOOGLE';
    const isLoginGoogleWithNativeSignUp = isUserExist && isSignUpNative && isLogInTypeGoogle;
    // add in password Check
    const isValidAuth = isUserMatchedNative || isUserMatchedSocially || isLoginGoogleWithNativeSignUp;

    if (isValidAuth){
        const userInfo = {
            ...pick(result[0], ['id', 'email']),
        };
        const token = await tokenUtil.generateToken(userInfo);
        res.status(202)
            .json({status:'success', data:token});
    } else {
        if (isUserExist && isSignUpTypeSocial){
            res.status(401).json({status: 'failed', message: 'Account was signed up with a different method'});
        } else {
            res.status(404).json({status: 'failed', message: 'Email/password you entered is incorrect'});
        }
    }
});

module.exports = router;
