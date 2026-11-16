# 6ª Semana Acadêmica UNINASSAU

Sistema web de **inscrição**, **frequência (check-in)** e **certificado automático** para a 6ª Semana Acadêmica UNINASSAU.
Projeto desenvolvido no formato **Fábrica de Software**, com 5 Squads.

## Funcionalidades

| Módulo | Página | O que faz |
|---|---|---|
| Landing + Inscrição | `index.html` | Programação do evento e formulário com máscaras (Nome, E-mail, Telefone, CPF, Matrícula, Curso), validação de CPF, bloqueio de clique duplo e QR Code pessoal ao final |
| Painel de Frequência | `checkin.html` | Área do professor (PIN): chamada por lista com chaves de presença ou **leitura de QR Code** pela câmera, busca, indicadores e exportação CSV |
| Certificado | `certificado.html` | Consulta por CPF + matrícula, soma as horas de check-in, libera o PDF só com **≥ 20h**, gera o PDF com jsPDF e envia por e-mail (EmailJS) |

## Tecnologias

- HTML5, CSS3, JavaScript (sem build), Bootstrap 5
- [jsPDF](https://github.com/parallax/jsPDF) — geração do certificado
- [qrcodejs](https://github.com/davidshimjs/qrcodejs) e [html5-qrcode](https://github.com/mebjas/html5-qrcode) — QR Code de check-in
- **Base44** — banco de dados e API REST (entidades `Aluno` e `Frequencia`)
- EmailJS — disparo de e-mail com o PDF anexado
- GitHub Pages — hospedagem

## Arquitetura

```
index.html / checkin.html / certificado.html   (Squad 2 — telas)
        │
        ▼
js/api.js  ── objeto DB (regras de negócio)    (Squad 3)
   ├─ adaptador "local"  → localStorage (demo)
   └─ adaptador "base44" → API REST Base44
        │
js/certificado.js → jsPDF + EmailJS            (Squad 4)
js/config.js      → datas, carga horária, chaves (Squad 1)
```

As telas nunca acessam o banco diretamente: só chamam `DB.cadastrarAluno()`, `DB.registrarPresenca()`, `DB.calcularCarga()` etc.
Assim o Squad 2 trabalha em paralelo com o Squad 3 usando o modo `local`, e no fim basta trocar `backend.modo` para `"base44"`.

## Rodando localmente

Basta abrir `index.html` no navegador — ou, para a câmera do QR Code funcionar, usar um servidor local:

```bash
npx serve .          # ou: python -m http.server 8080
```

Testes automatizados das validações:

```bash
npm test             # equivale a: node --test tests/
```

## Configuração (`js/config.js`)

- `evento.dias` — datas, títulos e horas de cada dia
- `evento.cargaMinima` — horas mínimas para o certificado (padrão 20)
- `backend.modo` — `"local"` ou `"base44"` (ver [docs/BASE44.md](docs/BASE44.md))
- `emailjs` — chaves para envio automático (ver [docs/EMAIL.md](docs/EMAIL.md))
- `pinProfessor` — PIN do painel de frequência
- `certificado.template` — imagem de fundo oficial em `assets/certificado-template.png`

## Documentação dos Squads

- [docs/SQUADS.md](docs/SQUADS.md) — divisão de tarefas e quadro Kanban
- [docs/BASE44.md](docs/BASE44.md) — modelagem de dados e API
- [docs/EMAIL.md](docs/EMAIL.md) — configuração do e-mail automático
- [docs/QA_TESTES.md](docs/QA_TESTES.md) — roteiro de testes de estresse
- [docs/SEGURANCA.md](docs/SEGURANCA.md) — segurança e LGPD
- [docs/PITCH.md](docs/PITCH.md) — roteiro do pitch de 5 minutos
