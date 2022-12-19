
exports.up = function(knex) {
    return knex.schema.table('reservations', (tbl) => {
        tbl.text('guest_key');
    });
};

exports.down = function(knex) {
    return knex.schema.table('reservations', (tbl) => {
        tbl.dropColumn('guest_key');
    });
};
