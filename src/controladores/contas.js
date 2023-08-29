const { banco } = require('../bancodedados');
let { contas } = require('../bancodedados');
const bancoDeDados = require('../bancodedados');
const { format } = require('date-fns');

let numeroConta = contas.length;

const listarContas = (req, res) => {
  const { senha_banco } = req.query;

  if (senha_banco === banco.senha) {
    return res.status(200).json({ contas });
  }
  return res.status(404).json({ mensagem: 'Nenhuma conta encontrada!' });
}

const criarConta = (req, res) => {
  const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;
  if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
    return res.status(404).json({ mensagem: 'Preencha todos os campos!' });
  }

  const buscarCpf = contas.find(conta => conta.usuario.cpf === req.body.cpf);

  if (buscarCpf) {
    return res.status(400).json({ mensagem: "CPF já existente!" });
  }

  const buscarEmail = contas.find(conta => conta.usuario.email === req.body.email);

  if (buscarEmail) {
    return res.status(400).json({ mensagem: "E-mail já existente!" });
  }

  numeroConta++

  const conta = {
    numero: String(numeroConta),
    saldo: 0,
    usuario: {
      nome,
      cpf,
      data_nascimento,
      telefone,
      email,
      senha
    }
  }

  contas.push(conta);

  return res.status(201).json({ message: "Conta criada com sucesso!" });
}

const atualizarConta = (req, res) => {
  const { numero } = req.params;
  const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

  if (!nome && !cpf && !data_nascimento && !telefone && !email && !senha) {
    return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios!' });
  }

  const verificarConta = contas.find((e) => {
    return e.numero === String(numero);
  });

  if (!verificarConta) {
    return res.status(404).json({ mensagem: 'Nenhuma conta encontrada!' });
  }

  verificarConta.usuario.nome = nome ?? verificarConta.nome;
  verificarConta.usuario.cpf = cpf ?? verificarConta.cpf;
  verificarConta.usuario.data_nascimento = data_nascimento ?? verificarConta.data_nascimento;
  verificarConta.usuario.telefone = telefone ?? verificarConta.telefone;
  verificarConta.usuario.email = email ?? verificarConta.email;
  verificarConta.usuario.senha = senha ?? verificarConta.senha;

  return res.status(200).json({ mensagem: "Conta atualizada com sucesso!" });
}

const deletarConta = (req, res) => {
  const { numero } = req.params

  const verificarConta = contas.find((e) => {
    return e.numero === numero;
  });

  if (!verificarConta) {
    return res.status(404).json({ mensagem: 'Nenhuma conta encontrada!' });
  }

  if (verificarConta.saldo !== 0) {
    return res.status(400).json({ mensagem: "Conta com saldo, não pode ser excluida!" });
  }

  contas = contas.filter((conta) => {
    return conta.numero !== numero;
  })

  if (verificarConta.saldo === 0) {
    return res.status(200).json({ mensagem: "Conta excluida com sucesso!" });
  }

}

const depositarConta = (req, res) => {
  const { numero_conta, valor } = req.body;
  const verificarConta = contas.find((e) => {
    return e.numero === numero_conta;
  });

  if (!numero_conta) {
    return res.status(404).json({ mensagem: 'Informe uma conta para deposito!' });
  }

  if (!valor) {
    return res.status(404).json({ mensagem: 'Informe um valor para deposito!' });
  }

  if (!verificarConta) {
    return res.status(404).json({ mensagem: 'Nenhuma conta encontrada!' });
  }

  if (valor === 0 || valor < 0) {
    return res.status(404).json({ mensagem: 'Não é permitido depositar valores menores e iguais a zero!' });
  }

  verificarConta.saldo += valor;

  bancoDeDados.depositos.unshift({
    data: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    numero_conta,
    valor
  });

  return res.status(200).json({ mensagem: "Depósito realizado com sucesso!" });
}

const sacarConta = (req, res) => {
  const { numero_conta, valor, senha } = req.body;
  const verificarConta = contas.find((e) => {
    return e.numero === numero_conta;
  });

  if (!numero_conta) {
    return res.status(400).json({ mensagem: 'Informe um numero de conta!' });
  }

  if (!valor) {
    return res.status(400).json({ mensagem: 'Informe um valor para saque!' });
  }

  if (!senha) {
    return res.status(400).json({ mensagem: 'Informe uma senha correta!' });
  }

  if (!verificarConta) {
    return res.status(404).json({ mensagem: 'Nenhuma conta encontrada!' });
  }
  if (verificarConta.usuario.senha !== senha) {
    return res.status(400).json({ mensagem: 'Informe uma senha correta!' });
  }

  if (verificarConta.saldo < valor) {
    return res.status(400).json({ mensagem: 'Saldo insuficiente para saque!' });
  }

  verificarConta.saldo -= valor;

  bancoDeDados.saques.unshift({
    data: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    numero_conta,
    valor
  });

  return res.status(200).json({ mensagem: 'Saque realizado com sucesso!' });
}

const transferirConta = (req, res) => {
  const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;
  const contaOrigem = contas.find((e) => {
    return e.numero === numero_conta_origem;
  });
  const contaDestino = contas.find((e) => {
    return e.numero === numero_conta_destino;
  });

  if (!numero_conta_origem) {
    return res.status(404).json({ mensagem: 'Informe um numero de conta de origem!' });
  }

  if (!numero_conta_destino) {
    return res.status(404).json({ mensagem: 'Informe um numero de conta de destino!' });
  }

  if (contaOrigem.usuario.senha !== senha) {
    return res.status(404).json({ mensagem: 'Informe a senha correta!' });
  }

  if (!valor) {
    return res.status(404).json({ mensagem: 'Informe um valor para saque!' });
  }

  if (!senha) {
    return res.status(404).json({ mensagem: 'Informe uma senha!' });
  }

  if (!contaOrigem || !contaDestino) {
    return res.status(404).json({ mensagem: 'Informe as duas contas para a transferencia!' });
  }

  if (contaOrigem.saldo < valor) {
    return res.status(400).json({ mensagem: 'Saldo insuficiente para transferencia!' });
  }

  contaOrigem.saldo -= valor;
  contaDestino.saldo += valor;

  bancoDeDados.transferencias.unshift({
    data: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    numero_conta_origem,
    numero_conta_destino,
    valor
  });

  return res.status(200).json({ mensagem: 'Transferência realizada com sucesso' });
}

const saldoConta = (req, res) => {
  const { numero_conta, senha } = req.query;
  const verificarConta = contas.find((e) => {
    return e.numero === numero_conta;
  });

  if (!numero_conta) {
    return res.status(400).json({ mensagem: 'Informe o número da conta!' });
  }

  if (!senha) {
    return res.status(400).json({ mensagem: 'Informe a senha existente!' });
  }

  if (!verificarConta) {
    return res.status(404).json({ mensagem: 'Nenhuma conta encontrada!' });
  }

  if (verificarConta.usuario.senha !== senha) {
    return res.status(404).json({ mensagem: 'Senha incorreta!' });
  }

  return res.status(200).json({ mensagem: `Saldo: ${verificarConta.saldo}` });
}

const extratoConta = (req, res) => {
  const { numero_conta, senha } = req.query;
  const verificarConta = contas.find((e) => {
    return e.numero === numero_conta;
  });

  if (!numero_conta) {
    return res.status(400).json({ mensagem: 'Informe o número da conta!' });
  }

  if (!senha) {
    return res.status(400).json({ mensagem: 'Informe a senha existente!' });
  }

  if (!verificarConta) {
    return res.status(404).json({ mensagem: 'Nenhuma conta encontrada!' });
  }

  if (verificarConta.usuario.senha !== senha) {
    return res.status(404).json({ mensagem: 'Senha incorreta!' });
  }

  const depositos = bancoDeDados.depositos.filter((e) => {
    return e.numero_conta === String(numero_conta);
  })
  const saques = bancoDeDados.saques.filter((e) => {
    return e.numero_conta === String(numero_conta);
  })
  const transferenciasEnviadas = bancoDeDados.transferencias.filter((e) => {
    return e.numero_conta_origem === String(numero_conta);
  })
  const transferenciasRecebidas = bancoDeDados.transferencias.filter((e) => {
    return e.numero_conta_destino === String(numero_conta);
  })

  return res.status(200).json({ depositos, saques, transferenciasEnviadas, transferenciasRecebidas });
}

module.exports = {
  listarContas,
  criarConta,
  atualizarConta,
  deletarConta,
  depositarConta,
  sacarConta,
  transferirConta,
  saldoConta,
  extratoConta
}