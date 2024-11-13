const spot_type_enum = [
    'SINGLE_SPACE_WITH_CAM',
    'SINGLE_SPACE_WITHOUT_CAM',
];
exports.up = function(knex) {
    return knex.schema.table('spots', (tbl) => {
        tbl.enum('spot_type', spot_type_enum, {
            useNative: true,
            enumName: 'spot_type_enum',
        })
            .notNullable()
            .index();
        tbl.decimal('rssi_threshold');
        tbl.decimal('last_rssi_reading');
    });
};

exports.down = function(knex) {
    return knex.schema.table('spots', (tbl) => {
        tbl.dropColumn('spot_type');
        tbl.dropColumn('rssi_threshold');
        tbl.dropColumn('last_rssi_reading');
    });
};
