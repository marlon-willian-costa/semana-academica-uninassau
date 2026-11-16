/** Tela de Inscrição Blindada — Squad 2 */
(() => {
  const cfg = window.APP_CONFIG;
  const V = window.Validacao;
  const $ = (id) => document.getElementById(id);

  // ---------- Conteúdo dinâmico da landing ----------
  $("localEvento").textContent = cfg.evento.local;
  $("cargaTotal").textContent = cfg.evento.dias.reduce((s, d) => s + d.horas, 0);
  $("cargaMin").textContent = cfg.evento.cargaMinima;

  $("programacao").innerHTML = cfg.evento.dias.map((d, i) => `
    <div class="col"><div class="card card-dia p-3">
      <div class="small text-muted">Dia ${i + 1}</div>
      <div class="data">${UI.dataBR(d.data)}</div>
      <div class="fw-semibold">${V.escapeHTML(d.titulo)}</div>
      <div class="small mt-2"><i class="bi bi-hourglass-split"></i> ${d.horas}h</div>
    </div></div>`).join("");

  const selCurso = $("curso");
  cfg.cursos.forEach((c) => selCurso.add(new Option(c, c)));

  // ---------- Máscaras ----------
  const mascaras = { cpf: V.mascaraCPF, telefone: V.mascaraTelefone, matricula: V.mascaraMatricula, nome: V.mascaraNome };
  Object.entries(mascaras).forEach(([id, fn]) => {
    $(id).addEventListener("input", (e) => { e.target.value = fn(e.target.value); });
  });

  // ---------- Validação ----------
  const regras = {
    nome: V.validarNome, email: V.validarEmail, telefone: V.validarTelefone,
    cpf: V.validarCPF, matricula: V.validarMatricula, curso: (v) => cfg.cursos.includes(v)
  };

  function validarCampo(id) {
    const el = $(id);
    const ok = regras[id](el.value);
    el.classList.toggle("is-invalid", !ok);
    el.classList.toggle("is-valid", ok);
    return ok;
  }
  Object.keys(regras).forEach((id) => $(id).addEventListener("blur", () => validarCampo(id)));

  // ---------- Envio (protegido contra clique duplo) ----------
  const form = $("formInscricao");
  const btn = $("btnSalvar");
  let enviando = false;

  function setCarregando(on) {
    enviando = on;
    btn.disabled = on;
    btn.querySelector(".spinner-border").classList.toggle("d-none", !on);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (enviando) return;

    const camposOk = Object.keys(regras).map(validarCampo).every(Boolean);
    const lgpd = $("lgpd");
    lgpd.classList.toggle("is-invalid", !lgpd.checked);
    if (!camposOk || !lgpd.checked) {
      form.querySelector(".is-invalid")?.focus();
      UI.toast("Corrija os campos destacados.", "danger");
      return;
    }

    setCarregando(true);
    try {
      const dados = Object.fromEntries(Object.keys(regras).map((id) => [id, $(id).value]));
      const aluno = await DB.cadastrarAluno(dados);
      form.reset();
      form.querySelectorAll(".is-valid").forEach((el) => el.classList.remove("is-valid"));
      mostrarSucesso(aluno);
    } catch (err) {
      if (err.codigo === "DUPLICADO") {
        const campo = { CPF: "cpf", "e-mail": "email", "matrícula": "matricula" }[err.campo];
        if (campo) $(campo).classList.add("is-invalid");
        UI.toast(err.message + " Se já se inscreveu, vá em Certificado para consultar.", "warning");
      } else {
        console.error(err);
        UI.toast(err.message || "Não foi possível salvar. Tente novamente.", "danger");
      }
    } finally {
      setCarregando(false);
    }
  });

  // ---------- Sucesso + QR Code ----------
  function mostrarSucesso(aluno) {
    $("sucessoNome").textContent = aluno.nome;
    $("sucessoCodigo").textContent = aluno.id;
    const box = $("qrcode");
    box.innerHTML = "";
    new QRCode(box, { text: "SA6:" + aluno.id, width: 200, height: 200, colorDark: "#0b3d91" });
    $("btnBaixarQR").onclick = () => {
      const canvas = box.querySelector("canvas");
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `qrcode-semana-academica-${aluno.matricula}.png`;
      a.click();
    };
    new bootstrap.Modal($("modalSucesso")).show();
  }
})();
