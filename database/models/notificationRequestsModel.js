const db = require('../dbConfig');

/**
 * get all notification requests by enum type and lot id
 * @param lot_id
 * @returns {Rows in notification_requests table}
 */
async function getByLotIdAndStatus(lot_id, status) {
    const result = await db('notification_requests')
        .where({lot_id})
        .andWhere({status: status})
        .select('*');
    return result;
}

/**
 * update tickets with status requested or error by lot_id.
 * @param id
 * @returns {Promise<void>}
 */
async function updateRequestedOrErrorByLotId(lot_id, payload) {
    try {
        await db('notification_requests')
            .where({lot_id})
            .andWhere(function() {
                this.where('status', 'REQUESTED')
                    .orWhere('status', 'ERROR');
            })
            .update(payload);
        return {notification_status: 'success'};
    } catch (err) {
        return {notification_status: 'failed'};
    }
}

/**
 * get by lot id and status join users table on user_id
 * @param lot_id
 * @param status
 * @returns {Promise<awaited Knex.QueryBuilder<TRecord, ArrayIfAlready<TResult, DeferredKeySelection<TRecord, string>>>>}
 */
async function getByLotIdAndStatusJoinUsers(lot_id, status) {
    const result = await db('notification_requests')
        .join('users', 'users.id', 'notification_requests.user_id')
        .where({lot_id})
        .andWhere({status: status})
        .select('*');
    return result;
}

module.exports = {
    getByLotIdAndStatus,
    getByLotIdAndStatusJoinUsers,
    updateRequestedOrErrorByLotId,
};
