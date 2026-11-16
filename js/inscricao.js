/** Home: programação, contagem, perguntas e Tela de Inscrição Blindada — Squad 2 */
(() => {
  const cfg = window.APP_CONFIG;
  const V = window.Validacao;
  const $ = (id) => document.getElementById(id);
  const dias = cfg.evento.dias;
  const totalHoras = dias.reduce((s, d) => s + d.horas, 0);
  const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

  // ---------- Conteúdo vindo da configuração ----------
  $("localEvento").textContent = cfg.evento.local;
  $("nDias").dataset.contar = dias.length;
  $("cargaTotal").dataset.contar = totalHoras;
  $("cargaMin").dataset.contar = cfg.evento.cargaMinima;
  $("cargaTotalSub").textContent = totalHoras;
  document.querySelectorAll(".cargaMinTxt").forEach((el) => (el.textContent = cfg.evento.cargaMinima));
  document.querySelectorAll(".cargaTotalTxt").forEach((el) => (el.textContent = totalHoras));
  (() => {
    const [a1, m1, d1] = dias[0].data.split("-").map(Number);
    const [a2, m2, d2] = dias[dias.length - 1].data.split("-").map(Number);
    $("periodoEvento").textContent = m1 === m2 && a1 === a2
      ? `${d1} a ${d2} de ${MESES[m1 - 1]} de ${a1}`
      : `${d1} de ${MESES[m1 - 1]} a ${d2} de ${MESES[m2 - 1]} de ${a2}`;
  })();

  // ---------- Contagem regressiva ----------
  const inicio = new Date(`${dias[0].data}T00:00:00`);
  const fim = new Date(`${dias[dias.length - 1].data}T23:59:59`);
  function contagem() {
    const agora = new Date();
    const b = $("contagem"), r = $("contagemRotulo");
    if (agora < inicio) {
      const min = Math.floor((inicio - agora) / 60000);
      const d = Math.floor(min / 1440), h = Math.floor((min % 1440) / 60), m = min % 60;
      b.textContent = d > 0 ? `${d}d ${h}h` : `${h}h ${String(m).padStart(2, "0")}min`;
      r.textContent = "para o início";
    } else if (agora <= fim) {
      b.textContent = "Agora"; r.textContent = "o evento está acontecendo";
    } else {
      b.textContent = "Encerrado"; r.textContent = "obrigado por participar";
    }
  }
  contagem();
  setInterval(contagem, 30000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) contagem(); });

  // ---------- Programação: faixa de dias + painel ----------
  const abas = $("abasDias"), painel = $("painelDia");
  const hoje = UI.hojeISO();
  abas.innerHTML = dias.map((d, i) => {
    const dia = d.data.split("-")[2];
    const sem = UI.dataBR(d.data).split(",")[0];
    return `<button type="button" role="tab" class="dia-aba${d.data === hoje ? " hoje" : ""}" id="aba-${d.id}" data-i="${i}" aria-controls="painelDia" aria-selected="false" tabindex="-1">
      <small>${sem}</small><b>${dia}</b></button>`;
  }).join("");

  const palcoFoto = $("palcoFoto");
  function mostrarDia(i, foco) {
    const d = dias[i];
    [...abas.children].forEach((b, k) => { b.setAttribute("aria-selected", String(k === i)); b.tabIndex = k === i ? 0 : -1; });
    painel.setAttribute("aria-labelledby", "aba-" + d.id);
    palcoFoto.style.opacity = "0";
    setTimeout(() => {
      palcoFoto.src = d.foto || "assets/img/hero.webp";
      palcoFoto.style.objectPosition = d.posicao || "50% 50%";
      palcoFoto.style.opacity = "1";
    }, 180);
    painel.innerHTML = `
      <div class="dia-numero" aria-hidden="true">${d.data.split("-")[2]}</div>
      <ul class="chips"><li class="chip"><i class="bi bi-calendar-event" aria-hidden="true"></i> ${UI.dataBR(d.data)}</li><li class="chip"><i class="bi bi-hourglass-split" aria-hidden="true"></i> ${d.horas}h de certificado</li></ul>
      <h3>Dia ${i + 1} · ${V.escapeHTML(d.titulo)}</h3>
      <p>${V.escapeHTML(d.descricao || "")}</p>
      <a class="botao botao--azul" href="#inscricao" style="justify-self:start"><i class="bi bi-pencil-square" aria-hidden="true"></i> Quero participar</a>`;
    if (foco) abas.children[i].focus();
  }
  // ---- a rolagem troca o dia: a seção fica fixa na tela e o avanço escolhe 17 → 21
  const trilho = $("trilhoDias"), barra = $("barraDias");
  let atual = -1, noTrilho = false, esperaClique = 0;
  const trecho = () => { const r = trilho.getBoundingClientRect(); return { topo: r.top + scrollY, util: trilho.offsetHeight - innerHeight }; };
  function pelaRolagem() {
    if (!noTrilho) return;
    const { topo, util } = trecho();
    const p = Math.max(0, Math.min(1, (scrollY - topo) / Math.max(1, util)));
    barra.style.setProperty("--p", p.toFixed(3));
    if (performance.now() < esperaClique) return;
    const i = Math.min(dias.length - 1, Math.floor(p * dias.length));
    if (i !== atual) { atual = i; mostrarDia(i); }
  }
  new IntersectionObserver(([e]) => { noTrilho = e.isIntersecting; pelaRolagem(); }, { rootMargin: "0px" }).observe(trilho);
  let aguarda = false;
  addEventListener("scroll", () => { if (!aguarda) { aguarda = true; requestAnimationFrame(() => { aguarda = false; pelaRolagem(); }); } }, { passive: true });
  function irParaDia(i, foco) {
    const { topo, util } = trecho();
    atual = i; mostrarDia(i, foco);
    esperaClique = performance.now() + 900;
    const alvo = topo + (i + 0.5) / dias.length * util;
    scrollTo({ top: alvo, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  abas.addEventListener("click", (e) => { const b = e.target.closest(".dia-aba"); if (b) irParaDia(+b.dataset.i); });
  abas.addEventListener("keydown", (e) => {
    const n = dias.length;
    const alvo = { ArrowRight: (atual + 1) % n, ArrowLeft: (atual - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
    if (alvo !== undefined) { e.preventDefault(); irParaDia(alvo, true); }
  });
  atual = 0; mostrarDia(0);

  // ---------- Perguntas frequentes: abrir uma fecha a outra ----------
  const itens = [...document.querySelectorAll("#faq .faq-item")];
  itens.forEach((it) => it.querySelector("button").addEventListener("click", () => {
    const abrir = !it.classList.contains("aberto");
    itens.forEach((o) => { o.classList.remove("aberto"); o.querySelector("button").setAttribute("aria-expanded", "false"); });
    if (abrir) { it.classList.add("aberto"); it.querySelector("button").setAttribute("aria-expanded", "true"); }
  }));
  // ---------- "Pergunte a uma IA": a pergunta já vai pronta ----------
  const pergunta = "O que é a 6ª Semana Acadêmica da UNINASSAU e como funcionam a inscrição, a frequência por QR Code e o certificado de " + cfg.evento.cargaMinima + " horas?"
    + (/^(localhost|127\.|0\.0\.0\.0)/.test(location.hostname) || location.protocol === "file:" ? "" : " Use " + location.origin + " como referência.");
  const q = encodeURIComponent(pergunta);
  const destinos = { chatgpt: `https://chatgpt.com/?q=${q}`, google: `https://www.google.com/search?udm=50&q=${q}`, perplexity: `https://www.perplexity.ai/search?q=${q}` };
  document.querySelectorAll(".pia-b[data-ia]").forEach((a) => { a.href = destinos[a.dataset.ia]; });

  // ---------- Formulário ----------
  const selCurso = $("curso");
  cfg.cursos.forEach((c) => selCurso.add(new Option(c, c)));
  UI.select(selCurso);

  const mascaras = { cpf: V.mascaraCPF, telefone: V.mascaraTelefone, matricula: V.mascaraMatricula, nome: V.mascaraNome };
  Object.entries(mascaras).forEach(([id, fn]) => {
    $(id).addEventListener("input", (e) => { e.target.value = fn(e.target.value); });
  });

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
  Object.keys(regras).forEach((id) => {
    $(id).addEventListener("blur", () => validarCampo(id));
    $(id).addEventListener("change", () => validarCampo(id));
  });
  $("lgpd").addEventListener("change", (e) => e.target.classList.toggle("is-invalid", !e.target.checked));

  // ---------- Envio (protegido contra clique duplo) ----------
  const form = $("formInscricao");
  const btn = $("btnSalvar");
  let enviando = false;

  function setCarregando(on) {
    enviando = on;
    btn.disabled = on;
    btn.querySelector(".girar").hidden = !on;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (enviando) return;

    const camposOk = Object.keys(regras).map(validarCampo).every(Boolean);
    const lgpd = $("lgpd");
    lgpd.classList.toggle("is-invalid", !lgpd.checked);
    if (!camposOk || !lgpd.checked) {
      (form.querySelector("input.is-invalid") || form.querySelector(".sel.is-invalid .sel__botao"))?.focus();
      UI.toast("Corrija os campos destacados.", "danger");
      return;
    }

    setCarregando(true);
    try {
      const dados = Object.fromEntries(Object.keys(regras).map((id) => [id, $(id).value]));
      const aluno = await DB.cadastrarAluno(dados);
      form.reset();
      UI.sincronizarSelect(selCurso);
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
  const janela = UI.modal("modalSucesso");
  function mostrarSucesso(aluno) {
    $("sucessoNome").textContent = aluno.nome;
    $("sucessoCodigo").textContent = aluno.id;
    const box = $("qrcode");
    box.innerHTML = "";
    new QRCode(box, { text: "SA6:" + aluno.id, width: 200, height: 200, colorDark: "#1f3467" });
    $("btnBaixarQR").onclick = () => {
      const canvas = box.querySelector("canvas");
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `qrcode-semana-academica-${aluno.matricula}.png`;
      a.click();
    };
    janela.abrir();
  }
})();
