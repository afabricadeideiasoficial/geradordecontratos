const { formatCNPJorCPF } = require("./format");

const FABRICA = {
  razaoSocial: "FÁBRICA DE IDEIAS ACADEMY LTDA.",
  cnpj: "58543345000171",
  cnpjFormatado: formatCNPJorCPF("58543345000171"),
  endereco: "Rua Marcelino Venâncio, nº 181, Loteamento Alto da Boa Vista, Maringá - PR, CEP 87083-069",
  cidade: "Maringá - PR",
  socioNome: "Miguel Candido Filho",
  socioCpf: "10128389940",
  socioCpfFormatado: formatCNPJorCPF("10128389940"),
  email: "contato@fabricadeideiasacademy.com",
  telefone: "(44) 99180-0104",
  pixChave: "58543345000171", // chave PIX = CNPJ, conforme padrão já usado nos contratos anteriores
};

const qualificacaoFabrica = `${FABRICA.razaoSocial}, pessoa jurídica de direito privado, inscrita no CNPJ sob nº ${FABRICA.cnpjFormatado}, com sede na ${FABRICA.endereco}, doravante denominada simplesmente CONTRATADA`;

module.exports = { FABRICA, qualificacaoFabrica };
