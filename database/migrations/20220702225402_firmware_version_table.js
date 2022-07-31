exports.up = function(knex) {
    return knex.schema.createTable('firmware_versions', (tbl) => {
        tbl.increments('id').unique().notNullable();
        tbl.string('version').unique().notNullable();
        tbl.text('esp8266_url').notNullable();
        tbl.text('esp32_url').notNullable();
        tbl.text('esp8266_file_name').notNullable();
        tbl.text('esp32_file_name').notNullable();
        // creates created_at column and updated_at column
        tbl.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('firmware_versions');
};
