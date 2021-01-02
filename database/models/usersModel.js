const db = require('../dbConfig');
const pick = require('../../utils/pick');

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

/**
 * Gets user from db by email
 * @param email
 * @returns {Promise<void>}
 */
async function getByEmailAndSignupType(email, sign_up_type){
    const result = await db('users')
        .where({email})
        .andWhere({sign_up_type})
        .select('*');
    return result;
}

/**
 * Gets all information about user from database
 * including vehicles etc.
 *
 * @param id
 * @returns {Promise<void>}
 */
async function getAllById(id){
    const result = {};
    const users = await db('users')
        .where({id})
        .select('*');
    result.user = pick(users[0], ['id', 'first_name', 'last_name', 'email', 'phone_number', 'sign_up_type']);
    return result;
}

module.exports = {getById, getByEmailAndSignupType, getAllById};
