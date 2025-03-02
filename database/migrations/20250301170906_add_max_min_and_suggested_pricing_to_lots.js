exports.up = function(knex) {
    return knex.schema.table('lots', (tbl) => {
        tbl.decimal('min_price_per_hour').defaultTo(0);
        tbl.decimal('max_price_per_hour').defaultTo(0);
        tbl.decimal('suggested_price_per_hour').defaultTo(0);
        tbl.boolean('apply_suggested_pricing').defaultTo(false);
    });
};

exports.down = function(knex) {
    return knex.schema.table('lots', (tbl) => {
        tbl.dropColumn('min_price_per_hour');
        tbl.dropColumn('max_price_per_hour');
        tbl.dropColumn('suggested_price_per_hour');
        tbl.boolean('apply_suggested_pricing').defaultTo(false);
    });
};
