//MongoDB Veritabanı Bağlantısını Oluşturma
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_CONNECTION_STRING,)
.then(()=> console.log('Connected database!'))
.catch(hata => console.log('Database Error: ' + hata));