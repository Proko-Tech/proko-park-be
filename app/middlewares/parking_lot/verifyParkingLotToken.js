const lotTokenUtil = require('../../auth/parking_lot/tokenUtil');

/**
 * verifies parking lot token in cookie, save it into req.lotInfo if exists
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function verifyParkingLotToken(req, res, next) {
    const lotToken = req.cookies.lotToken;
    const lotInfo = lotToken?await lotTokenUtil.validateToken(lotToken):null;
    if (lotInfo) {
        req.lotInfo = lotInfo.lotInfo;
        next();
    } else {
        res.status(404)
            .json({status:'failed', data: 'Session over'});
    }
}

module.exports=verifyParkingLotToken;
