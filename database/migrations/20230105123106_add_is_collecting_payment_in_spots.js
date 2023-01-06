
exports.up = function(knex) {
    return knex.schema.table('spots', (tbl) => {
        tbl.boolean('is_collecting_payment').defaultTo(false);
    });
};

exports.down = function(knex) {
    return knex.schema.table('spots', (tbl) => {
        tbl.dropColumn('is_collecting_payment');
    });
};
