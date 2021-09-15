const status = ['ACTIVE', 'REJECTED'];

exports.up = function(knex) {
    return knex.schema.table('complaints', (tbl) => {
        tbl.enum('Status', status, {useNative: true, enumName:'status'}).notNullable().index();
    });
};

exports.down = function(knex) {
    return knex.schema.table('complaints', (tbl) => {
        tbl.dropColumn('Status');
    });
};
