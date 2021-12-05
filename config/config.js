const mongoose = require('mongoose');

const db = mongoose.connect('mongodb+srv://shorturladmin:bvJ2uBxUNev4qJaO@cluster0.yhsqw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
    () => console.log(`DB Connected...`),
    (err) => console.log(err));

module.exports = db;

