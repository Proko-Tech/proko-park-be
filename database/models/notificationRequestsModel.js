const db = require('../dbConfig');

/**
 * get all notification requests by enum type and lot id
 * @param lot_id
 * @returns {Rows in notification_requests table}
 */
async function insert(user_id, lot_id) {
    try {
        await db('notification_requests')
            .insert({user_id,lot_id,status:'REQUESTED'});
        return {status: 'success'};
    } catch (err) {
        return {status: 'failed'};
    }
}

/**
 * get all notification requests by enum type and lot id
 * @param lot_id
 * @returns {Rows in notification_requests table}
 */
async function getByUserAndLotIdAndStatus(user_id, lot_id, status) {
    const result = await db('notification_requests')
        .where({lot_id})
        .andWhere({user_id})
        .andWhere({status: status})
        .select('*');
    return result;
}

/**
 * update by id
 * @param id
 * @returns {Promise<{notification_status: string}>}
 */
async function updateById(id) {
    try {
        await db('notification_requests')
            .where({id})
            .update({status: 'SENT'});
        return {notification_status: 'success'};
    } catch (err) {
        return {notification_status: 'failed'};
    }
}

module.exports = {
    insert,
    getByUserAndLotIdAndStatus,
    updateById,
};
