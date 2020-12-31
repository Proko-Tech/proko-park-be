const db = require('../dbConfig');

/**
 * Gets user from db by id
 * @param id
 * @returns {Promise<void>}
 */
async function getById(id) {
    const result = await db('users')
        .where({id})
        .select('*');
    return result;
}

 * Gets user from db by email
 * @param email
 * @returns {Promise<void>}
 */
async function getByEmail(email){
    const result = await db('users')
        .where({email})
        .select('*');
    return result;
}

module.exports = {getById, getByEmail};
