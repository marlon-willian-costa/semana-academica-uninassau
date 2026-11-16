/** Painel de Frequência (Check-in) — Squad 2 (tela) + Squad 3 (dados) */
(() => {
  const cfg = window.APP_CONFIG;
  const V = window.Validacao;
  const $ = (id) => document.getElementById(id);

  let alunos = [];
  let frequencias = [];

  // ---------- PIN ----------
  function liberar() {
    $("telaPin").classList.add("d-none");
    $("painel").classList.remove("d-none");
    iniciar();
  }
  if (sessionStorage.getItem("sa6_prof") === "ok") liberar();
  $("formPin").addEventListener("submit", (e) => {
    e.preventDefault();
    if ($("pin").value === cfg.pinProfessor) {
      sessionStorage.setItem("sa6_prof", "ok");
      liberar();
    } else {
      $("pin").classList.add("is-invalid");
      UI.toast("PIN incorreto.", "danger");
    }
  });

  // ---------- Inicialização ----------
  function iniciar() {
    const sel = $("dia");
    cfg.evento.dias.forEach((d) => sel.add(new Option(`${UI.dataBR(d.data)} — ${d.titulo}`, d.id)));
    const hoje = cfg.evento.dias.find((d) => d.data === UI.hojeISO());
    if (hoje) sel.value = hoje.id;
    $("kpiMin").textContent = cfg.evento.cargaMinima + "h";

    sel.addEventListener("change", render);
    $("busca").addEventListener("input", render);
    $("lista").addEventListener("change", onToggle);
    $("btnCSV").addEventListener("click", exportarCSV);
    $("btnQR").addEventListener("click", abrirLeitor);
    carregar();
  }

  async function carregar() {
    try {
      [alunos, frequencias] = await Promise.all([DB.listarAlunos(), DB.listarFrequencias()]);
      render();
    } catch (err) {
      console.error(err);
      $("lista").innerHTML = `<tr><td colspan="5" class="text-danger text-center py-4">${V.escapeHTML(err.message)}</td></tr>`;
    }
  }

  const presente = (alunoId, diaId) => frequencias.some((f) => f.aluno_id === alunoId && f.dia_id === diaId);

  function render() {
    const dia = $("dia").value;
    const termo = $("busca").value.trim().toLowerCase();
    const filtrados = alunos.filter((a) =>
      !termo || a.nome.toLowerCase().includes(termo) || a.matricula.includes(termo) || a.curso.toLowerCase().includes(termo));

    $("kpiInscritos").textContent = alunos.length;
    $("kpiPresentes").textContent = alunos.filter((a) => presente(a.id, dia)).length;
    $("kpiAptos").textContent = alunos.filter((a) => DB.calcularCarga(a.id, frequencias).aprovado).length;

    if (!filtrados.length) {
      $("lista").innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">Nenhum aluno encontrado.</td></tr>`;
      return;
    }
    $("lista").innerHTML = filtrados.map((a) => {
      const carga = DB.calcularCarga(a.id, frequencias);
      return `<tr>
        <td><div class="form-check form-switch m-0"><input class="form-check-input" type="checkbox" data-id="${V.escapeHTML(a.id)}" ${presente(a.id, dia) ? "checked" : ""} aria-label="Presença de ${V.escapeHTML(a.nome)}"></div></td>
        <td class="fw-semibold">${V.escapeHTML(a.nome)}</td>
        <td class="d-none d-md-table-cell">${V.escapeHTML(a.matricula)}</td>
        <td class="d-none d-lg-table-cell small">${V.escapeHTML(a.curso)}</td>
        <td><span class="badge ${carga.aprovado ? "bg-success" : "bg-secondary"}">${carga.horas}h</span></td>
      </tr>`;
    }).join("");
  }

  async function onToggle(e) {
    const chk = e.target;
    if (!chk.matches("input[data-id]")) return;
    const id = chk.dataset.id;
    const dia = $("dia").value;
    chk.disabled = true;
    try {
      if (chk.checked) await DB.registrarPresenca(id, dia, "lista");
      else await DB.removerPresenca(id, dia);
      frequencias = await DB.listarFrequencias();
      render();
    } catch (err) {
      chk.checked = !chk.checked;
      UI.toast(err.message, "danger");
    } finally {
      chk.disabled = false;
    }
  }

  // ---------- Leitor de QR Code ----------
  let scanner = null;
  let ultimoLido = { texto: "", em: 0 };

  function abrirLeitor() {
    const modalEl = $("modalQR");
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
    modalEl.addEventListener("shown.bs.modal", () => {
      if (scanner) return;
      scanner = new Html5QrcodeScanner("leitorQR", { fps: 10, qrbox: 230 }, false);
      scanner.render(onLeitura, () => {});
    }, { once: true });
    modalEl.addEventListener("hidden.bs.modal", async () => {
      if (scanner) { await scanner.clear().catch(() => {}); scanner = null; }
    }, { once: true });
  }

  async function onLeitura(texto) {
    const agora = Date.now();
    if (texto === ultimoLido.texto && agora - ultimoLido.em < 3000) return; // evita leitura repetida
    ultimoLido = { texto, em: agora };

    const out = $("ultimoCheckin");
    if (!texto.startsWith("SA6:")) { out.innerHTML = `<span class="text-danger">QR Code não pertence ao evento.</span>`; return; }
    const aluno = alunos.find((a) => a.id === texto.slice(4)) || await DB.buscarAluno({ id: texto.slice(4) });
    if (!aluno) { out.innerHTML = `<span class="text-danger">Inscrição não encontrada.</span>`; return; }

    try {
      const { novo } = await DB.registrarPresenca(aluno.id, $("dia").value, "qrcode");
      out.innerHTML = novo
        ? `<span class="text-success"><i class="bi bi-check-circle-fill"></i> ${V.escapeHTML(aluno.nome)} — presença registrada!</span>`
        : `<span class="text-warning"><i class="bi bi-exclamation-circle"></i> ${V.escapeHTML(aluno.nome)} já estava presente.</span>`;
      if (navigator.vibrate) navigator.vibrate(120);
      if (!alunos.some((a) => a.id === aluno.id)) alunos = await DB.listarAlunos();
      frequencias = await DB.listarFrequencias();
      render();
    } catch (err) {
      out.innerHTML = `<span class="text-danger">${V.escapeHTML(err.message)}</span>`;
    }
  }

  // ---------- Exportação ----------
  function exportarCSV() {
    const cab = ["Nome", "E-mail", "Matrícula", "Curso", ...cfg.evento.dias.map((d) => d.data), "Horas", "Apto"];
    const linhas = alunos.map((a) => {
      const c = DB.calcularCarga(a.id, frequencias);
      return [a.nome, a.email, a.matricula, a.curso, ...cfg.evento.dias.map((d) => (presente(a.id, d.id) ? "P" : "F")), c.horas, c.aprovado ? "SIM" : "NÃO"];
    });
    const csv = [cab, ...linhas].map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\r\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `frequencia-semana-academica-${UI.hojeISO()}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
})();
