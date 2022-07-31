const internal_site_enum = ['VISIBLE', 'INVISIBLE'];

exports.up = function(knex) {
    return knex.schema.createTable('complaints', (tbl) => {
        tbl.increments('id').unique().notNullable();
        tbl.text('name').notNullable();
        tbl.text('email').notNullable();
        tbl.text('subject').notNullable();
        tbl.text('message').notNullable();
        tbl.text('license_plate');
        // creates created_at column and updated_at column
        tbl.timestamps(true, true);
        tbl.integer('admin_id').notNullable();
        tbl.enum('internal_site', internal_site_enum, {
            useNative: true,
            enumName: 'internal_site_enum',
        })
            .notNullable()
            .index();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('complaints');
};
