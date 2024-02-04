exports.up = function(knex) {
    return knex.schema.table('spots', (tbl) => {
        tbl.boolean('is_fake_spot').defaultTo(false);
    });
};

exports.down = function(knex) {
    return knex.schema.table('spots', (tbl) => {
        tbl.dropColumn('is_fake_spot');
    });
};
