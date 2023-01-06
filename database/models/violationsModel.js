const db = require('../dbConfig');

/**
 * Insert into violations table.
 * @param payload
 * @returns {Promise<void>}
 */
async function insert(payload) {
    await db('violations')
        .insert(payload);
}

module.exports={insert}
