
exports.up = function(knex) {
    return knex.schema.table('users', (tbl) => {
        tbl.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.table('users', (tbl) => {
        tbl.dropColumn('created_at');
        tbl.dropColumn('updated_at');
    });
};
