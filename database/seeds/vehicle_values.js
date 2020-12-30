
exports.seed = function(knex) {
    // Deletes ALL existing entries
    return knex('vehicles').del()
        .then(function() {
            // Inserts seed entries
            return knex('vehicles').insert([
                {id: 1, license_plate: '12345', make: 'Toyota', brand: 'Toyota', model: 'Prius', color: 'gray'},
                {id: 2, license_plate: '1234567', make: 'Volkswagen', brand: 'Volkswagen', model: 'Bus', color: 'Red and White'},
                {id: 3, license_plate: 'ABCDEFG', make: 'Toyota', brand: 'Toyota', model: '4Runner', color: 'green'},
            ]);
        });
};