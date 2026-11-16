/** Automação & Certificado PDF — Squad 4 */
(() => {
  const cfg = window.APP_CONFIG;
  const V = window.Validacao;
  const $ = (id) => document.getElementById(id);

  $("cargaMin").textContent = cfg.evento.cargaMinima;
  $("cpf").addEventListener("input", (e) => (e.target.value = V.mascaraCPF(e.target.value)));
  $("matricula").addEventListener("input", (e) => (e.target.value = V.mascaraMatricula(e.target.value)));

  const emailAtivo = () => cfg.emailjs.publicKey && cfg.emailjs.serviceId && cfg.emailjs.templateId && window.emailjs;

  $("formBusca").addEventListener("submit", async (e) => {
    e.preventDefault();
    const cpfOk = V.validarCPF($("cpf").value);
    const matOk = V.validarMatricula($("matricula").value);
    $("cpf").classList.toggle("is-invalid", !cpfOk);
    $("matricula").classList.toggle("is-invalid", !matOk);
    if (!cpfOk || !matOk) return;

    const btn = $("btnBuscar");
    btn.disabled = true;
    const out = $("resultado");
    try {
      const aluno = await DB.buscarAluno({ cpf: $("cpf").value });
      // Exige CPF + matrícula para impedir que alguém emita o certificado de outra pessoa só com o CPF
      if (!aluno || aluno.matricula !== V.soDigitos($("matricula").value)) {
        out.innerHTML = `<div class="alert alert-danger mb-0">Inscrição não encontrada para estes dados.</div>`;
        out.classList.remove("d-none");
        return;
      }
      const carga = DB.calcularCarga(aluno.id, await DB.listarFrequencias());
      renderResultado(aluno, carga);
    } catch (err) {
      out.innerHTML = `<div class="alert alert-danger mb-0">${V.escapeHTML(err.message)}</div>`;
      out.classList.remove("d-none");
    } finally {
      btn.disabled = false;
    }
  });

  function renderResultado(aluno, carga) {
    const out = $("resultado");
    const pct = Math.min(100, Math.round((carga.horas / cfg.evento.cargaMinima) * 100));
    const dias = cfg.evento.dias.map((d) =>
      `<span class="badge ${carga.diasPresentes.includes(d.id) ? "bg-success" : "bg-light text-muted border"} me-1">${UI.dataBR(d.data)}</span>`).join("");

    out.innerHTML = `
      <h2 class="h5 mb-1">${V.escapeHTML(aluno.nome)}</h2>
      <div class="small text-muted mb-2">${V.escapeHTML(aluno.curso)}</div>
      <div class="mb-2">${dias}</div>
      <div class="progress mb-2" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" style="height:22px">
        <div class="progress-bar ${carga.aprovado ? "bg-success" : "bg-warning text-dark"}" style="width:${pct}%">${carga.horas}h / ${cfg.evento.cargaMinima}h</div>
      </div>
      ${carga.aprovado
        ? `<div class="alert alert-success">Parabéns! Você cumpriu a carga horária mínima.</div>
           <div class="d-grid gap-2">
             <button class="btn btn-warning btn-lg" id="btnPDF"><i class="bi bi-file-earmark-pdf"></i> Baixar certificado</button>
             ${emailAtivo() ? `<button class="btn btn-outline-primary" id="btnEmail"><i class="bi bi-envelope"></i> Enviar para ${V.escapeHTML(aluno.email)}</button>` : ""}
           </div>`
        : `<div class="alert alert-warning mb-0">Faltam <strong>${cfg.evento.cargaMinima - carga.horas}h</strong> para liberar o certificado.</div>`}`;
    out.classList.remove("d-none");

    if (carga.aprovado) {
      $("btnPDF").onclick = async () => (await gerarPDF(aluno, carga)).save(`certificado-${aluno.matricula}.pdf`);
      const btnEmail = $("btnEmail");
      if (btnEmail) btnEmail.onclick = () => enviarEmail(aluno, carga, btnEmail);
    }
  }

  // ---------- Geração dinâmica do PDF ----------
  function carregarImagem(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        c.getContext("2d").drawImage(img, 0, 0);
        resolve(c.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  function fundoPadrao(doc) {
    const W = 297, H = 210;
    doc.setFillColor(255, 255, 255); doc.rect(0, 0, W, H, "F");
    doc.setFillColor(11, 61, 145); doc.rect(0, 0, W, 28, "F");
    doc.setFillColor(255, 194, 14); doc.rect(0, 28, W, 4, "F");
    doc.setFillColor(255, 194, 14); doc.rect(0, H - 14, W, 4, "F");
    doc.setFillColor(11, 61, 145); doc.rect(0, H - 10, W, 10, "F");
    doc.setDrawColor(11, 61, 145); doc.setLineWidth(0.6); doc.rect(10, 38, W - 20, H - 58);
    doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(18);
    doc.text(cfg.evento.nome.toUpperCase(), W / 2, 18, { align: "center" });
    doc.setTextColor(11, 61, 145); doc.setFontSize(34);
    doc.text("CERTIFICADO", W / 2, 62, { align: "center" });
    doc.setFont("helvetica", "normal"); doc.setFontSize(14); doc.setTextColor(60, 60, 60);
    doc.text("Certificamos que", W / 2, 84, { align: "center" });
  }

  function codigoVerificacao(aluno) {
    let h = 0;
    for (const ch of aluno.id + aluno.cpf) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return "SA6-" + h.toString(36).toUpperCase().padStart(7, "0");
  }

  async function gerarPDF(aluno, carga) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const W = 297;
    const c = cfg.certificado;

    const fundo = await carregarImagem(c.template);
    if (fundo) doc.addImage(fundo, "JPEG", 0, 0, 297, 210);
    else fundoPadrao(doc);

    // Variáveis dinâmicas: Nome do Aluno e Carga Horária
    doc.setFont("helvetica", "bold");
    doc.setTextColor(11, 61, 145);
    let tam = c.posNome.tamanho;
    doc.setFontSize(tam);
    while (doc.getTextWidth(aluno.nome) > 250 && tam > 16) doc.setFontSize(--tam); // nomes longos cabem
    doc.text(aluno.nome, W / 2, c.posNome.y, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(c.posTexto.tamanho);
    doc.setTextColor(40, 40, 40);
    const primeiro = cfg.evento.dias[0].data.split("-").reverse().join("/");
    const ultimo = cfg.evento.dias[cfg.evento.dias.length - 1].data.split("-").reverse().join("/");
    const texto = `aluno(a) do curso de ${aluno.curso}, matrícula ${aluno.matricula}, participou da ${cfg.evento.nome}, ` +
      `realizada de ${primeiro} a ${ultimo}, com carga horária total de ${carga.horas} horas.`;
    doc.text(doc.splitTextToSize(texto, 230), W / 2, c.posTexto.y, { align: "center" });

    doc.setFontSize(9); doc.setTextColor(110, 110, 110);
    doc.text(`Código de verificação: ${codigoVerificacao(aluno)}  ·  Emitido em ${new Date().toLocaleDateString("pt-BR")}`, W / 2, 186, { align: "center" });

    doc.setDrawColor(40, 40, 40); doc.setLineWidth(0.3);
    doc.line(W / 2 - 45, 170, W / 2 + 45, 170);
    doc.setFontSize(11); doc.setTextColor(40, 40, 40);
    doc.text("Coordenação da Semana Acadêmica", W / 2, 176, { align: "center" });
    return doc;
  }

  // ---------- Disparo de e-mail (EmailJS) ----------
  async function enviarEmail(aluno, carga, btn) {
    btn.disabled = true;
    try {
      const doc = await gerarPDF(aluno, carga);
      emailjs.init({ publicKey: cfg.emailjs.publicKey });
      await emailjs.send(cfg.emailjs.serviceId, cfg.emailjs.templateId, {
        to_name: aluno.nome,
        to_email: aluno.email,
        carga_horaria: carga.horas,
        evento: cfg.evento.nome,
        // No template EmailJS: Attachments > Variable Attachment, parâmetro "certificado_pdf"
        certificado_pdf: doc.output("datauristring")
      });
      UI.toast("Certificado enviado para " + aluno.email);
    } catch (err) {
      console.error(err);
      UI.toast("Falha ao enviar e-mail. Baixe o PDF pelo botão acima.", "danger");
      btn.disabled = false;
    }
  }
})();
