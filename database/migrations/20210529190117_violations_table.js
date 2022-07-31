const violation_type_enum = [
    'NOT_YET_ENTERED_BUT_OCCUPIED',
    'NOT_YET_RESERVED_BUT_OCCUPIED',
    'NOT_RIGHT_VEHICLE',
];

exports.up = function(knex) {
    return knex.schema.createTable('violations', (tbl) => {
        tbl.increments('id').unique().notNullable();
        tbl.integer('reservation_id');
        tbl.integer('user_id');
        tbl.integer('lot_id').notNullable();
        tbl.text('spot_hash').notNullable();
        tbl.timestamp('created_at').notNullable();
        tbl.enum('type', violation_type_enum, {
            useNative: true,
            enumName: 'violation_type_enum',
        })
            .notNullable()
            .index();
        tbl.boolean('is_resolved');
        tbl.text('violation_image_url');
        tbl.text('predicted_license_plate');
        // TODO: remove nullable.
        tbl.timestamp('resolved_at').notNullable();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('violations');
};
