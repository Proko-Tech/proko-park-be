const door_camera_alive_status_enum = [
    'ALIVE',
    'DEAD',
];

exports.up = function(knex) {
    return knex.schema.table('door_cameras', (tbl) => {
        tbl.enum('cam_alive_status', door_camera_alive_status_enum, {
            useNative: true,
            enumName: 'door_camera_alive_status_enum',
        })
    });
};

exports.down = function(knex) {
    return knex.schema.table('lots', (tbl) => {
        tbl.dropColumn('cam_alive_status');
    });
};
