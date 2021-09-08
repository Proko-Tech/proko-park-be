const internal_site_enum= ['VISIBLE','INVISIBLE'];

exports.up = function(knex) {
    return knex.schema.table('complaints', (tbl) => {
        tbl.integer('admin_id').notNullable();
        tbl.enum('internal_site', internal_site_enum, {useNative: true, enumName:'internal_site_enum'}).notNullable().index();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('complaints', (tbl) => {
        tbl.dropColumn('admin_id');
        tbl.dropColumn('internal_site');
    });
};
