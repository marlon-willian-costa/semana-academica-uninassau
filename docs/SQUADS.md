# Divisão dos Squads e Kanban

O Kanban oficial está nas **Issues** do GitHub (labels `squad-1` … `squad-5`). Mover para *In Progress* = se atribuir na issue; *Done* = fechar a issue com o commit/PR.

## 👑 Squad 1 — Tech Lead & Scrum Master
**Arquivos:** `js/config.js`, `README.md`, organização do repositório

- [x] Criar repositório no GitHub e estrutura de pastas
- [x] Definir arquitetura (telas → `DB` → Base44) para os squads trabalharem em paralelo
- [ ] Preencher datas reais e carga horária em `js/config.js`
- [ ] Revisar e aprovar Pull Requests dos outros squads
- [ ] Desbloqueio: se o Base44 atrasar, o front continua no modo `local`

## 🎨 Squad 2 — Front-End & UI/UX
**Arquivos:** `index.html`, `checkin.html`, `css/style.css`, `js/inscricao.js`, `js/checkin.js`, `assets/`

- [x] Landing page azul e amarela com programação
- [x] Formulário com máscaras: Nome, E-mail, Telefone, CPF, Matrícula, Curso
- [x] Painel de check-in com lista de chaves e leitor de QR Code
- [ ] **Substituir `assets/logo.svg` pela Logo Oficial da Jornada Acadêmica**
- [ ] Ajustar textos/cursos conforme a coordenação

## 🗄️ Squad 3 — Back-End & Base44
**Arquivos:** `js/api.js`, `docs/base44/*.json`

- [x] Modelagem das entidades `Aluno` e `Frequencia`
- [x] Camada de API (`DB`) com adaptador Base44
- [x] Bloqueio de duplicidade por CPF, e-mail e matrícula
- [ ] Criar as entidades no painel Base44 (ver `docs/BASE44.md`)
- [ ] Preencher `appId` / `apiKey` e trocar `backend.modo` para `"base44"`

## 📜 Squad 4 — Automação & Certificado PDF
**Arquivos:** `certificado.html`, `js/certificado.js`

- [x] Geração dinâmica do PDF (nome e carga horária)
- [x] Lógica de aprovação (soma de horas ≥ 20h)
- [x] Envio por e-mail via EmailJS com PDF anexo
- [ ] Colocar o template oficial em `assets/certificado-template.png` e ajustar `posNome`/`posTexto`
- [ ] Criar conta EmailJS e configurar chaves (ver `docs/EMAIL.md`)

## 🕵️ Squad 5 — QA, Deploy & Pitch
**Arquivos:** `tests/`, `docs/QA_TESTES.md`, `docs/PITCH.md`

- [x] Testes automatizados de validação (`npm test`)
- [x] Deploy no GitHub Pages
- [ ] Executar o roteiro de `docs/QA_TESTES.md` e abrir issues com os bugs
- [ ] Ensaiar o pitch de 5 minutos

## Cronograma

| Quando | Entrega |
|---|---|
| Quinta (laboratório) | Squads definidos, protótipo da interface, tabelas no Base44 |
| Sex–Dom (remoto) | Botão "Salvar" funcionando, 1 certificado de teste gerado, QA testando |
| **Segunda 16/11** | **Code Freeze** — só correções, deploy final e pitch |
