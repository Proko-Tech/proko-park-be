const db = require('../dbConfig');

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

module.exports={getRequestedOrErrorByUserId}
