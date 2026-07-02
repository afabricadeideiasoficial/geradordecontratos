# Gerador de Contratos — Fábrica de Ideias

App interno que gera os contratos de **Agência (recorrente)** e **Avulso (projeto único)** já prontos, em `.docx`, sem nenhum campo em branco — é só preencher o formulário e baixar.

## O que ele faz

- Formulário web com os dois tipos de contrato (seletor no topo)
- Toggles pra Design, Social Media e Consultoria — quando desligados, a cláusula correspondente **desaparece inteira** do contrato (não fica cláusula vazia ou mencionando serviço que não existe)
- Calcula sozinho: data de término (a partir da duração), valor total, valores por extenso, formatação de CNPJ/CPF
- Aplica automaticamente a regra de multa por cancelamento (100% do saldo até 3 meses / multa intermediária entre 3-6 meses / sem multa após 6 meses)
- Dados da Fábrica (CNPJ, endereço, sócio) já vêm fixos — só os dados do cliente são preenchidos
- Protegido por senha simples (compartilhada entre você e o funcionário)

## Rodando localmente (teste antes de subir pro servidor)

```bash
npm install
cp .env.example .env    # depois edite o .env e troque SENHA_ACESSO
npm start
```

Acesse `http://localhost:3000`. Vai pedir usuário `fabrica` e a senha que você definiu no `.env`.

## Subindo no seu servidor (Lightsail / qualquer host com Node)

1. Suba a pasta inteira (exceto `node_modules`) pro servidor — via `git`, `scp` ou upload direto.
2. No servidor:
   ```bash
   npm install --production
   cp .env.example .env
   nano .env   # define SENHA_ACESSO e, se precisar, PORT
   ```
3. Rode com um gerenciador de processo pra ele não cair quando você fechar o terminal — recomendo `pm2`:
   ```bash
   npm install -g pm2
   pm2 start server.js --name gerador-contratos
   pm2 save
   pm2 startup   # deixa rodando mesmo se o servidor reiniciar
   ```
4. Se quiser um domínio tipo `contratos.fabricadeideiasacademy.com`, aponta um proxy reverso (Nginx ou Cloudflare Tunnel, já que vocês usam Cloudflare no CreatorFlow) pra porta configurada no `.env`.

## Trocar a senha de acesso

Edite `SENHA_ACESSO` no `.env` do servidor e reinicie (`pm2 restart gerador-contratos`).

## Estrutura do projeto

```
gerador-contratos/
├── server.js              # servidor Express + autenticação + rotas de geração
├── lib/
│   ├── docxHelpers.js      # helpers genéricos de formatação do Word
│   ├── format.js           # datas, moeda, valor por extenso, CNPJ/CPF
│   ├── fabricaData.js      # dados fixos da Fábrica (CNPJ, endereço, sócio)
│   ├── contratoAgencia.js  # monta o contrato de agência (recorrente)
│   └── contratoAvulso.js   # monta o contrato avulso (projeto único)
└── public/                 # formulário (HTML/CSS/JS puro, sem build step)
```

## Ajustando cláusulas no futuro

Todo o texto jurídico fica em `lib/contratoAgencia.js` e `lib/contratoAvulso.js`, dentro de chamadas `c.add("TÍTULO DA CLÁUSULA", ["texto..."])`. A numeração é automática — pode adicionar, remover ou reordenar cláusulas sem se preocupar em renumerar manualmente. Itens de lista (i, ii, iii...) devem usar `numberedBullets([...])` em vez de escrever o número romano à mão, pelo mesmo motivo.

## Limitações conhecidas / próximos passos possíveis

- Sem login individual (senha única compartilhada) — combinado que por enquanto é só você + 1 funcionário
- Não salva histórico dos contratos gerados — cada geração é feita na hora e baixada; se quiser um histórico/CRM de contratos emitidos, dá pra evoluir depois
- Termo de autorização de uso de imagem (pra atores/modelos assinarem no set) não está incluso — é um documento separado, ainda não construído
