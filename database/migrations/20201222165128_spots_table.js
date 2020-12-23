const spot_status_enum = [
    'UNOCCUPIED',
    'RESERVED',
    'OCCUPIED',
    'OFF_LINE',
];
exports.up = function(knex) {
    return knex.schema.createTable('spots', (tbl)=>{
        tbl.increments('id').unique().notNullable();
        tbl.integer('lot_id').notNullable();
        tbl.text('spot_name');
        tbl.text('secret').notNullable();
        tbl.boolean('alive_status').notNullable();
        tbl.enum('spot_status', spot_status_enum, {useNative: true, enumName:'spot_status_enum'}).notNullable().index();
        tbl.timestamps(true,true);// creates created_at column and updated_at column
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('spots');
};
