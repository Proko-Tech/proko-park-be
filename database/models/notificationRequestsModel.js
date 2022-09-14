const db = require('../dbConfig');

/**
 * get all notification requests by enum type and lot id
 * @param lot_id
 * @returns {Rows in notification_requests table}
 */
async function insert(payload) {
    try {
        await db('notification_requests')
            .insert(payload);
        return {status: 'success'};
    } catch (err) {
        return {status: 'failed'};
    }
}

/**
 * get requested and error notification requests by [user_id]
 * @param user_id
 * @returns {Promise<awaited Knex.QueryBuilder<TRecord, ArrayIfAlready<TResult, DeferredKeySelection<TRecord, string>>>>}
 */
async function getRequestedOrErrorByUserId(user_id) {
    const rows = await db('notification_requests')
        .where({user_id})
        .andWhere(function() {
            this.where('status', 'REQUESTED')
                .orWhere('status', 'ERROR')
        })
        .select('*');
    return rows;
}

module.exports = {
    insert,
    getRequestedOrErrorByUserId,
};
