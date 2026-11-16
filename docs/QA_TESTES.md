# Roteiro de Testes de Estresse (Squad 5 — QA)

Automatizados: `npm test` (validação de CPF, e-mail, nome, telefone, matrícula, máscaras e escape de HTML).

Manuais — marque ✅/❌ e abra uma issue para cada ❌ com o label do squad responsável.

## Inscrição (`index.html`)
| # | Teste | Esperado | OK? |
|---|---|---|---|
| 1 | Enviar formulário vazio | Todos os campos ficam vermelhos, nada é salvo | |
| 2 | Digitar letras no CPF / telefone / matrícula | Letras não entram | |
| 3 | CPF `111.111.111-11` ou `123.456.789-00` | "CPF inválido" | |
| 4 | Nome só com primeiro nome / com números | Rejeitado | |
| 5 | E-mail sem `@` | Rejeitado | |
| 6 | Clicar duas vezes rápido em "Confirmar" | Só **1** inscrição criada | |
| 7 | Inscrever de novo com o mesmo CPF | Aviso de duplicidade | |
| 8 | Mesmo e-mail em maiúsculas (`ALUNO@X.COM`) | Aviso de duplicidade | |
| 9 | Nome `<script>alert(1)</script> Silva` | Rejeitado / não executa script | |
| 10 | Sem aceitar LGPD | Bloqueado | |
| 11 | Celular (largura 375px) | Layout sem rolagem horizontal | |

## Check-in (`checkin.html`)
| # | Teste | Esperado | OK? |
|---|---|---|---|
| 12 | PIN errado | Acesso negado | |
| 13 | Marcar presença e recarregar a página | Presença continua marcada | |
| 14 | Ler o mesmo QR duas vezes | "já estava presente", sem duplicar horas | |
| 15 | Ler QR de outro site | "QR Code não pertence ao evento" | |
| 16 | Exportar CSV e abrir no Excel | Acentos corretos | |

## Certificado (`certificado.html`)
| # | Teste | Esperado | OK? |
|---|---|---|---|
| 17 | Aluno com 15h | Mostra quanto falta, **sem** botão de PDF | |
| 18 | Aluno com 20h+ | PDF com nome e horas corretos | |
| 19 | CPF certo + matrícula errada | "Inscrição não encontrada" | |
| 20 | Nome muito longo | Cabe no certificado | |
| 21 | Enviar e-mail | Chega com PDF anexo | |

## Deploy
| # | Teste | Esperado | OK? |
|---|---|---|---|
| 22 | Abrir o link do GitHub Pages em outro computador | Funciona | |
| 23 | Câmera no celular pelo link (HTTPS) | Leitor de QR abre | |
