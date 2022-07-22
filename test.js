const model = require("./database/models/usersModel");

const info = await model.getById(19);

console.log("Hello world");

