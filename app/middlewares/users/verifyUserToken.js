const userTokenUtil = require('../../auth/users/tokenUtil');
/**
 * verifies user token in cookie, save it into req.lotInfo if exists
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function verifyUserToken(req, res, next) {
    const userToken = req.cookies.userToken;
    const userInfo = userToken?await userTokenUtil.validateToken(userToken):null;
    if (userInfo) {
        req.userInfo = userInfo.userInfo;
        next();
    } else {
        res.status(404)
            .json({status:'failed', data: 'Session over'});
    }
}

module.exports=verifyUserToken;
