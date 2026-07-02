let tipoAtual = "agencia";

const btnAgencia = document.getElementById("btnAgencia");
const btnAvulso = document.getElementById("btnAvulso");
const secaoAgencia = document.getElementById("secaoAgencia");
const secaoAvulso = document.getElementById("secaoAvulso");

// Desabilita todos os inputs required de uma seção oculta,
// para o browser não tentar validar campos invisíveis.
function setInputsDisabled(section, disabled) {
  section.querySelectorAll("input, select, textarea").forEach(el => {
    if (disabled) {
      el.dataset.wasRequired = el.required ? "1" : "0";
      el.required = false;
      el.disabled = true;
    } else {
      if (el.dataset.wasRequired === "1") el.required = true;
      el.disabled = false;
    }
  });
}

function setTipo(tipo) {
  tipoAtual = tipo;
  btnAgencia.classList.toggle("active", tipo === "agencia");
  btnAvulso.classList.toggle("active", tipo === "avulso");

  const showAgencia = tipo === "agencia";
  secaoAgencia.classList.toggle("hidden-section", !showAgencia);
  secaoAvulso.classList.toggle("hidden-section", showAgencia);

  setInputsDisabled(secaoAgencia, !showAgencia);
  setInputsDisabled(secaoAvulso, showAgencia);
}

btnAgencia.addEventListener("click", () => setTipo("agencia"));
btnAvulso.addEventListener("click", () => setTipo("avulso"));

// Inicializa corretamente — avulso começa desabilitado
setInputsDisabled(secaoAvulso, true);

function bindToggle(checkboxId, conditionalId) {
  const cb = document.getElementById(checkboxId);
  const cond = document.getElementById(conditionalId);
  if (!cb || !cond) return;
  const sync = () => cond.classList.toggle("show", cb.checked);
  cb.addEventListener("change", sync);
  sync();
}

bindToggle("temDesign", "condDesign");
bindToggle("temConsultoria", "condConsultoria");
bindToggle("temDesignAvulso", "condDesignAvulso");

const condicaoPagamentoSelect = document.getElementById("condicaoPagamento");
const condPersonalizado = document.getElementById("condPersonalizado");
condicaoPagamentoSelect.addEventListener("change", () => {
  condPersonalizado.classList.toggle("show", condicaoPagamentoSelect.value === "personalizado");
});

// Data padrão = hoje
const today = new Date().toISOString().slice(0, 10);
document.querySelector('[name="dataInicio"]').value = today;
document.querySelector('[name="dataInicioAvulso"]').value = today;

const form = document.getElementById("contratoForm");
const statusEl = document.getElementById("status");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "";
  statusEl.className = "";
  submitBtn.disabled = true;
  submitBtn.textContent = "Gerando...";

  const fd = new FormData(form);
  const payload = {};
  for (const [key, value] of fd.entries()) payload[key] = value;

  // checkboxes não aparecem no FormData quando desmarcados — lê direto do DOM
  payload.temDesign = document.getElementById("temDesign").checked;
  payload.temSocialMedia = document.getElementById("temSocialMedia").checked;
  payload.temConsultoria = document.getElementById("temConsultoria").checked;
  payload.temDesignAvulso = document.getElementById("temDesignAvulso").checked;
  payload.temSocialMediaAvulso = document.getElementById("temSocialMediaAvulso").checked;

  let endpoint, body;
  if (tipoAtual === "agencia") {
    endpoint = "/api/gerar/agencia";
    body = {
      clienteRazaoSocial: payload.clienteRazaoSocial,
      clienteTipoPessoa: payload.clienteTipoPessoa,
      clienteCnpjCpf: payload.clienteCnpjCpf,
      clienteEndereco: payload.clienteEndereco,
      clienteRepresentante: payload.clienteRepresentante,
      clienteEmail: payload.clienteEmail,
      clienteTelefone: payload.clienteTelefone,
      quantidadeVideos: Number(payload.quantidadeVideos),
      temDesign: payload.temDesign,
      quantidadeArtes: Number(payload.quantidadeArtes),
      temSocialMedia: payload.temSocialMedia,
      temConsultoria: payload.temConsultoria,
      reunioesMensais: Number(payload.reunioesMensais),
      dataInicio: payload.dataInicio,
      duracaoMeses: Number(payload.duracaoMeses),
      valorMensal: Number(payload.valorMensal),
      diaVencimento: Number(payload.diaVencimento),
      formaPagamento: payload.formaPagamento,
      percentualMultaIntermediaria: Number(payload.percentualMultaIntermediaria),
      responsavelFabrica: payload.responsavelFabrica
    };
  } else {
    endpoint = "/api/gerar/avulso";
    body = {
      clienteRazaoSocial: payload.clienteRazaoSocial,
      clienteTipoPessoa: payload.clienteTipoPessoa,
      clienteCnpjCpf: payload.clienteCnpjCpf,
      clienteEndereco: payload.clienteEndereco,
      clienteRepresentante: payload.clienteRepresentante,
      clienteEmail: payload.clienteEmail,
      clienteTelefone: payload.clienteTelefone,
      descricaoProjeto: payload.descricaoProjeto,
      quantidadeVideos: Number(payload.quantidadeVideosAvulso),
      temDesign: payload.temDesignAvulso,
      quantidadeArtes: Number(payload.quantidadeArtesAvulso),
      temSocialMedia: payload.temSocialMediaAvulso,
      dataInicio: payload.dataInicioAvulso,
      prazoDiasUteis: Number(payload.prazoDiasUteis),
      dataCaptacao: payload.dataCaptacao || null,
      valorTotal: Number(payload.valorTotal),
      condicaoPagamento: payload.condicaoPagamento,
      condicaoPagamentoTexto: payload.condicaoPagamentoTexto,
      formaPagamento: payload.formaPagamentoAvulso,
      responsavelFabrica: payload.responsavelFabricaAvulso
    };
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || "Erro ao gerar contrato.");
    }

    const blob = await res.blob();
    const disposition = res.headers.get("Content-Disposition") || "";
    const match = disposition.match(/filename="(.+)"/);
    const filename = match ? match[1] : "contrato.docx";

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    statusEl.textContent = "✅ Contrato gerado e baixado com sucesso.";
    statusEl.className = "ok";
  } catch (err) {
    statusEl.textContent = "❌ " + err.message;
    statusEl.className = "error";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Gerar contrato (.docx)";
  }
});
