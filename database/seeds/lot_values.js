
exports.seed = function(knex) {
    // Deletes ALL existing entries
    return knex('lots').del()
        .then(function() {
            // Inserts seed entries
            return knex('lots').insert([
                {id:1, name:'Promenade Parking', address:'2237 amazing ln', state:'CA', city:'Proko', zip:'03932', lat:33.771911, long: -118.3750051, hash:'qerkcduaickf', alive_status:true, price_per_hour: 10.0},
                {id:2, name:'El Fernando Parking', address:'2238 amazing ln', state:'CA', city:'Proko', zip:'03932', lat:33.732911, long: -118.3750051, hash:'dasfewrwefrf', alive_status:true, price_per_hour: 12.0},
                {id:3, name:'Xd Parking', address:'2237 amazing ln', state:'CA', city:'Proko', zip:'03932', lat:33.765911, long: -118.3540051, hash:'dafdadfafds', alive_status:true, price_per_hour: 10.0},
                {id:4, name:'Fam part Parking', address:'2238 amazing ln', state:'CA', city:'Proko', zip:'03932', lat:33.766911, long: -118.3620051, hash:'jgiuufhdsmcd', alive_status:true, price_per_hour: 12.0},
                {id:5, name:'Del Ray Mall Parking', address:'2237 amazing ln', state:'CA', city:'Proko', zip:'03932', lat:33.785911, long: -118.3810051, hash:'utidshfnvbhg', alive_status:true, price_per_hour: 10.0},
                {id:6, name:'EDC Plaza Parking', address:'2238 amazing ln', state:'CA', city:'Proko', zip:'03932', lat:33.762911, long: -118.3552051, hash:'queyfhcnsjak', alive_status:true, price_per_hour: 12.0},
                {id:7, name:'UCLA Medicine Parking', address:'2237 amazing ln', state:'CA', city:'Proko', zip:'03932', lat:33.773911, long: -118.3868051, hash:'lkdshcnghfh', alive_status:true, price_per_hour: 10.0},
                {id:8, name:'Harbor Parking', address:'2238 amazing ln', state:'CA', city:'Proko', zip:'03932', lat:33.782311, long: -118.3721051, hash:'poiwndjskald', alive_status:true, price_per_hour: 12.0},
                {id:9, name:'CSI Parking', address:'2237 amazing ln', state:'CA', city:'Proko', zip:'03932', lat:33.763411, long: -118.3759051, hash:'cnvbhsjlskcn', alive_status:true, price_per_hour: 10.0},
                {id:10, name:'EDF Parking', address:'2238 amazing ln', state:'CA', city:'Proko', zip:'03932', lat:33.746511, long: -118.3752051, hash:'fflsickvjdjs', alive_status:true, price_per_hour: 12.0},
            ]);
        });
};
