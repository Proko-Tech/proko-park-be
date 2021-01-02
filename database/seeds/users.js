
exports.seed = function(knex) {
    // Deletes ALL existing entries
    return knex('users').del()
        .then(function() {
            // Inserts seed entries
            return knex('users').insert([
                {id: 1, email: 'thomasligreat11@gmail.com', phone_number: '5621231234', first_name:'Thomas', last_name:'Li', password: '$2a$10$BqoGdXryg1ajOulvK1/.GOu8Dkqo1mHkF249acfL8QlCNHsAC6xZm', sign_up_type: 'NATIVE'},
                {id: 2, email: 'mingkaithomasli@gmail.com', phone_number: '5621231234', first_name:'Google', last_name:'User', password: '$2a$10$BqoGdXryg1ajOulvK1/.GOu8Dkqo1mHkF249acfL8QlCNHsAC6xZm', sign_up_type: 'GOOGLE'},
            ]);
        });
};


