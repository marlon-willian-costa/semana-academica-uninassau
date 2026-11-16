/**
 * Camada de dados (API) — Squad 3 (Back-end & Base44)
 *
 * O front-end (Squad 2) e o certificado (Squad 4) só conversam com o objeto `DB`.
 * Trocar de "local" para "base44" em js/config.js não exige mudar nenhuma tela.
 *
 * Entidades:
 *   Aluno      { id, nome, email, telefone, cpf, matricula, curso, created_date }
 *   Frequencia { id, aluno_id, dia_id, data_registro, registrado_por }
 */
const DB = (() => {
  const cfg = window.APP_CONFIG;
  const modo = cfg.backend.modo;
  const V = window.Validacao;

  class ErroDuplicado extends Error {
    constructor(campo) {
      super(`Já existe uma inscrição com este ${campo}.`);
      this.codigo = "DUPLICADO";
      this.campo = campo;
    }
  }

  const uid = () =>
    (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));

  // ---------------- Adaptador LOCAL (localStorage) ----------------
  const local = {
    _get(k) { try { return JSON.parse(localStorage.getItem("sa6_" + k)) || []; } catch { return []; } },
    _set(k, v) { localStorage.setItem("sa6_" + k, JSON.stringify(v)); },
    async list(entity) { return this._get(entity); },
    async create(entity, data) {
      const rows = this._get(entity);
      const row = { id: uid(), created_date: new Date().toISOString(), ...data };
      rows.push(row);
      this._set(entity, rows);
      return row;
    },
    async remove(entity, id) {
      this._set(entity, this._get(entity).filter((r) => r.id !== id));
    }
  };

  // ---------------- Adaptador BASE44 (REST) ----------------
  // Documentação: painel do app Base44 > Code/API > Entities
  const base44 = {
    async _req(path, opts = {}) {
      const { baseUrl, appId, apiKey } = cfg.backend.base44;
      if (!appId || !apiKey) throw new Error("Base44 não configurado (appId/apiKey em js/config.js).");
      const res = await fetch(`${baseUrl}/${appId}/entities/${path}`, {
        ...opts,
        headers: { "Content-Type": "application/json", api_key: apiKey, ...(opts.headers || {}) }
      });
      if (!res.ok) throw new Error(`Erro Base44 (${res.status}): ${await res.text()}`);
      return res.status === 204 ? null : res.json();
    },
    async list(entity) { return this._req(entity); },
    async create(entity, data) { return this._req(entity, { method: "POST", body: JSON.stringify(data) }); },
    async remove(entity, id) { return this._req(`${entity}/${encodeURIComponent(id)}`, { method: "DELETE" }); }
  };

  const store = modo === "base44" ? base44 : local;

  // ---------------- Regras de negócio ----------------
  async function listarAlunos() {
    const rows = await store.list("Aluno");
    return rows.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }

  async function buscarAluno({ id, cpf, email } = {}) {
    const alunos = await store.list("Aluno");
    const cpfD = V.soDigitos(cpf);
    const em = String(email || "").trim().toLowerCase();
    return alunos.find((a) =>
      (id && a.id === id) || (cpfD && a.cpf === cpfD) || (em && a.email === em)
    ) || null;
  }

  /** Lógica de proteção: bloqueia CPF, e-mail ou matrícula duplicados. */
  async function cadastrarAluno(dados) {
    const aluno = {
      nome: V.normalizarNome(dados.nome),
      email: String(dados.email).trim().toLowerCase(),
      telefone: V.soDigitos(dados.telefone),
      cpf: V.soDigitos(dados.cpf),
      matricula: V.soDigitos(dados.matricula),
      curso: String(dados.curso).trim()
    };

    // Validação também no "back-end" — nunca confiar só no formulário
    if (!V.validarNome(aluno.nome)) throw new Error("Nome inválido.");
    if (!V.validarEmail(aluno.email)) throw new Error("E-mail inválido.");
    if (!V.validarCPF(aluno.cpf)) throw new Error("CPF inválido.");
    if (!V.validarTelefone(aluno.telefone)) throw new Error("Telefone inválido.");
    if (!V.validarMatricula(aluno.matricula)) throw new Error("Matrícula inválida.");
    if (!cfg.cursos.includes(aluno.curso)) throw new Error("Curso inválido.");

    const existentes = await store.list("Aluno");
    if (existentes.some((a) => a.cpf === aluno.cpf)) throw new ErroDuplicado("CPF");
    if (existentes.some((a) => a.email === aluno.email)) throw new ErroDuplicado("e-mail");
    if (existentes.some((a) => a.matricula === aluno.matricula)) throw new ErroDuplicado("matrícula");

    return store.create("Aluno", aluno);
  }

  async function listarFrequencias() { return store.list("Frequencia"); }

  async function registrarPresenca(alunoId, diaId, registradoPor = "professor") {
    if (!cfg.evento.dias.some((d) => d.id === diaId)) throw new Error("Dia do evento inválido.");
    const freq = await store.list("Frequencia");
    const ja = freq.find((f) => f.aluno_id === alunoId && f.dia_id === diaId);
    if (ja) return { registro: ja, novo: false }; // idempotente: evita check-in duplicado
    const registro = await store.create("Frequencia", {
      aluno_id: alunoId, dia_id: diaId, data_registro: new Date().toISOString(), registrado_por: registradoPor
    });
    return { registro, novo: true };
  }

  async function removerPresenca(alunoId, diaId) {
    const freq = await store.list("Frequencia");
    const alvos = freq.filter((f) => f.aluno_id === alunoId && f.dia_id === diaId);
    for (const f of alvos) await store.remove("Frequencia", f.id);
  }

  /** Lógica de aprovação (Squad 4): soma as horas dos dias com check-in. */
  function calcularCarga(alunoId, frequencias) {
    const dias = new Set(frequencias.filter((f) => f.aluno_id === alunoId).map((f) => f.dia_id));
    const horas = cfg.evento.dias.filter((d) => dias.has(d.id)).reduce((s, d) => s + d.horas, 0);
    return { horas, diasPresentes: [...dias], aprovado: horas >= cfg.evento.cargaMinima };
  }

  return {
    modo, ErroDuplicado, listarAlunos, buscarAluno, cadastrarAluno,
    listarFrequencias, registrarPresenca, removerPresenca, calcularCarga
  };
})();
