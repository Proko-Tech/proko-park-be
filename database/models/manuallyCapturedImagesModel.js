const db = require('../dbConfig');

/**
 * get manually_captured_images row by id
 * @param id each manually_captured_images entry has a unique id
 * @returns {Promise<void>}
 */
async function getById(id) {
	const rows = await db('manually_captured_images').where('id', id).select('*');
	return rows;
}


/**
 * get all manually_captured_images rows by spot_secret
 * @param spot_secret
 * @returns {Promise<void>}
 */
async function getBySpotSecret(spot_secret) {
	const rows = await db('manually_captured_images').where('spot_secret', spot_secret).select('*');
	return rows;
}