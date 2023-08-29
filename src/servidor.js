const express = require('express');
const rotas = require('./rotas');
const cors = require('cors');

const app = express();
app.use(
  cors({
    origin: '*', // Substitua pelo URL do site específico
  }),
);
app.use(express.json());
app.use(rotas);

module.exports = app;
