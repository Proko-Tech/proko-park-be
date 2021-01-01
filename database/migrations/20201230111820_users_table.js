const sign_up_type_enum = [
    'NATIVE',
    'GOOGLE',
    'FACEBOOK', 
    'APPLE',
];
exports.up = function(knex) {
    return knex.schema.createTable('users', (tbl) => {
        tbl.increments('id').unique().notNullable();
        tbl.text('first_name').notNullable();
        tbl.text('last_name').notNullable();
        tbl.text('email').notNullable();
        tbl.text('phone_number').notNullable();
        tbl.text('password').notNullable();
        tbl.enum('sign_up_type', sign_up_type_enum, {useNative: true, enumName:'sign_up_type_enum'}).notNullable().index();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('users');
};