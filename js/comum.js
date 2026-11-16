/** Utilitários de interface compartilhados entre as páginas. */
const UI = {
  toast(msg, tipo = "success") {
    let box = document.querySelector(".toast-container");
    if (!box) {
      box = document.createElement("div");
      box.className = "toast-container position-fixed top-0 end-0 p-3";
      document.body.appendChild(box);
    }
    const el = document.createElement("div");
    el.className = `toast align-items-center text-bg-${tipo} border-0`;
    el.setAttribute("role", "alert");
    el.innerHTML = `<div class="d-flex"><div class="toast-body"></div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
    el.querySelector(".toast-body").textContent = msg;
    box.appendChild(el);
    const t = new bootstrap.Toast(el, { delay: 3500 });
    el.addEventListener("hidden.bs.toast", () => el.remove());
    t.show();
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
    if (DB.modo === "local") {
      const el = document.getElementById("avisoModo");
      if (el) el.classList.remove("d-none");
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();
  UI.avisoModo();
});
