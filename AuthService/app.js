const express = require("express");
const app = express();
require("dotenv").config();
const cors = require('cors');

//Veri akışı için gerekli olan paketleri ekleme
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));


//Veritabanı bağlantı dosyasını ekleme
require("./src/config/database");


//Routelarımızın olduğu dosyayı ekleme
const Route = require("./src/routers/route");

//Routelara yönlendirme yapma
app.use("/", Route);

//Projeyi ayağa kaldırma
app.listen(process.env.PORT, () => {
  console.log(`Server is standing to ${process.env.PORT} port`);
});