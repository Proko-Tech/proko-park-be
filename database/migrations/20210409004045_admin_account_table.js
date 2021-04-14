/*
 * Determines whether the admin is able to login
 * ACTIVE: allowed to login, no restrictions to our services.
 * INACTIVE: cannot login, cancelled our services.
 * PENALIZED: cannot login, restricted use for possible violation of terms of service.
 * BLACKLISTED: cannot login, violated terms of services and not allowed to use our services.
 */
const membership_status_enum = [
    'ACTIVE',
    'INACTIVE',
    'PENALIZED',
    'BLACKLISTED',
];

exports.up = function(knex) {
    return knex.schema.createTable('admin_accounts', (tbl)=>{
        tbl.increments('id').unique().notNullable();
        tbl.text('admin_fname').notNullable();
        tbl.text('admin_lname').notNullable();
        tbl.text('admin_email').notNullable();
        tbl.text('admin_phone_number').notNullable();
        tbl.text('admin_username').notNullable();
        tbl.text('admin_password_hash').notNullable();
        tbl.text('admin_password_salt').notNullable();
        tbl.text('organization_name').notNullable();
        tbl.enum('membership_status', membership_status_enum, {useNative: true, enumName:'membership_status_enum'}).notNullable().index();
        tbl.text('notes');
        tbl.timestamps(true,true);// creates created_at column and updated_at column
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('admin_accounts');
};
