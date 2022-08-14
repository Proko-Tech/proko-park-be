const db = require('../dbConfig');

/**
 * get manual capture info by capture_id
 * @param capture_id each manual capture entry has a unique capture_id
 * @returns {Promise<void>}
 */
async function getById(capture_id) {
    const rows = await db('manually_captured_images').where('capture_id', capture_id).select('*');
    return rows;
}


/**
 * get all manual capture info by spot_secret
 * @param spot_secret
 * @returns {Promise<void>}
 */
async function getAllBySpotId(spot_secret) {
    const rows = await db('manually_captured_images').where('spot_secret', spot_secret).select('*');
    return rows;
}