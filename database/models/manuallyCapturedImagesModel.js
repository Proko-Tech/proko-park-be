const db = require('../dbConfig');

/**
 * get manual capture info by capture_id
 * @param capture_id
 * @returns {Promise<void>}
 */
async function getById(capture_id) {
	const rows = await db('manually_captured_images').where('capture_id', capture_id).select('*');
	return rows;
}


/**
 * get manual capture info by capture_id
 * @param capture_id
 * @returns {Promise<void>}
 */
async function getBySpotId(spot_id) {
	const rows = await db('manually_captured_images').where('spot_id', spot_id).select('*');
	return rows;
}