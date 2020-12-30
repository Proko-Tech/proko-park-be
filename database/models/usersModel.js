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

module.exports = { getById };
