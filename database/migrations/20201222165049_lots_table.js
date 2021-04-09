
exports.up = function(knex) {
    return knex.schema.createTable('lots', (tbl)=>{
        tbl.increments('id').unique().notNullable();
        tbl.text('name').notNullable();
        tbl.text('address').notNullable();
        tbl.text('state').notNullable();
        tbl.text('city').notNullable();
        tbl.text('zip').notNullable();
        tbl.decimal('lat', 10, 8).notNullable();
        tbl.decimal('long', 11, 8).notNullable();
        tbl.text('hash').notNullable();
        tbl.boolean('alive_status').notNullable();
        tbl.decimal('price_per_hour').notNullable();
        tbl.foreign('admin_id').references('admin_account.id');
        tbl.timestamps(true,true);// creates created_at column and updated_at column
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('lots');
};
