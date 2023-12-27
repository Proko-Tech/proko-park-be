
exports.up = function(knex) {
    /* eslint-disable max-len */
    knex.raw(
        'CREATE FUNCTION LEVENSHTEIN(s1 VARCHAR(255), s2 VARCHAR(255))\n' +
        'RETURNS INT\n' +
        'DETERMINISTIC\n' +
        'BEGIN\n' +
        '  DECLARE s1_len, s2_len, i, j, c, c_temp, cost INT;\n' +
        '  DECLARE s1_char CHAR;\n' +
        '  DECLARE cv0, cv1 VARBINARY(256);\n' +
        '  SET s1_len = CHAR_LENGTH(s1), s2_len = CHAR_LENGTH(s2), cv1 = 0x00, j = 1, i = 1, c = 0;\n' +
        '  IF s1 = s2 THEN\n' +
        '    RETURN 0;\n' +
        '  ELSEIF s1_len = 0 THEN\n' +
        '    RETURN s2_len;\n' +
        '  ELSEIF s2_len = 0 THEN\n' +
        '    RETURN s1_len;\n' +
        '  END IF;\n' +
        '  WHILE j <= s2_len DO\n' +
        '    SET cv1 = CONCAT(cv1, UNHEX(HEX(j))), j = j + 1;\n' +
        '  END WHILE;\n' +
        '  WHILE i <= s1_len DO\n' +
        '    SET s1_char = SUBSTRING(s1, i, 1), c = i, cv0 = UNHEX(HEX(i)), j = 1;\n' +
        '    WHILE j <= s2_len DO\n' +
        '      SET cost = IF(s1_char = SUBSTRING(s2, j, 1), 0, 1);\n' +
        '      SET c_temp = ORD(SUBSTRING(cv1, j, 1)) + cost;\n' +
        '      IF c_temp < c THEN SET c = c_temp; END IF;\n' +
        '      SET c_temp = ORD(SUBSTRING(cv1, j+1, 1)) + 1;\n' +
        '      IF c_temp < c THEN SET c = c_temp; END IF;\n' +
        '      SET c_temp = ORD(SUBSTRING(cv0, j, 1)) + 1;\n' +
        '      IF c_temp < c THEN SET c = c_temp; END IF;\n' +
        '      SET cv0 = CONCAT(cv0, UNHEX(HEX(c))), j = j + 1;\n' +
        '    END WHILE;\n' +
        '    SET cv1 = cv0, i = i + 1;\n' +
        '  END WHILE;\n' +
        '  RETURN c;\n' +
        'END;');

    knex.raw(
        'CREATE FUNCTION SIMILARITY_SCORE(s1 VARCHAR(255), s2 VARCHAR(255))\n' +
        'RETURNS FLOAT\n' +
        'DETERMINISTIC\n' +
        'BEGIN\n' +
        '  DECLARE max_len INT;\n' +
        '  SET max_len = GREATEST(CHAR_LENGTH(s1), CHAR_LENGTH(s2));\n' +
        '  RETURN (1 - (LEVENSHTEIN(s1, s2) / max_len)) * 100;\n' +
        'END;');
    /* eslint-enable max-len */
};

exports.down = function(knex) {
    knex.raw(
        'DROP FUNCTION IF EXISTS LEVENSHTEIN; ' +
        'DROP FUNCTION IF EXISTS SIMILARITY_SCORE; ',
    )
};
