const { docTitle, subTitle, plainParagraph, bullet, numberedBullets, ClauseBuilder, signatureBlock, baseDoc, Packer } = require("./docxHelpers");
const { formatBRL, currencyExtenso, formatDateLong, addDaysBusiness, formatCNPJorCPF } = require("./format");
const { FABRICA, qualificacaoFabrica } = require("./fabricaData");

/**
 * data = {
 *   clienteRazaoSocial, clienteTipoPessoa, clienteCnpjCpf, clienteEndereco,
 *   clienteRepresentante, clienteEmail, clienteTelefone,
 *   dataInicio (ISO, = data de assinatura), prazoDiasUteis (int),
 *   dataCaptacao (ISO, optional),
 *   descricaoProjeto (string),
 *   quantidadeVideos (int),
 *   temDesign (bool), quantidadeArtes (int),
 *   temSocialMedia (bool) -- entrega de social media pontual, opcional em avulso
 *   valorTotal (number), condicaoPagamento ('50-50'|'avista'|'personalizado'), condicaoPagamentoTexto (if personalizado),
 *   formaPagamento (string),
 *   responsavelFabrica (string)
 * }
 */
function buildAvulsoContract(data) {
  const dataInicioLong = formatDateLong(data.dataInicio);
  const dataEntregaLong = formatDateLong(addDaysBusiness(data.dataInicio, data.prazoDiasUteis));
  const valorTotalFmt = formatBRL(data.valorTotal);
  const responsavelFabrica = data.responsavelFabrica || FABRICA.socioNome;

  const clienteTipo = data.clienteTipoPessoa === "fisica" ? "pessoa física" : "pessoa jurídica de direito privado";
  const clienteDoc = data.clienteTipoPessoa === "fisica" ? "CPF" : "CNPJ";

  const children = [];
  children.push(docTitle("CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE PRODUÇÃO AUDIOVISUAL"));
  children.push(subTitle("Modelo Avulso — Projeto Único"));

  children.push(plainParagraph(
    `CONTRATANTE: ${data.clienteRazaoSocial}, ${clienteTipo}, inscrita no ${clienteDoc} sob nº ${formatCNPJorCPF(data.clienteCnpjCpf)}, com sede/domicílio em ${data.clienteEndereco}, neste ato representada por ${data.clienteRepresentante}, doravante denominada simplesmente CONTRATANTE, contato: ${data.clienteEmail}${data.clienteTelefone ? " / " + data.clienteTelefone : ""}.`
  ));
  children.push(plainParagraph(`CONTRATADA: ${qualificacaoFabrica}.`));
  children.push(plainParagraph(
    "As partes acima qualificadas, de comum acordo e na melhor forma de direito, resolvem celebrar o presente Contrato de Prestação de Serviços de Produção Audiovisual, referente a projeto único e determinado, que se regerá pelas cláusulas e condições abaixo estipuladas."
  ));

  const c = new ClauseBuilder();

  c.add("OBJETO", [
    `O presente contrato tem por objeto a prestação, pela CONTRATADA em favor da CONTRATANTE, de serviço de produção audiovisual consistente em: ${data.descricaoProjeto}.`,
    "O projeto será executado conforme briefing, referências e diretrizes alinhadas entre as partes previamente ao início da produção."
  ]);

  const entregaveis = [];
  entregaveis.push(`${data.quantidadeVideos} (${numeroPorExtenso(data.quantidadeVideos)}) vídeo(s) final(is), incluindo roteiro, captação, edição e finalização;`);
  if (data.temDesign) {
    entregaveis.push(`${data.quantidadeArtes} (${numeroPorExtenso(data.quantidadeArtes)}) arte(s) complementar(es);`);
  }
  if (data.temSocialMedia) {
    entregaveis.push("organização e adequação dos materiais entregues para publicação nas redes sociais indicadas pela CONTRATANTE, sem incluir gestão contínua de social media;");
  }
  entregaveis.push("até 2 (duas) rodadas de revisão sobre o material entregue, dentro do escopo aprovado no briefing inicial.");

  const escopoBodies = ["Constituem entregáveis deste projeto:"];
  escopoBodies.push(...numberedBullets(entregaveis));
  escopoBodies.push("Não estão incluídos neste escopo, salvo pactuação expressa e orçamento à parte: elenco/modelos, locação de espaços, figurino especial, cenografia, deslocamento para fora de Maringá/PR e região, hospedagem, alimentação de equipe externa, banco de imagens pagas, trilha sonora licenciada além do banco padrão da CONTRATADA, e impulsionamento/tráfego pago.");
  escopoBodies.push("Alterações que impliquem novo conceito, novo roteiro, nova gravação, nova direção criativa ou mudança substancial em relação ao briefing inicialmente aprovado serão consideradas serviço adicional, mediante novo orçamento e aprovação prévia da CONTRATANTE.");
  c.add("ESCOPO E ENTREGÁVEIS", escopoBodies);

  const prazoBodies = [
    `A CONTRATADA se compromete a entregar o(s) material(is) final(is) em até ${data.prazoDiasUteis} (${numeroPorExtenso(data.prazoDiasUteis)}) dias úteis, contados da assinatura deste contrato, com entrega estimada para ${dataEntregaLong}.`
  ];
  if (data.dataCaptacao) {
    prazoBodies.push(`O prazo de captação (gravação) está previsto para ${formatDateLong(data.dataCaptacao)}, podendo ser remarcado de comum acordo entre as partes conforme disponibilidade de agenda, locação e elenco envolvidos.`);
  }
  prazoBodies.push("Atrasos causados por falta de informações, aprovações ou materiais por parte da CONTRATANTE, ou por remarcação de captação a pedido da CONTRATANTE, prorrogam automaticamente o prazo de entrega na mesma proporção, sem caracterizar mora da CONTRATADA.");
  prazoBodies.push("A CONTRATANTE deverá aprovar ou solicitar ajustes no material entregue em até 3 (três) dias úteis após o recebimento; passado esse prazo sem manifestação, o material será considerado tacitamente aprovado.");
  c.add("PRAZO DE EXECUÇÃO E ENTREGA", prazoBodies);

  let condicaoTexto;
  if (data.condicaoPagamento === "avista") {
    condicaoTexto = `O pagamento será realizado integralmente (100%) no ato da assinatura deste contrato, no valor de R$ ${valorTotalFmt} (${currencyExtenso(data.valorTotal)}), como confirmação de agenda e início dos trabalhos.`;
  } else if (data.condicaoPagamento === "personalizado" && data.condicaoPagamentoTexto) {
    condicaoTexto = data.condicaoPagamentoTexto;
  } else {
    const metade = data.valorTotal / 2;
    condicaoTexto = `O pagamento será realizado da seguinte forma: 50% (cinquenta por cento) — R$ ${formatBRL(metade)} — no ato da assinatura deste contrato, como confirmação de agenda e início dos trabalhos; e 50% (cinquenta por cento) — R$ ${formatBRL(metade)} — na entrega do material final, antes da liberação dos arquivos em alta resolução.`;
  }

  c.add("VALOR E FORMA DE PAGAMENTO", [
    `Pela prestação do serviço descrito neste contrato, a CONTRATANTE pagará à CONTRATADA o valor total de R$ ${valorTotalFmt} (${currencyExtenso(data.valorTotal)}).`,
    condicaoTexto,
    `O pagamento será realizado via ${data.formaPagamento}${data.formaPagamento.toUpperCase().includes("PIX") ? `, para a chave PIX (CNPJ) da CONTRATADA: ${formatCNPJorCPF(FABRICA.pixChave)}` : ""}, salvo se outro meio for formalmente indicado pela CONTRATADA.`,
    "O atraso no pagamento acarretará multa moratória de 10% (dez por cento) sobre o valor em atraso, acrescida de juros de mora de 1% (um por cento) ao mês, calculados pro rata die, sem prejuízo da suspensão da produção ou da entrega até a regularização."
  ]);

  c.add("OBRIGAÇÕES DA CONTRATADA", [
    "5.1. São obrigações da CONTRATADA:",
    ...numberedBullets([
      "executar o serviço com diligência, técnica e padrão profissional compatível com o mercado de produção audiovisual;",
      "produzir o material conforme briefing e escopo acordados;",
      "manter sigilo sobre informações estratégicas e materiais não publicados da CONTRATANTE;",
      "comunicar prontamente eventuais impedimentos técnicos, climáticos ou de agenda que possam impactar o prazo."
    ])
  ]);

  c.add("OBRIGAÇÕES DA CONTRATANTE", [
    "6.1. São obrigações da CONTRATANTE:",
    ...numberedBullets([
      "fornecer informações, materiais, acessos, logotipos e referências necessárias em prazo hábil;",
      "aprovar ou solicitar ajustes no prazo previsto na cláusula de prazo de execução;",
      "efetuar os pagamentos nos valores e prazos previstos;",
      "garantir que informações, promessas comerciais e dados fornecidos para o material sejam verdadeiros, lícitos e autorizados;",
      "obter e disponibilizar à CONTRATADA as autorizações de uso de imagem e voz de colaboradores, representantes ou terceiros por ela indicados que venham a figurar no material. Caso o elenco/modelos sejam contratados diretamente pela CONTRATADA a pedido da CONTRATANTE, a obtenção dessa autorização caberá à CONTRATADA, com custo já incluído no orçamento do respectivo talento."
    ])
  ]);

  c.add("CANCELAMENTO", [
    "7.1. Em caso de cancelamento do projeto pela CONTRATANTE após a assinatura deste contrato e o pagamento do sinal ou valor inicial, o valor já pago não será restituído, a título de reserva de agenda e custos já incorridos.",
    "7.2. Caso o cancelamento ocorra após o início efetivo da captação ou produção, será devido, adicionalmente, o valor proporcional aos serviços já executados até a data do cancelamento, calculado com base nas etapas efetivamente concluídas.",
    "7.3. Em caso de cancelamento pela CONTRATADA por motivo não imputável à CONTRATANTE, os valores já pagos serão integralmente restituídos em até 10 (dez) dias úteis.",
    "7.4. Remarcações de captação solicitadas pela CONTRATANTE com menos de 48 (quarenta e oito) horas de antecedência poderão ensejar cobrança de taxa de remarcação, a ser informada previamente pela CONTRATADA, referente a custos de equipe e agenda já reservados."
  ]);

  c.add("DIREITOS AUTORAIS, USO DOS MATERIAIS, PORTFÓLIO E IMAGEM DE TERCEIROS", [
    "8.1. Após a quitação integral do valor devido, os direitos patrimoniais de uso do material final produzido serão cedidos à CONTRATANTE, para utilização em seus canais digitais, campanhas, apresentações e materiais institucionais.",
    "8.2. A CONTRATADA poderá utilizar trechos, imagens, frames e o material produzido para fins de portfólio, divulgação institucional e apresentação comercial de seus serviços, desde que tal uso não cause prejuízo à imagem ou reputação da CONTRATANTE. A CONTRATANTE poderá, mediante comunicação por escrito, solicitar que o material não seja utilizado para esse fim, devendo a CONTRATADA atender à solicitação em prazo razoável.",
    "8.3. Arquivos brutos, projetos editáveis e arquivos-fonte somente serão entregues mediante previsão expressa em proposta comercial ou ajuste específico por escrito, podendo implicar custo adicional.",
    "8.4. A responsabilidade pela obtenção da autorização de uso de imagem e voz de pessoas físicas que figurem no material segue o disposto na cláusula 6.1(v)."
  ]);

  c.add("CONFIDENCIALIDADE E PROTEÇÃO DE DADOS", [
    "9.1. As partes obrigam-se a manter sigilo sobre informações, dados, materiais internos e bastidores a que tiverem acesso em razão deste contrato, pelo prazo de 3 (três) anos após a entrega final.",
    "9.2. Eventuais dados pessoais compartilhados para a execução deste projeto serão tratados exclusivamente para essa finalidade, em conformidade com a Lei nº 13.709/2018 (LGPD), sendo eliminados ou devolvidos ao final do projeto mediante solicitação da CONTRATANTE, salvo obrigação legal de retenção."
  ]);

  c.add("CASO FORTUITO E FORÇA MAIOR", [
    "10.1. Nenhuma das partes será responsabilizada por atraso decorrente de caso fortuito ou força maior, incluindo condições climáticas que impeçam captação externa agendada, problemas de saúde da equipe, ou determinações governamentais supervenientes, devendo a parte impedida comunicar a outra por escrito e propor nova data tão logo possível."
  ]);

  c.add("INEXISTÊNCIA DE VÍNCULO", [
    "11.1. O presente contrato possui natureza estritamente comercial, não gerando vínculo trabalhista, societário, de representação ou parceria entre as partes."
  ]);

  c.add("DISPOSIÇÕES GERAIS", [
    "12.1. Qualquer alteração de escopo, prazo, valor ou obrigação deverá ser formalizada por escrito entre as partes.",
    "12.2. As partes reconhecem a validade da assinatura eletrônica ou digital deste instrumento, dispensando-se reconhecimento de firma, salvo solicitação expressa de uma das partes.",
    "12.3. Este instrumento representa o entendimento integral entre as partes quanto ao seu objeto, substituindo entendimentos, propostas ou tratativas verbais anteriores sobre a mesma matéria."
  ]);

  c.add("RESOLUÇÃO DE CONFLITOS E FORO", [
    "13.1. As partes buscarão, previamente a qualquer medida judicial, a resolução amigável de eventuais controvérsias por negociação direta.",
    `13.2. Não havendo composição amigável, fica eleito o foro da Comarca de ${FABRICA.cidade} para dirimir quaisquer controvérsias oriundas deste contrato, com renúncia a qualquer outro, por mais privilegiado que seja.`
  ]);

  children.push(...c.get());
  children.push(...signatureBlock(
    `${FABRICA.cidade}, ${dataInicioLong}.`,
    data.clienteRazaoSocial,
    "CONTRATANTE",
    `${responsavelFabrica}`,
    "CONTRATADA — FÁBRICA DE IDEIAS ACADEMY LTDA.",
    `CPF ${FABRICA.socioCpfFormatado}`
  ));

  return baseDoc(children);
}

const EXTENSO_MAP = ["zero","um","dois","três","quatro","cinco","seis","sete","oito","nove","dez","onze","doze","treze","catorze","quinze","dezesseis","dezessete","dezoito","dezenove","vinte"];
function numeroPorExtenso(n) {
  const num = Number(n);
  if (num >= 0 && num <= 20) return EXTENSO_MAP[num];
  if (num > 20 && num < 30) return `vinte e ${EXTENSO_MAP[num - 20]}`;
  if (num === 30) return "trinta";
  return String(num);
}

async function generateAvulsoBuffer(data) {
  const doc = buildAvulsoContract(data);
  return Packer.toBuffer(doc);
}

module.exports = { buildAvulsoContract, generateAvulsoBuffer };
