exports.up = function(knex) {
    return knex.schema.table('users', (tbl) => {
        tbl.text('apple_user');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('users', (tbl) => {
        tbl.dropColumn('apple_user');
    });
};
