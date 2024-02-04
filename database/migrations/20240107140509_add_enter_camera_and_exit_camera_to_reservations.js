exports.up = function(knex) {
    return knex.schema.table('reservations', (tbl) => {
        tbl.text('entry_camera_secret');
        tbl.text('exit_camera_secret');
    });
};

exports.down = function(knex) {
    return knex.schema.table('reservations', (tbl) => {
        tbl.dropColumn('entry_camera_secret');
        tbl.dropColumn('exit_camera_secret');
    });
};
