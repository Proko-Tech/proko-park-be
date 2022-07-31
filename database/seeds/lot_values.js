exports.seed = function(knex) {
    // Deletes ALL existing entries
    return knex('lots')
        .del()
        .then(function() {
            // Inserts seed entries
            return knex('lots').insert([
                {
                    id: 1,
                    name: 'Scholar Drive Parking',
                    address: '9655 Scholars Dr N',
                    state: 'CA',
                    city: 'La Jolla',
                    zip: '92093',
                    lat: 32.8799366,
                    long: -117.2416718,
                    hash: 'dasfewrwefrf',
                    alive_status: true,
                    price_per_hour: 10.0,
                },
            ]);
        });
};
