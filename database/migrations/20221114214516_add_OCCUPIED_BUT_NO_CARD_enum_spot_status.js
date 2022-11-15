
const spot_status_enum = [
    'UNOCCUPIED',
    'RESERVED',
    'OCCUPIED',
    'OFF_LINE',
    'VIOLATION',
    'OCCUPIED_WITHOUT_CARD',
];
const spot_status_enum_old = [
    'UNOCCUPIED',
    'RESERVED',
    'OCCUPIED',
    'OFF_LINE',
    'VIOLATION',
];

exports.up = async function(knex) {
    const current_rows = await knex('spots').select('*');
    await knex.schema.table('spots', (tbl) => tbl.dropColumn('spot_status'));
    await knex.schema.table('spots', (tbl) => tbl.enum('spot_status', spot_status_enum, {
        useNative: true,
        enumName: 'spot_status_enum',
    }));
    return await Promise.all(current_rows.map((row) => {
        return knex('spots')
            .update({spot_status: row.spot_status})
            .where('id', row.id)
    }));
}

exports.down = async function(knex) {
    const current_rows = await knex('spots').select('*');
    await knex.schema.table('spots', (tbl) => tbl.dropColumn('spot_status'));
    await knex.schema.table('spots', (tbl) => tbl.enum('spot_status', spot_status_enum_old, {
        useNative: true,
        enumName: 'spot_status_enum',
    }));
    return await Promise.all(current_rows.map((row) => {
        return knex('spots')
            .update({spot_status: row.spot_status ===
                'OCCUPIED_WITHOUT_CARD' ? 'OCCUPIED' : row.spot_status})
            .where('id', row.id)
    }));
}
