
exports.up = function(knex) {
    return knex.schema.createTable('users', (tbl) => {
        tbl.increments('id').unique().notNullable();
        tbl.text('email').notNullable();
        tbl.text('phone_number').notNullable();
        tbl.text('password').notNullable()
        tbl.text('secret').notNullable();
        tbl.enu('sign_up_type', ['NATIVE', 'GOOGLE', 'FACEBOOK', 'APPLE']);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('users');
};
