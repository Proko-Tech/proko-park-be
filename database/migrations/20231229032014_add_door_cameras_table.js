const camera_type_enum = [
    'EXIT',
    'ENTRY',
];
exports.up = function(knex) {
    return knex.schema.createTable('door_cameras', (tbl) => {
        tbl.increments('id').unique().notNullable();
        tbl.text('secret').notNullable();
        tbl.integer('lot_id').notNullable();
        tbl.enum('type', camera_type_enum, {
            useNative: true,
            enumName: 'door_camera_type_enum',
        })
            .notNullable()
            .index();
        // creates created_at column and updated_at column
        tbl.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('door_cameras');
};
