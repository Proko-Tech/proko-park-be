const db = require('../dbConfig');

/**
 * Get guests by id.
 * @param id
 * @returns {Promise<awaited Knex.QueryBuilder<TRecord, ArrayIfAlready<TResult, DeferredKeySelection<TRecord, string>>>>}
 */
async function getById(id) {
    const result = await db('guests')
        .where({id})
        .select('*');
    return result;
}

module.exports={getById}
