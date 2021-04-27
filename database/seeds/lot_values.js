
exports.seed = function(knex) {
    // Deletes ALL existing entries
    return knex('lots').del()
        .then(function() {
            // Inserts seed entries
            return knex('lots').insert([
                {id:1, name:'Promenade Parking', address:'2237 amazing ln', state:'CA', city:'Proko', zip:'03932', lat:33.771911, long: -118.3750051, hash:'qerkcduaickf', alive_status:true, price_per_hour: 10.0},
                {id:2, name:'El Fernando Parking', address:'2238 amazing ln', state:'CA', city:'Proko', zip:'03932', lat:33.772911, long: -118.3750051, hash:'dasfewrwefrf', alive_status:true, price_per_hour: 12.0},
            ]);
        });
};
