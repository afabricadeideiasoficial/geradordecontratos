const { docTitle, subTitle, plainParagraph, bullet, numberedBullets, ClauseBuilder, signatureBlock, baseDoc, Packer } = require("./docxHelpers");
const { formatBRL, currencyExtenso, formatDateLong, addMonths, formatCNPJorCPF } = require("./format");
const { FABRICA, qualificacaoFabrica } = require("./fabricaData");

/**
 * data = {
 *   clienteRazaoSocial, clienteTipoPessoa ('juridica'|'fisica'), clienteCnpjCpf, clienteEndereco,
 *   clienteRepresentante, clienteEmail, clienteTelefone,
 *   dataInicio (ISO), duracaoMeses (int),
 *   quantidadeVideos (int),
 *   temDesign (bool), quantidadeArtes (int),
 *   temSocialMedia (bool),
 *   temConsultoria (bool), reunioesMensais (int),
 *   valorMensal (number), diaVencimento (int 1-31), formaPagamento (string),
 *   percentualMultaIntermediaria (number, default 50),
 *   responsavelFabrica (string, default Miguel Candido Filho)
 * }
 */
function buildAgenciaContract(data) {
  const dataInicioLong = formatDateLong(data.dataInicio);
  const dataTermino = addMonths(data.dataInicio, data.duracaoMeses);
  const dataTerminoLong = formatDateLong(dataTermino);
  const valorMensalFmt = formatBRL(data.valorMensal);
  const valorTotal = Number(data.valorMensal) * Number(data.duracaoMeses);
  const valorTotalFmt = formatBRL(valorTotal);
  const responsavelFabrica = data.responsavelFabrica || FABRICA.socioNome;
  const multaIntermediaria = data.percentualMultaIntermediaria || 50;

  const clienteTipo = data.clienteTipoPessoa === "fisica" ? "pessoa física" : "pessoa jurídica de direito privado";
  const clienteDoc = data.clienteTipoPessoa === "fisica" ? "CPF" : "CNPJ";

  const children = [];
  children.push(docTitle("CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE MARKETING DIGITAL E PRODUÇÃO AUDIOVISUAL"));
  children.push(subTitle("Modelo Agência — Prestação Recorrente"));

  children.push(plainParagraph(
    `CONTRATANTE: ${data.clienteRazaoSocial}, ${clienteTipo}, inscrita no ${clienteDoc} sob nº ${formatCNPJorCPF(data.clienteCnpjCpf)}, com sede/domicílio em ${data.clienteEndereco}, neste ato representada por ${data.clienteRepresentante}, doravante denominada simplesmente CONTRATANTE, contato: ${data.clienteEmail}${data.clienteTelefone ? " / " + data.clienteTelefone : ""}.`
  ));
  children.push(plainParagraph(`CONTRATADA: ${qualificacaoFabrica}.`));
  children.push(plainParagraph(
    "As partes acima qualificadas, de comum acordo e na melhor forma de direito, resolvem celebrar o presente Contrato de Prestação de Serviços de Marketing Digital e Produção Audiovisual, que se regerá pelas cláusulas e condições abaixo estipuladas."
  ));

  const c = new ClauseBuilder();

  c.add("OBJETO", [
    "1.1. O presente contrato tem por objeto a prestação, pela CONTRATADA em favor da CONTRATANTE, de serviços recorrentes de marketing digital e produção audiovisual, voltados à criação, organização e fortalecimento da presença digital da CONTRATANTE.",
    "1.2. Os serviços serão prestados de acordo com as estratégias definidas entre as partes, considerando objetivos de comunicação, identidade visual, posicionamento de marca e necessidades comerciais da CONTRATANTE."
  ]);

  // ---- Escopo (dinâmico) ----
  const escopoItens = [];
  escopoItens.push(`produção de ${data.quantidadeVideos} (${numeroPorExtenso(data.quantidadeVideos)}) vídeo(s) mensal(is), incluindo captação, edição, finalização e adequação para uso em redes sociais;`);
  if (data.temDesign) {
    escopoItens.push(`criação de ${data.quantidadeArtes} (${numeroPorExtenso(data.quantidadeArtes)}) arte(s) mensal(is), destinadas à comunicação visual da CONTRATANTE nas plataformas digitais;`);
  }
  if (data.temSocialMedia) {
    escopoItens.push("serviço de social media, contemplando organização, programação e/ou publicação dos materiais produzidos nas redes sociais da CONTRATANTE;");
  }
  if (data.temConsultoria) {
    const nReunioes = data.reunioesMensais || 1;
    escopoItens.push(`suporte estratégico limitado a: definição de pauta e calendário de conteúdo, orientação de posicionamento de marca nas peças produzidas e reuniões mensais de alinhamento em quantidade de até ${nReunioes} (${numeroPorExtenso(nReunioes)}) por mês. Não inclui consultoria de marketing ampla, gestão de tráfego pago ou planejamento de mídia.`);
  }
  const escopoBodies = ["2.1. Durante a vigência deste contrato, a CONTRATADA se compromete a entregar, mensalmente, os seguintes serviços e materiais:"];
  escopoBodies.push(...numberedBullets(escopoItens));
  escopoBodies.push("2.2. Não estão incluídos no escopo deste contrato serviços não expressamente previstos, tais como impulsionamento/tráfego pago, contratação de modelos, atores ou influenciadores, locação de espaços, compra de banco de imagens, despesas com deslocamento, alimentação, hospedagem ou quaisquer custos de terceiros, salvo se pactuados por escrito entre as partes.");
  escopoBodies.push("2.3. A execução dos serviços será realizada pela equipe interna da CONTRATADA, sendo vedada a subcontratação total ou parcial sem autorização prévia e por escrito da CONTRATANTE.");
  c.add("ESCOPO E ENTREGAS MENSAIS", escopoBodies);

  c.add("PRAZO DE VIGÊNCIA", [
    `3.1. O presente contrato terá vigência de ${data.duracaoMeses} (${numeroPorExtenso(data.duracaoMeses)}) meses, iniciando-se em ${dataInicioLong} e encerrando-se em ${dataTerminoLong}.`,
    "3.2. A continuidade da prestação dos serviços após o término da vigência dependerá de renovação expressa entre as partes, por escrito, podendo ser formalizada por e-mail, mensagem eletrônica, aditivo contratual ou novo instrumento.",
    "3.3. Em caso de renovação por período igual ou superior a 12 (doze) meses, o valor mensal previsto na Cláusula 4 poderá ser reajustado, mediante acordo entre as partes, com base na variação acumulada do IGP-M/FGV (ou índice que vier a substituí-lo) no período, ou em novo valor livremente pactuado por escrito."
  ]);

  c.add("VALOR E FORMA DE PAGAMENTO", [
    `4.1. Pela prestação dos serviços descritos neste contrato, a CONTRATANTE pagará à CONTRATADA o valor mensal de R$ ${valorMensalFmt} (${currencyExtenso(data.valorMensal)}), totalizando, ao final do período de ${data.duracaoMeses} meses, o valor de R$ ${valorTotalFmt} (${currencyExtenso(valorTotal)}), caso o contrato seja cumprido em sua integralidade.`,
    `4.2. O pagamento será realizado mensalmente via ${data.formaPagamento}, com vencimento todo dia ${data.diaVencimento} de cada mês${data.formaPagamento.toUpperCase().includes("PIX") ? `, para a chave PIX (CNPJ) da CONTRATADA: ${formatCNPJorCPF(FABRICA.pixChave)}` : ""}, salvo se outro meio de pagamento for formalmente indicado pela CONTRATADA.`,
    `4.3. O primeiro pagamento será devido na data de assinatura deste contrato (${dataInicioLong}). Os pagamentos subsequentes deverão ocorrer na mesma data de referência dos meses seguintes, salvo ajuste diverso por escrito entre as partes.`,
    "4.4. O atraso no pagamento acarretará multa moratória de 10% (dez por cento) sobre o valor em atraso, acrescida de juros de mora de 1% (um por cento) ao mês, calculados pro rata die, sem prejuízo da suspensão dos serviços até a regularização do pagamento."
  ]);

  c.add("PRAZOS, APROVAÇÕES E REVISÕES", [
    "5.1. Os prazos de entrega dos materiais serão definidos conforme calendário mensal de produção, considerando disponibilidade de informações, aprovações, materiais da CONTRATANTE e agenda de captação, quando aplicável.",
    "5.2. A CONTRATANTE deverá enviar informações, referências, aprovações e solicitações de ajustes em prazo razoável, preferencialmente em até 3 (três) dias úteis após o recebimento de cada material, para evitar impacto no cronograma.",
    "5.3. Estão incluídas até 2 (duas) rodadas de revisão por material entregue, desde que as solicitações estejam dentro do escopo inicialmente aprovado. Alterações que impliquem novo conceito, novo roteiro, nova gravação, nova direção criativa ou mudança substancial do conteúdo poderão ser consideradas serviço extra, mediante orçamento e aprovação prévia da CONTRATANTE.",
    "5.4. A CONTRATADA se compromete a entregar as revisões solicitadas dentro do escopo em até 3 (três) dias úteis a contar do recebimento do pedido, salvo prazo diverso combinado entre as partes em razão da complexidade da alteração."
  ]);

  c.add("OBRIGAÇÕES DA CONTRATADA", [
    "6.1. São obrigações da CONTRATADA:",
    ...numberedBullets([
      "executar os serviços com diligência, técnica e padrão profissional compatível com o mercado de marketing digital e produção audiovisual;",
      "produzir os materiais conforme escopo contratado e orientações estratégicas alinhadas entre as partes;",
      "organizar o fluxo de produção, edição e aprovação dos conteúdos dentro do cronograma possível;",
      "manter sigilo sobre informações estratégicas, dados internos, bastidores e materiais não publicados da CONTRATANTE;",
      "comunicar a CONTRATANTE sobre eventuais impedimentos, necessidades de aprovação ou informações pendentes que possam impactar a entrega."
    ])
  ]);

  c.add("OBRIGAÇÕES DA CONTRATANTE", [
    "7.1. São obrigações da CONTRATANTE:",
    ...numberedBullets([
      "fornecer à CONTRATADA todas as informações, acessos, arquivos, logotipos, materiais institucionais, referências e orientações necessárias à execução dos serviços;",
      "aprovar ou solicitar ajustes nos materiais em prazo razoável, evitando atrasos no calendário de entregas;",
      "efetuar os pagamentos nos valores e prazos previstos neste contrato;",
      "garantir que as informações, promessas comerciais, dados e alegações fornecidas para criação dos conteúdos sejam verdadeiras, lícitas e autorizadas;",
      "responsabilizar-se por eventuais impulsionamentos, verbas de mídia, custos de terceiros, ferramentas pagas e despesas externas não incluídas neste contrato;",
      "obter e disponibilizar à CONTRATADA, quando aplicável, as autorizações de uso de imagem e voz de colaboradores, representantes ou terceiros indicados pela CONTRATANTE que venham a figurar nos materiais produzidos, conforme detalhado adiante."
    ])
  ]);

  if (data.temSocialMedia) {
    c.add("SOCIAL MEDIA E PUBLICAÇÕES", [
      "O serviço de social media compreende a organização e publicação dos materiais produzidos, dentro do calendário definido entre as partes, nas redes sociais indicadas pela CONTRATANTE.",
      "A CONTRATADA não garante resultados específicos de alcance, engajamento, crescimento de seguidores, conversões, vendas ou métricas similares, uma vez que tais resultados dependem de fatores externos, como algoritmo das plataformas, comportamento do público, investimento em mídia, oferta comercial e atuação da própria CONTRATANTE.",
      "A CONTRATANTE deverá disponibilizar acessos às contas e plataformas necessárias à publicação, quando aplicável, responsabilizando-se pela segurança, permissões e integridade dos acessos fornecidos."
    ]);
  }

  // número da cláusula de direitos autorais é dinâmico (depende se tem social media)
  // mas o ClauseBuilder já cuida da numeração — só precisamos numerar os subcabeçalhos manualmente
  // por isso usamos uma função auxiliar que sabe o número atual da cláusula
  const nDireitos = data.temSocialMedia ? 9 : 8;
  const nConf = nDireitos + 1;
  const nLgpd = nConf + 1;
  const nForca = nLgpd + 1;
  const nRescisao = nForca + 1;
  const nVinculo = nRescisao + 1;
  const nGeral = nVinculo + 1;
  const nForo = nGeral + 1;

  if (data.temSocialMedia) {
    c.add("SOCIAL MEDIA E PUBLICAÇÕES", [
      "8.1. O serviço de social media compreende a organização e publicação dos materiais produzidos, dentro do calendário definido entre as partes, nas redes sociais indicadas pela CONTRATANTE.",
      "8.2. A CONTRATADA não garante resultados específicos de alcance, engajamento, crescimento de seguidores, conversões, vendas ou métricas similares, uma vez que tais resultados dependem de fatores externos, como algoritmo das plataformas, comportamento do público, investimento em mídia, oferta comercial e atuação da própria CONTRATANTE.",
      "8.3. A CONTRATANTE deverá disponibilizar acessos às contas e plataformas necessárias à publicação, quando aplicável, responsabilizando-se pela segurança, permissões e integridade dos acessos fornecidos."
    ]);
  }

  c.add("DIREITOS AUTORAIS, USO DOS MATERIAIS, PORTFÓLIO E IMAGEM DE TERCEIROS", [
    `${nDireitos}.1. Após a quitação integral dos valores devidos, os direitos patrimoniais de uso dos materiais finais produzidos no âmbito deste contrato serão cedidos à CONTRATANTE, para utilização em seus canais digitais, campanhas, apresentações e materiais institucionais.`,
    `${nDireitos}.2. A CONTRATADA poderá utilizar trechos, imagens, frames e materiais produzidos para fins de portfólio, divulgação institucional e apresentação comercial de seus serviços, desde que tal uso não cause prejuízo à imagem ou reputação da CONTRATANTE. A CONTRATANTE poderá, mediante comunicação por escrito, solicitar que determinado material não seja utilizado para esse fim, devendo a CONTRATADA atender à solicitação em prazo razoável.`,
    `${nDireitos}.3. Materiais brutos, arquivos editáveis, projetos abertos e arquivos-fonte somente serão entregues se houver previsão expressa em proposta comercial ou ajuste específico por escrito.`,
    `${nDireitos}.4. A responsabilidade pela obtenção da autorização de uso de imagem e voz de pessoas físicas que figurem nos materiais audiovisuais (atores, modelos, apresentadores, colaboradores ou representantes) será definida por projeto, conforme indicação expressa entre as partes no briefing correspondente. Na ausência de indicação expressa: (i) caberá à CONTRATANTE obter a autorização de colaboradores, sócios, representantes ou terceiros por ela indicados; (ii) caberá à CONTRATADA obter a autorização de talentos, modelos ou atores por ela diretamente contratados para a produção.`
  ]);

  c.add("CONFIDENCIALIDADE", [
    `${nConf}.1. As partes obrigam-se a manter absoluto sigilo sobre todas as informações, dados, estratégias, materiais internos, bastidores, processos, campanhas, acessos, documentos, planejamentos e quaisquer informações não públicas a que tiverem acesso em razão deste contrato.`,
    `${nConf}.2. A obrigação de sigilo permanecerá válida durante a vigência contratual e pelo prazo de 5 (cinco) anos após seu término, independentemente do motivo de encerramento.`,
    `${nConf}.3. O descumprimento desta cláusula sujeitará a parte infratora à apuração de perdas e danos, sem prejuízo das medidas judiciais cabíveis.`
  ]);

  c.add("PROTEÇÃO DE DADOS PESSOAIS (LGPD)", [
    `${nLgpd}.1. As partes se comprometem a tratar quaisquer dados pessoais a que tenham acesso em decorrência deste contrato em conformidade com a Lei nº 13.709/2018 (LGPD), utilizando-os exclusivamente para as finalidades relacionadas à execução dos serviços aqui previstos.`,
    `${nLgpd}.2. Para os fins deste contrato, a CONTRATANTE figura como controladora dos dados pessoais de sua base de clientes, leads e colaboradores eventualmente compartilhados, e a CONTRATADA figura como operadora, devendo tratar tais dados estritamente conforme as instruções da CONTRATANTE e as finalidades pactuadas.`,
    `${nLgpd}.3. Ao término do contrato, a CONTRATADA deverá, mediante solicitação da CONTRATANTE, eliminar ou devolver os dados pessoais tratados em razão deste contrato, salvo obrigação legal de retenção.`
  ]);

  c.add("CASO FORTUITO E FORÇA MAIOR", [
    `${nForca}.1. Nenhuma das partes será responsabilizada por atraso ou não cumprimento de obrigações decorrentes de caso fortuito ou força maior, incluindo condições climáticas que impeçam captação externa previamente agendada, problemas de saúde da equipe envolvida na execução, falhas generalizadas de conectividade/infraestrutura, ou determinações governamentais supervenientes.`,
    `${nForca}.2. A parte impedida deverá comunicar a outra por escrito, tão logo possível, informando a natureza do impedimento e a nova estimativa de prazo, sem que isso configure inadimplemento contratual.`
  ]);

  c.add("RESCISÃO E CANCELAMENTO", [
    `${nRescisao}.1. O presente contrato poderá ser rescindido por qualquer das partes, sem necessidade de justa causa, mediante aviso prévio por escrito com antecedência mínima de 30 (trinta) dias.`,
    `${nRescisao}.2. Em caso de rescisão por descumprimento contratual (justa causa) por qualquer das partes, o contrato poderá ser encerrado imediatamente mediante notificação por escrito, apontando a infração cometida.`,
    `${nRescisao}.3. Regra de cancelamento antecipado pela CONTRATANTE, aplicável exclusivamente aos casos de rescisão sem justa causa e observado o aviso prévio da cláusula anterior:`,
    bullet(`(i) Cancelamento solicitado ANTES de completar 3 (três) meses de vigência: será devida multa correspondente a 100% (cem por cento) do saldo remanescente até o completar do 3º (terceiro) mês contratual, além dos valores já executados até a data do cancelamento;`),
    bullet(`(ii) Cancelamento solicitado A PARTIR de 3 (três) meses e ANTES de completar 6 (seis) meses de vigência: será devida multa correspondente a ${multaIntermediaria}% (${numeroPorExtenso(multaIntermediaria)} por cento) do valor mensal vigente, além dos valores já executados até a data do cancelamento;`),
    bullet("(iii) Cancelamento solicitado A PARTIR de 6 (seis) meses de vigência: não haverá incidência de multa, sendo devidos apenas os valores referentes aos serviços já executados até a data efetiva de encerramento."),
    `${nRescisao}.4. Em caso de rescisão sem justa causa pela CONTRATADA durante a vigência, e observado o aviso prévio, a CONTRATADA deverá concluir as entregas já iniciadas e em andamento no mês vigente, sem custo adicional para a CONTRATANTE, ressalvados novos escopos ainda não iniciados.`
  ]);

  c.add("INEXISTÊNCIA DE VÍNCULO", [
    `${nVinculo}.1. O presente contrato possui natureza estritamente comercial, não gerando vínculo trabalhista, societário, de representação, parceria, franquia ou exclusividade entre as partes, sendo cada uma responsável por seus funcionários, colaboradores, prestadores e encargos.`
  ]);

  c.add("DISPOSIÇÕES GERAIS", [
    `${nGeral}.1. Qualquer alteração de escopo, quantidade de entregas, prazo, valor ou obrigação deverá ser formalizada por escrito entre as partes.`,
    `${nGeral}.2. A eventual tolerância de uma parte quanto ao descumprimento de qualquer obrigação não constituirá novação, renúncia ou alteração contratual.`,
    `${nGeral}.3. As partes reconhecem a validade da assinatura eletrônica ou digital do presente instrumento, dispensando-se reconhecimento de firma, salvo se expressamente solicitado por uma das partes.`,
    `${nGeral}.4. Este instrumento representa o entendimento integral entre as partes quanto ao seu objeto, substituindo quaisquer entendimentos, propostas, e-mails ou tratativas verbais anteriores sobre a mesma matéria, ressalvados aditivos formalizados por escrito após sua assinatura.`,
    `${nGeral}.5. Se qualquer disposição deste contrato for considerada nula ou inexequível, as demais disposições permanecerão em pleno vigor e efeito.`
  ]);

  c.add("RESOLUÇÃO DE CONFLITOS E FORO", [
    `${nForo}.1. As partes se comprometem a buscar, previamente a qualquer medida judicial, a resolução amigável de eventuais controvérsias decorrentes deste contrato, por meio de negociação direta ou mediação.`,
    `${nForo}.2. Não havendo composição amigável no prazo de 15 (quinze) dias, fica eleito o foro da Comarca de ${FABRICA.cidade} para dirimir quaisquer controvérsias oriundas deste contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.`
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

// Small pt-BR number-to-word helper for low integers used inline in clause text (1-31)
const EXTENSO_MAP = ["zero","um","dois","três","quatro","cinco","seis","sete","oito","nove","dez","onze","doze","treze","catorze","quinze","dezesseis","dezessete","dezoito","dezenove","vinte"];
function numeroPorExtenso(n) {
  const num = Number(n);
  if (num >= 0 && num <= 20) return EXTENSO_MAP[num];
  if (num > 20 && num < 30) return `vinte e ${EXTENSO_MAP[num - 20]}`;
  if (num === 30) return "trinta";
  if (num === 50) return "cinquenta";
  if (num === 100) return "cem";
  return String(num);
}

async function generateAgenciaBuffer(data) {
  const doc = buildAgenciaContract(data);
  return Packer.toBuffer(doc);
}

module.exports = { buildAgenciaContract, generateAgenciaBuffer };
