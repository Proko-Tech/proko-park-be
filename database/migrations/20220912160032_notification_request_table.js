const status_enum = ['REQUESTED', 'SENT', 'ERROR'];

exports.up = function(knex) {
    return knex.schema.createTable('notification_request', (tbl) => {
        tbl.increments('id').unique().notNullable();
        tbl.integer('user_id').notNullable();
        tbl.integer('lot_id').notNullable();
        tbl.timestamps(true, true);
        tbl.enum('status', status_enum, {
            useNative: true,
            enumName: 'status_enum',
        })
            .notNullable();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('notification_request');
};
