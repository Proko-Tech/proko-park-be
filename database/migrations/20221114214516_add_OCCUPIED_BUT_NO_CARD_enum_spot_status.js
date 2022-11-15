
const spot_status_enum = [
    'UNOCCUPIED',
    'RESERVED',
    'OCCUPIED',
    'OFF_LINE',
    'VIOLATION',
    'OCCUPIED_BUT_NO_CARD',
];
const spot_status_enum_old = [
    'UNOCCUPIED',
    'RESERVED',
    'OCCUPIED',
    'OFF_LINE',
    'VIOLATION',
];
const tableName = 'spots';
const columnName = 'spot_status';

exports.up = function(knex) {
    let existRows;
    return knex.select()
        .from(tableName)
        .then((rows) => {
            existRows = rows
            return knex.schema.table(tableName, (table) =>
                table.dropColumn(columnName))
        })
        .then(() => knex.schema.table(tableName, (table) =>
            table.enu(columnName, spot_status_enum).notNullable()))
        .then(() => {
            return Promise.all(existRows.map((row) => {
                return knex(tableName)
                    .update({spot_status: row.spot_status})
                    .where('id', row.id)
            }))
        })
}

exports.down = function(knex) {
    let existRows;
    return knex.select()
        .from(tableName)
        .then((rows) => {
            existRows = rows
            return knex.schema.table(tableName, (table) =>
                table.dropColumn(columnName))
        })
        .then(() => knex.schema.table(tableName, (table) =>
            table.enu(columnName, spot_status_enum_old).notNullable()))
        .then(() => {
            return Promise.all(existRows.map((row) => {
                return knex(tableName)
                    .update({spot_status: row.spot_status === 'OCCUPIED_BUT_NO_CARD' ? 'OCCUPIED' : row.spot_status})
                    .where('id', row.id)
            }))
        })
}
