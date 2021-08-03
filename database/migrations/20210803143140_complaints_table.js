
exports.up = function(knex) {
    return knex.schema.createTable('complaints', (tbl)=>{
        tbl.increments('id').unique().notNullable();
        tbl.text('name').notNullable();
        tbl.text('email').notNullable();
        tbl.text('detail').notNullable();
        tbl.text('license_plate');
        tbl.timestamps(true,true);// creates created_at column and updated_at column
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('complaints');
};
