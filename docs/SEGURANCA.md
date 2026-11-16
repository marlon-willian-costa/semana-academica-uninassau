# Segurança e LGPD

## O que já está implementado
- **Validação dupla**: no formulário e de novo em `js/api.js` antes de gravar (não confia só na tela).
- **Bloqueio de duplicidade** por CPF, e-mail e matrícula.
- **Proteção contra XSS**: todo dado exibido em tabela/HTML passa por `escapeHTML`; nomes só aceitam letras.
- **Clique duplo**: botão desabilitado durante o envio.
- **Certificado** exige CPF **e** matrícula (ninguém emite o certificado de outro só com o CPF).
- **Check-in idempotente**: um registro por aluno por dia.
- **Consentimento LGPD** obrigatório na inscrição; dados usados só para o evento.
- **HTTPS** via GitHub Pages.

## Limitações conhecidas (falar com honestidade se a banca perguntar)
- O site é estático: a `apiKey` do Base44 e o PIN do professor ficam visíveis no código do navegador.
  Para produção, o próximo passo é mover as chamadas para **Backend Functions do Base44** (ou uma função serverless na Vercel)
  e usar login de professor com autenticação real.
- A unicidade de CPF/e-mail é verificada pela aplicação; o ideal é também configurar restrição única no banco.
