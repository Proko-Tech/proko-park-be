exports.up = function(knex) {
    return knex.schema.table('door_cameras', (tbl) => {
        tbl.boolean('is_cam_alive').defaultTo(false);
        tbl.text('door_camera_name');
    });
};

exports.down = function(knex) {
    return knex.schema.table('door_cameras', (tbl) => {
        tbl.dropColumn('is_cam_alive');
        tbl.dropColumn('door_camera_name');
    });
};