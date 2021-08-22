const license_issued_states_enum = [
    'AL',
    'AK',
    'AS',
    'AZ',
    'AR',
    'CA',
    'CO',
    'CT',
    'DE',
    'DC',
    'FM',
    'FL',
    'GA',
    'GU',
    'HI',
    'ID',
    'IL',
    'IN',
    'IA',
    'KS',
    'KY',
    'LA',
    'ME',
    'MH',
    'MD',
    'MA',
    'MI',
    'MN',
    'MS',
    'MO',
    'MT',
    'NE',
    'NV',
    'NH',
    'NJ',
    'NM',
    'NY',
    'NC',
    'ND',
    'MP',
    'OH',
    'OK',
    'OR',
    'PW',
    'PA',
    'PR',
    'RI',
    'SC',
    'SD',
    'TN',
    'TX',
    'UT',
    'VT',
    'VI',
    'VA',
    'WA',
    'WV',
    'WI',
    'WY',
];

exports.up = function(knex) {
    return knex.schema.table('vehicles', (tbl) => {
        tbl.enum('license_issued_state', license_issued_states_enum, {useNative: true, enumName:'sign_up_type_enum'}).notNullable().index();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('vehicles', (tbl) => {
        tbl.dropColumn('license_issued_state');
    });
};
