require("dotenv").config();
const express = require("express");
const path = require("path");
const basicAuth = require("express-basic-auth");
const { generateAgenciaBuffer } = require("./lib/contratoAgencia");
const { generateAvulsoBuffer } = require("./lib/contratoAvulso");

const app = express();
const PORT = process.env.PORT || 3000;
const SENHA_ACESSO = process.env.SENHA_ACESSO || "fabrica2026";

// Proteção simples por senha compartilhada (uso interno, só você + 1 funcionário).
// Para trocar a senha, edite o arquivo .env (variável SENHA_ACESSO) e reinicie o servidor.
app.use(basicAuth({
  users: { "fabrica": SENHA_ACESSO },
  challenge: true,
  realm: "Gerador de Contratos - Fabrica de Ideias"
}));

app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

function slugify(text) {
  return String(text || "contrato")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

app.post("/api/gerar/agencia", async (req, res) => {
  try {
    const buffer = await generateAgenciaBuffer(req.body);
    const filename = `Contrato_Agencia_${slugify(req.body.clienteRazaoSocial)}.docx`;
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Erro ao gerar contrato. Verifique os campos preenchidos.", detail: String(err.message || err) });
  }
});

app.post("/api/gerar/avulso", async (req, res) => {
  try {
    const buffer = await generateAvulsoBuffer(req.body);
    const filename = `Contrato_Avulso_${slugify(req.body.clienteRazaoSocial)}.docx`;
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Erro ao gerar contrato. Verifique os campos preenchidos.", detail: String(err.message || err) });
  }
});

app.get("/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Gerador de Contratos - Fábrica de Ideias rodando em http://localhost:${PORT}`);
});
