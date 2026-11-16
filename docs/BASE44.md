# Base44 — Modelagem de dados e API (Squad 3)

## Entidades

```
Aluno (1) ───< (N) Frequencia
```

**Aluno** — schema em [`base44/Aluno.json`](base44/Aluno.json)

| Campo | Tipo | Regra |
|---|---|---|
| id | string | gerado pelo Base44 |
| nome | string | nome + sobrenome, normalizado |
| email | string | minúsculo, **único** |
| telefone | string | só dígitos |
| cpf | string | 11 dígitos, validado, **único** |
| matricula | string | só dígitos, **única** |
| curso | string | lista de `config.js` |

**Frequencia** — schema em [`base44/Frequencia.json`](base44/Frequencia.json)

| Campo | Tipo | Regra |
|---|---|---|
| aluno_id | string | id do Aluno |
| dia_id | string | `D1`…`D5` (dias de `config.js`) |
| data_registro | datetime | momento do check-in |
| registrado_por | string | `lista` ou `qrcode` |

Um aluno só tem **um** registro por dia (o sistema verifica antes de criar — check-in idempotente).

## Passo a passo no Base44

1. Criar um app no Base44 (ex.: "Semana Acadêmica").
2. Em **Data / Entities**, criar `Aluno` e `Frequencia` colando os schemas JSON desta pasta.
3. Em **Settings / API**, copiar o **App ID** e a **API Key**.
4. Em `js/config.js`:
   ```js
   backend: { modo: "base44", base44: { baseUrl: "https://app.base44.com/api/apps", appId: "SEU_APP_ID", apiKey: "SUA_CHAVE" } }
   ```
5. Fazer uma inscrição e conferir o registro no painel do Base44.

> Confirme no painel de API do seu app o formato exato dos endpoints. O adaptador usa:
> `GET/POST {baseUrl}/{appId}/entities/{Entidade}` e `DELETE {baseUrl}/{appId}/entities/{Entidade}/{id}`, com header `api_key`.
> Se mudar, ajuste só o objeto `base44` em `js/api.js`.

## Endpoints usados pelo front (contrato do objeto `DB`)

| Função | Uso |
|---|---|
| `DB.cadastrarAluno(dados)` | valida, bloqueia duplicados, cria Aluno |
| `DB.buscarAluno({id, cpf, email})` | consulta |
| `DB.listarAlunos()` | lista para a chamada |
| `DB.registrarPresenca(alunoId, diaId)` | check-in (não duplica) |
| `DB.removerPresenca(alunoId, diaId)` | desfaz check-in |
| `DB.calcularCarga(alunoId, frequencias)` | soma horas e diz se está apto |
