const jwt = require('jsonwebtoken');

/**
 * Takes a token string, validates it, and then decode it into
 * it's original json object
 * @param token
 * @returns {Promise<authData>}
 */
async function validateToken(token) {
    return await jwt.verify(
        token,
        process.env.TOKENKEY,
        async function(err, authData) {
            if (err) {
                console.log(err);
            } else {
                return authData;
            }
        },
    );
}

/**
 * Generates a new token string with the spot info json parameter
 * @param spotInfo
 * @returns {Promise<string*>}
 */
async function generateToken(lotInfo) {
    return jwt.sign({lotInfo}, process.env.TOKENKEY);
}

module.exports = {
    validateToken,
    generateToken,
};
