const vehicle_ownership_status = [
    'INVITED',
    'ACCEPTED',
    'REJECTED',
];

exports.up = function(knex) {
    return knex.schema.createTable('vehicle_ownership', (tbl) => {
        tbl.increments('id').unique().notNullable();
        tbl.integer('user_id').notNullable();
        tbl.integer('vehicle_id').notNullable();
        tbl.boolean('is_primary_owner').notNullable();
        tbl.enum('status', vehicle_ownership_status, {useNative: true, enumName:'spot_status_enum'}).notNullable().index();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('vehicle_ownership');
};
