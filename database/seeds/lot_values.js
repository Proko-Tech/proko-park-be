
exports.seed = function(knex) {
    // Deletes ALL existing entries
    return knex('lots').del()
        .then(function() {
            // Inserts seed entries
            return knex('lots').insert([
                {id:1, name:'testing_lot', address:'2237 amazing ln', state:'CA', city:'Proko', zip:'03932', lat:33.771911, long: -118.3750051, hash:'qerkcduaickf', alive_status:true},
            ]);
        });
};
