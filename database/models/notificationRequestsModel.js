const db = require('../dbConfig');

/**
 * get all notification requests by enum type and lot id
 * @param lot_id
 * @returns {Rows in notification_requests table}
 */
async function getNotificationRequestsByLotIdAndStatus(lot_id, status) {
    const result = await db('notification_requests')
        .where({lot_id})
        .andWhere({status: status})
        .select('*');
    return result;
}

/**
 * update by id
 * @param id
 * @returns {Promise<void>}
 */
async function updateById(id) {
    try{
        await db('notification_requests')
        .where({id})
        .update({status: 'SENT'});
        return {notification_status: 'success'};
    } catch (err) {
        return {notification_status: 'failed'};
    }
}

module.exports = {
    getNotificationRequestsByLotIdAndStatus,
    updateById,
};