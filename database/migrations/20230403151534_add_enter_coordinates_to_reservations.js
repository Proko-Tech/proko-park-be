
exports.up = function(knex) {
    return knex.schema.table('reservations', (tbl) => {
        tbl.text('enter_coordinates');
    });
};

exports.down = function(knex) {
    return knex.schema.table('reservations', (tbl) => {
        tbl.dropColumn('enter_coordinates');
    });
};
