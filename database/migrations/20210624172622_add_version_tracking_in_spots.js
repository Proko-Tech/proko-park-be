exports.up = function(knex) {
    return knex.schema.table('spots', (tbl) => {
        tbl.integer('firmware_version').defaultTo(1);
        tbl.integer('available_firmware_version').defaultTo(1);
        tbl.dateTime('firmware_updated_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('spots', (tbl) => {
        tbl.dropColumn('firmware_version');
        tbl.dropColumn('available_firmware_version');
        tbl.dateTime('firmware_updated_at');
    });
};
