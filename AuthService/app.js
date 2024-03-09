const express = require("express");
const app = express();
require("dotenv").config();
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

//Veri akışı için gerekli olan paketleri ekleme
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));



app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Veritabanı bağlantı dosyasını ekleme
require("./src/config/database");


//Routelarımızın olduğu dosyayı ekleme
const Route = require("./src/routers/route");

//JWT token doğrulama endpointi
app.post('/verifyToken', (req, res) =>
{
  const { token } = req.body;
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) =>
  {
    if (err)
    {
      return res.status(401).json({ valid: false, message: 'Token is invalid' });
    }
    return res.status(200).json({ valid: true, decoded });
  });
});

//Routelara yönlendirme yapma
app.use("/", Route);

//Projeyi ayağa kaldırma
app.listen(process.env.PORT, () =>
{
  console.log(`Server is standing to ${process.env.PORT} port`);
});