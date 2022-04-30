exports.up = function(knex) {
    return knex.schema.table('prediction_results', (tbl)=>{
        tbl.dateTime('exited_at');
    });
};

exports.down = function(knex) {
    return knex.schema.table('prediction_results', (tbl)=>{
        tbl.dropColumn('exited_at');
    });
};
