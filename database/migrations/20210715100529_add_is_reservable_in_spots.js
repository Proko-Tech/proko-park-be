exports.up = function(knex) {
    return knex.schema.table('spots', (tbl) => {
        tbl.boolean('is_reservable').notNullable().defaultTo(true);
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('spots', (tbl) => {
        tbl.dropColumn('is_reservable');
    });
};
