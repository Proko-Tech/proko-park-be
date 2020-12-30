const db = require('../dbConfig');

/**
 * Gets user from db by id
 * @param id
 * @returns {Promise<void>}
 */
async function getById(id) {
    const result = await db('users')
        .where({ id })
        .select('*');
    return result;
}

/**
 * Gets user from db by email, hash and secret
 * @param email
 * @param hash
 * @param secret
 * @returns {Promise<void>}
 */
async function getByEmailAndHashAndSecret(email, hash, secret) {
    const result = await db('users')
        .where({ email })
        .andWhere({ hash })
        .andWhere({ secret })
        .select('*');
    return result;
}

/**
 * Update user's password based on id
 * @param id
 * @param hash
 * @param secret
 * @returns {Promise<{user_update: string}>}
 */
async function updatePassword(id, hash, secret) {
    try {
        await db('users')
            .where({ id: id })
            .update({
                hash: hash,
                secret: secret
            });
        return { user_update: 'success' };
    } catch (err) {
        return { user_update: 'failed' };
    }
};

module.exports = { getById, getByEmailAndHashAndSecret, getLotAndSpotsByHash, updatePassword };
