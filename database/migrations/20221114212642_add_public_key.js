
exports.up = function(knex) {
    return knex.schema.table('spots', (tbl) => {
        tbl.text('public_key');
    });
};

exports.down = function(knex) {
    return knex.schema.table('spots', (tbl) => {
        tbl.dropColumn('public_key');
    });
};
