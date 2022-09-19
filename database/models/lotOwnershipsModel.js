const db = require('../dbConfig');

/**
 * Get lot ownership records by lot_id.
 * @param lot_id
 * @returns {Promise<awaited Knex.QueryBuilder<TRecord, ArrayIfAlready<TResult, DeferredKeySelection<TRecord, string>>>>}
 */
async function getByLotId(lot_id) {
    const result = await db('lot_ownerships')
        .where({lot_id})
        .select('*');
    return result;
}

module.exports={getByLotId}
