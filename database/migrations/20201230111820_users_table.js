
exports.up = function(knex) {
    return knex.schema.createTable('users', (tbl) => {
        tbl.increments('id').unique().notNullable();
        tbl.text('email').notNullable();
        tbl.text('phone_number').notNullable();
        tbl.text('hash').notNullable();
        tbl.text('secret').notNullable();
        tbl.text('sign_up_type').notNullable();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('users');
};
