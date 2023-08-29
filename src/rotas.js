const express = require('express');
const contas = require('./controladores/contas.js');
const app = express();

app.get('/contas', contas.listarContas);
app.post('/contas', contas.criarConta);
app.put('/contas/:numero/usuario', contas.atualizarConta);
app.delete('/contas/:numero', contas.deletarConta);
app.get('/contas/saldo', contas.saldoConta);
app.get('/contas/extrato', contas.extratoConta);

app.post('/transacoes/depositar', contas.depositarConta);
app.post('/transacoes/sacar', contas.sacarConta);
app.post('/transacoes/transferir', contas.transferirConta);

module.exports = app;