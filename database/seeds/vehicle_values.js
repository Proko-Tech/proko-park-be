
exports.seed = function(knex) {
    // Deletes ALL existing entries
    return knex('vehicles').del()
        .then(function() {
            // Inserts seed entries
            return knex('vehicles').insert([
                {id: 1, license_plate: 'MGM6573', brand: 'Toyota', model:'Rav 4', color:'Black'},
            ]);
        });
};
