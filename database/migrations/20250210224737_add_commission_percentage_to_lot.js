exports.up = function(knex) {
    return knex.schema.table('lots', (tbl) => {
        tbl.float('commission_percentage').defaultTo(20).notNullable();
    });
};

exports.down = function(knex) {
    return knex.schema.table('lots', (tbl) => {
        tbl.dropColumn('commission_percentage');
    });
};
