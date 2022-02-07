const spot_status_enum = [
    'UNOCCUPIED',
    'RESERVED',
    'OCCUPIED',
    'OFF_LINE',
    'VIOLATION',
];
exports.up = function(knex) {
    return knex.schema.createTable('spots', (tbl)=>{
        tbl.increments('id').unique().notNullable();
        tbl.integer('lot_id').notNullable();
        tbl.text('spot_name');
        tbl.text('secret').notNullable();
        tbl.boolean('alive_status').notNullable();
        tbl.boolean('is_charging_station').notNullable();
        tbl.enum('spot_status', spot_status_enum, {useNative: true, enumName:'spot_status_enum'}).notNullable().index();
        tbl.timestamps(true,true);// creates created_at column and updated_at column
        tbl.integer('firmware_version').defaultTo(1);
        tbl.integer('available_firmware_version').defaultTo(1);
        tbl.dateTime('firmware_updated_at').defaultTo(knex.fn.now());
        tbl.boolean('is_reservable').notNullable().defaultTo(true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('spots');
};
