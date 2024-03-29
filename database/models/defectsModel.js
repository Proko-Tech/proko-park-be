const db = require('../dbConfig');

/**
 * Insert record into defects table.
 * @param payload
 * @returns {Promise<void>}
 */
async function insert(payload) {
    await db('defects')
        .insert(payload);
}

/**
 * Get defects by status and lot id.
 * @param status
 * @param lot_id
 * @returns {Promise<awaited Knex.QueryBuilder<TRecord, ArrayIfAlready<TResult, DeferredKeySelection<TRecord, string>>>>}
 */
async function getAutoGeneratedByStatusAndLotId(status, lot_id) {
    const result = await db('defects')
        .where({status, lot_id, is_auto_generator: true})
        .select('*');
    return result;
}

module.exports={insert, getAutoGeneratedByStatusAndLotId}
