const db = require('../dbConfig');

/**
 * Gets vehicle from db by id
 * @param id
 * @returns {Promise<void>}
 */
async function getById(id) {
    const result = await db('vehicles')
        .where({id})
        .select('*');
    return result;
}

module.exports = {getById};