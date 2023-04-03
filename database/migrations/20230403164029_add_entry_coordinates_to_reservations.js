
exports.up = function(knex) {
    return knex.schema.table('reservations', (tbl) => {
        tbl.text('entry_coordinates');
    });
};

exports.down = function(knex) {
    return knex.schema.table('reservations', (tbl) => {
        tbl.dropColumn('entry_coordinates');
    });
};
