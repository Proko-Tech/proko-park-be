const sign_up = require('../constants/sign_up_type');

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
        return knex('users').insert([
            { id: 1, email: 'jessica@gmail.com', phone_number: '5621231234', password: 'E1FC45F7880E0505FF0B6A079B9AF149F225E260F59B1D20225357A8CCE8FFD8', sign_up_type: sign_up.sign_up_type.Native },
            { id: 2, email: 'thomas@gmail.com', phone_number: '5621231234', password: 'D38681074467C0BC147B17A9A12B9EFA8CC10BCF545F5B0BCCCCF5A93C4A2B79', sign_up_type: sign_up.sign_up_type.NATIVE },
            { id: 3, email: 'yuichi@gmail.com', phone_number: '5621231234', password: '8E996FC3089268553645F4B5629949B4FE8EE8698BA49082007EB49895024782', sign_up_type: sign_up.sign_up_type.NATIVE  },
            { id: 4, email: 'don@gmail.com', phone_number: '5621231234', password: 'E3172BDD56FAEC80E2592BF8EC4026DE5100719F7E2D87CE135AE1DACEA1271B', sign_up_type: sign_up.sign_up_type.NATIVE  },
            { id: 5, email: 'andrew@gmail.com', phone_number: '5621231234', password: 'D979885447A413ABB6D606A5D0F45C3B7809E6FDE2C83F0DF3426F1FC9BFED97', sign_up_type: sign_up.sign_up_type.NATIVE  },
            { id: 6, email: 'rob@gmail.com', phone_number: '5621231234', password: '4007D46292298E83DA10D0763D95D5139FE0C157148D0587AA912170414CCBA6', sign_up_type: sign_up.sign_up_type.NATIVE  },
      ]);
    });
};
