exports.up = function(knex) {
    return knex.schema.table('reservations', (tbl) => {
        tbl.float('client_original_amount').defaultTo(0).notNullable();
        tbl.float('commission_amount').defaultTo(0).notNullable();
    });
};

exports.down = function(knex) {
    return knex.schema.table('reservations', (tbl) => {
        tbl.dropColumn('client_original_amount');
        tbl.dropColumn('commission_amount');
    });
};
