/** Interface compartilhada entre as páginas — sem Bootstrap, nada de componente nativo. */
const UI = {
  /** Aviso no topo da tela. tipo: success | danger | warning | info */
  toast(msg, tipo = "success") {
    let box = document.querySelector(".avisos");
    if (!box) {
      box = document.createElement("div");
      box.className = "avisos";
      box.setAttribute("role", "status");
      box.setAttribute("aria-live", "polite");
      document.body.appendChild(box);
    }
    const icones = { success: "check-circle-fill", danger: "x-octagon-fill", warning: "exclamation-triangle-fill", info: "info-circle-fill" };
    const el = document.createElement("div");
    el.className = `aviso aviso--${tipo}`;
    el.innerHTML = `<i class="bi bi-${icones[tipo] || icones.info}" aria-hidden="true"></i><span></span>`;
    el.querySelector("span").textContent = msg;
    box.appendChild(el);
    setTimeout(() => { el.style.transition = "opacity .3s"; el.style.opacity = "0"; setTimeout(() => el.remove(), 320); }, 4200);
  },

  dataBR(iso) {
    const [a, m, d] = iso.split("-");
    const sem = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][new Date(+a, m - 1, +d).getDay()];
    return `${sem}, ${d}/${m}`;
  },

  hojeISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  },

  avisoModo() {
    if (typeof DB !== "undefined" && DB.modo === "local") {
      const el = document.getElementById("avisoModo");
      if (el && !el.querySelector("button")) {
        const x = document.createElement("button");
        x.type = "button"; x.setAttribute("aria-label", "Fechar aviso");
        x.innerHTML = '<i class="bi bi-x-lg" aria-hidden="true"></i>';
        x.addEventListener("click", () => (el.hidden = true));
        el.appendChild(x);
      }
      if (el) { el.hidden = false; setTimeout(() => { el.style.opacity = '0'; setTimeout(() => (el.hidden = true), 450); }, 9000); }
    }
  },

  /** Janela própria: fecha no X, no Esc e no fundo. Devolve { abrir, fechar }. */
  modal(id, { aoFechar, fechaNoFundo = true } = {}) {
    const el = document.getElementById(id);
    let anterior = null;
    const focaveis = () => [...el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((x) => !x.disabled && x.offsetParent !== null);
    const teclas = (e) => {
      if (e.key === "Escape") { e.preventDefault(); fechar(); return; }
      if (e.key !== "Tab") return;
      const f = focaveis();
      if (!f.length) return;
      const primeiro = f[0], ultimo = f[f.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
    };
    function abrir() {
      anterior = document.activeElement;
      el.classList.add("aberta");
      el.setAttribute("aria-hidden", "false");
      document.documentElement.style.overflow = "hidden";
      requestAnimationFrame(() => el.classList.add("visivel"));
      document.addEventListener("keydown", teclas);
      setTimeout(() => (el.querySelector("[data-foco]") || focaveis()[0])?.focus(), 60);
    }
    function fechar() {
      if (!el.classList.contains("aberta")) return;
      el.classList.remove("visivel");
      el.setAttribute("aria-hidden", "true");
      document.removeEventListener("keydown", teclas);
      document.documentElement.style.overflow = "";
      setTimeout(() => { el.classList.remove("aberta"); anterior?.focus?.(); aoFechar?.(); }, 260);
    }
    el.querySelectorAll("[data-fechar]").forEach((b) => b.addEventListener("click", fechar));
    if (fechaNoFundo) el.querySelector(".janela__fundo")?.addEventListener("click", fechar);
    return { abrir, fechar, el };
  },

  /** Troca o <select> nativo por uma lista desenhada. O select continua sendo a fonte do valor. */
  select(sel) {
    if (sel._sel) return sel._sel;
    const wrap = document.createElement("div");
    wrap.className = "sel";
    sel.parentNode.insertBefore(wrap, sel);
    wrap.appendChild(sel);
    sel.tabIndex = -1;
    sel.setAttribute("aria-hidden", "true");
    // a classe is-invalid precisa vir ANTES do .sel para o seletor irmão enxergar
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "sel__botao";
    botao.setAttribute("aria-haspopup", "listbox");
    botao.setAttribute("aria-expanded", "false");
    const label = document.querySelector(`label[for="${sel.id}"]`);
    if (label) { if (!label.id) label.id = sel.id + "-rotulo"; botao.setAttribute("aria-labelledby", label.id); label.addEventListener("click", (e) => { e.preventDefault(); botao.focus(); }); }
    botao.innerHTML = '<span></span><i class="bi bi-chevron-down" aria-hidden="true"></i>';
    wrap.appendChild(botao);
    const lista = document.createElement("ul");
    lista.className = "sel__lista";
    lista.setAttribute("role", "listbox");
    lista.hidden = true;
    wrap.appendChild(lista);
    // mover o botão para o mesmo "nível" do select: o .sel vem logo depois de select.is-invalid
    wrap.parentNode.insertBefore(wrap, wrap); // no-op, mantém a ordem
    const texto = botao.querySelector("span");
    let ativa = -1;

    const opcoes = () => [...sel.options].filter((o) => !o.disabled);
    function sincronizar() {
      const o = sel.options[sel.selectedIndex];
      const vazio = !o || o.disabled || !sel.value;
      texto.textContent = vazio ? (sel.options[0]?.text || "Selecione…") : o.text;
      texto.classList.toggle("vazio", vazio);
    }
    function montar() {
      lista.innerHTML = "";
      opcoes().forEach((o, i) => {
        const li = document.createElement("li");
        li.className = "sel__opcao";
        li.setAttribute("role", "option");
        li.dataset.i = i;
        li.setAttribute("aria-selected", String(o.value === sel.value));
        li.innerHTML = `<span></span>${o.value === sel.value ? '<i class="bi bi-check2" aria-hidden="true"></i>' : ""}`;
        li.firstChild.textContent = o.text;
        li.addEventListener("click", () => escolher(i));
        lista.appendChild(li);
      });
    }
    function marcar(i) {
      ativa = i;
      [...lista.children].forEach((li, k) => li.classList.toggle("ativa", k === i));
      lista.children[i]?.scrollIntoView({ block: "nearest" });
    }
    function abrir() {
      montar();
      lista.hidden = false;
      wrap.classList.add("aberto");
      botao.setAttribute("aria-expanded", "true");
      const r = botao.getBoundingClientRect();
      lista.classList.toggle("sobe", window.innerHeight - r.bottom < 280 && r.top > window.innerHeight - r.bottom);
      marcar(Math.max(0, opcoes().findIndex((o) => o.value === sel.value)));
    }
    function fechar() {
      lista.hidden = true;
      wrap.classList.remove("aberto");
      botao.setAttribute("aria-expanded", "false");
    }
    function escolher(i) {
      const o = opcoes()[i];
      if (!o) return;
      sel.value = o.value;
      sync();
      sel.dispatchEvent(new Event("change", { bubbles: true }));
      sel.dispatchEvent(new Event("blur"));
      fechar();
      botao.focus();
    }
    function sync() { sincronizar(); }
    botao.addEventListener("click", () => (lista.hidden ? abrir() : fechar()));
    botao.addEventListener("keydown", (e) => {
      const n = opcoes().length;
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        if (lista.hidden) { abrir(); return; }
        if (e.key === "ArrowDown") marcar(Math.min(n - 1, ativa + 1));
        else if (e.key === "ArrowUp") marcar(Math.max(0, ativa - 1));
        else escolher(ativa);
      } else if (e.key === "Escape" && !lista.hidden) { e.preventDefault(); e.stopPropagation(); fechar(); }
      else if (e.key === "Tab") fechar();
    });
    document.addEventListener("pointerdown", (e) => { if (!wrap.contains(e.target)) fechar(); });
    sel.focus = () => botao.focus();
    sync();
    sel._sel = { sincronizar: sync };
    // select.is-invalid precisa ser irmão imediato do .sel: coloca a classe no wrapper também
    new MutationObserver(() => {
      wrap.classList.toggle("is-invalid", sel.classList.contains("is-invalid"));
      wrap.classList.toggle("is-valid", sel.classList.contains("is-valid"));
    }).observe(sel, { attributes: true, attributeFilter: ["class"] });
    return sel._sel;
  },

  /** Faz o select mostrar o valor depois de mudar por código. */
  sincronizarSelect(sel) { sel._sel?.sincronizar(); }
};

document.addEventListener("DOMContentLoaded", () => {
  const raiz = document.documentElement;
  const semMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
  raiz.classList.add("js-ok");

  document.querySelectorAll("[data-ano]").forEach((el) => (el.textContent = new Date().getFullYear()));
  UI.avisoModo();

  // ---- acessibilidade: tamanho de letra e contraste, lembrados neste navegador
  const guarda = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (_) {} };
  const le = (k) => { try { return localStorage.getItem(k); } catch (_) { return null; } };
  const fonte = le("sa6_fonte"); if (fonte) raiz.dataset.fonte = fonte;
  if (le("sa6_contraste") === "alto") raiz.dataset.contraste = "alto";
  const btnContraste = document.querySelector("[data-contraste]");
  const sincContraste = () => btnContraste?.setAttribute("aria-pressed", String(raiz.dataset.contraste === "alto"));
  sincContraste();
  document.querySelector("[data-fonte-mais]")?.addEventListener("click", () => {
    const n = Math.min(2, +(raiz.dataset.fonte || 0) + 1); raiz.dataset.fonte = n; guarda("sa6_fonte", n);
  });
  document.querySelector("[data-fonte-menos]")?.addEventListener("click", () => {
    const n = Math.max(0, +(raiz.dataset.fonte || 0) - 1);
    if (n === 0) delete raiz.dataset.fonte; else raiz.dataset.fonte = n;
    guarda("sa6_fonte", n || null);
  });
  btnContraste?.addEventListener("click", () => {
    if (raiz.dataset.contraste === "alto") { delete raiz.dataset.contraste; guarda("sa6_contraste", null); }
    else { raiz.dataset.contraste = "alto"; guarda("sa6_contraste", "alto"); }
    sincContraste();
  });

  // ---- cabeçalho: estendido no topo, cápsula depois da primeira rolagem (sentinela, sem evento de scroll)
  const topo = document.querySelector("[data-topo]");
  if (topo) {
    const s = document.createElement("div");
    s.setAttribute("aria-hidden", "true");
    s.style.cssText = "position:absolute;top:0;left:0;width:1px;height:24px;pointer-events:none";
    document.body.prepend(s);
    new IntersectionObserver(([e]) => topo.classList.toggle("rolado", !e.isIntersecting)).observe(s);
  }

  // ---- gaveta do celular
  const gaveta = document.getElementById("gaveta");
  if (gaveta) {
    const abrir = () => { gaveta.classList.add("aberta"); requestAnimationFrame(() => gaveta.classList.add("visivel")); document.documentElement.style.overflow = "hidden"; gaveta.querySelector("a,button")?.focus(); };
    const fechar = () => { gaveta.classList.remove("visivel"); document.documentElement.style.overflow = ""; setTimeout(() => gaveta.classList.remove("aberta"), 320); };
    document.querySelector("[data-menu]")?.addEventListener("click", abrir);
    gaveta.querySelectorAll("[data-fechar], a").forEach((el) => el.addEventListener("click", fechar));
    gaveta.querySelector(".gaveta__fundo")?.addEventListener("click", fechar);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && gaveta.classList.contains("aberta")) fechar(); });
  }

  // ---- revelar ao entrar na tela, com escalonamento
  document.querySelectorAll(".revelar").forEach((el) => {
    const irmaos = [...el.parentElement.children].filter((x) => x.classList.contains("revelar"));
    el.style.setProperty("--i", Math.min(irmaos.indexOf(el), 6));
  });
  const contar = (el) => {
    const alvo = parseFloat(el.dataset.contar);
    const suf = el.dataset.sufixo || "";
    if (semMovimento) { el.textContent = alvo + suf; return; }
    const t0 = performance.now(), dur = 1100;
    const passo = (t) => { const p = Math.min(1, (t - t0) / dur); el.textContent = Math.round(alvo * (1 - Math.pow(1 - p, 3))) + suf; if (p < 1) requestAnimationFrame(passo); };
    requestAnimationFrame(passo);
  };
  const io = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("visivel");
      e.target.querySelectorAll?.("[data-contar]").forEach(contar);
      if (e.target.dataset.contar) contar(e.target);
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  document.querySelectorAll(".revelar, [data-contar]").forEach((el) => io.observe(el));

  // ---- paralaxe leve das fotos de fundo (só transform, só enquanto à vista)
  const fotos = [...document.querySelectorAll("[data-paralaxe]")];
  if (fotos.length && !semMovimento) {
    const vistas = new Set();
    const io2 = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? vistas.add(e.target) : vistas.delete(e.target))), { rootMargin: "20% 0px" });
    fotos.forEach((f) => io2.observe(f));
    let ticking = false;
    const aplica = () => {
      vistas.forEach((f) => {
        const r = f.getBoundingClientRect();
        const y = Math.max(-60, Math.min(60, (r.top + r.height / 2 - innerHeight / 2) * -0.1));
        f.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
      });
      ticking = false;
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(aplica); } }, { passive: true });
    aplica();
  }
});
