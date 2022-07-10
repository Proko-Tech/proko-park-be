
exports.up = function(knex) {
    return knex.schema.createTable('firmware_version', (tbl)=>{
        tbl.string('version').primary().notNullable();
        tbl.text('ESP8266_url').notNullable();
        tbl.text('ESP32_url').notNullable();
        tbl.text('ESP8266_file_name').notNullable();
        tbl.text('ESP32_file_name').notNullable();
        tbl.timestamps(true,true);// creates created_at column and updated_at column
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('firmware_version');
};
