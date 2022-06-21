
exports.up = function(knex) {
    return knex.schema.table('violations', (tbl)=>{
        tbl.text('exit_image_url');
        tbl.text('exit_at')
    });
};

exports.down = function(knex) {
    return knex.schema.table('violations', (tbl)=>{
        tbl.dropColumn('exit_image_url');
        tbl.dropColumn('exit_at')
    });
};
