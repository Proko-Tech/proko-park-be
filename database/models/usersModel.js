const db = require('../dbConfig');
const pick = require('../../utils/pick');

/**
 * Insert user
 * @param user
 * @returns {Promise<{user_status: string}>}
 */
async function insert(user) {
    try {
        await db('users').insert(user);
        return {user_status: 'success'};
    } catch (err) {
        return {user_status: 'failed'};
    }
}

/**
 * Gets user from db by id
 * @param id
 * @returns {Promise<void>}
 */
async function getById(id) {
    const result = await db('users').where({id}).select('*');
    return result;
}

/**
 * get user by apple user id
 * @param apple_user
 * @returns {Promise<void>}
 */
async function getByAppleUser(apple_user) {
    const result = await db('users').where({apple_user}).select('*');
    return result;
}

/**
 * Gets user from db by email and signup type
 * @param email
 * @returns {Promise<void>}
 */
async function getByEmailAndSignupType(email, sign_up_type) {
    const result = await db('users')
        .where({email})
        .andWhere({sign_up_type})
        .select('*');
    return result;
}

/**
 * Gets user from db by email
 * @param email
 * @returns {Promise<void>}
 */
async function getByEmail(email) {
    const result = await db('users').where({email}).select('*');
    return result;
}

/**
 * Gets all information about user from database
 * including vehicles etc.
 *
 * @param id
 * @returns {Promise<void>}
 */
async function getAllById(id) {
    const result = {};
    const users = await db('users').where({id}).select('*');
    result.user = pick(users[0], [
        'id',
        'first_name',
        'last_name',
        'email',
        'phone_number',
        'sign_up_type',
        'is_verified',
        'stripe_customer_id',
    ]);
    return result;
}

/**
 * function that updates user by id
 * @param id
 * @param modified_user
 * @returns {Promise<{user_status: string}>}
 */
async function updateById(id, modified_user) {
    try {
        await db('users').where({id}).update(modified_user);
        return {update_status: 'success'};
    } catch (err) {
        return {update_status: 'failed'};
    }
}

/**
 * function that deletes user by id
 * @param id 
 * @returns {Promise<void>}
 */
async function deleteById(id) {
    await db('users')
        .where({id})
        .del();
}

/**
 * function converts emails to user IDs
 * @param emails
 * @returns {Promise<void>}
 */
 async function convertEmailToUserId(emails) {
    console.log(emails)
    const ids = await db('users').whereIn('email', emails).select('id', 'email').orderByRaw(`FIND_IN_SET(\`email\`, '${emails}')`); // Preserve query order
    console.log(ids)
    return ids.map(row => row.id)
}

module.exports = {
    getById, 
    getByEmailAndSignupType, 
    getByAppleUser, 
    updateById,
    getAllById, 
    getByEmail, 
    insert, 
    deleteById,
    convertEmailToUserId,
};
