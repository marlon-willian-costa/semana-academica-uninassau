/**
 * Validações e máscaras — Squad 2 (Front-end) + Squad 5 (QA)
 * Funciona no navegador (window.Validacao) e no Node (testes automatizados).
 */
(function (root) {
  const soDigitos = (v) => String(v || "").replace(/\D/g, "");

  function validarCPF(valor) {
    const cpf = soDigitos(valor);
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    for (let t = 9; t < 11; t++) {
      let soma = 0;
      for (let i = 0; i < t; i++) soma += Number(cpf[i]) * (t + 1 - i);
      const dig = ((soma * 10) % 11) % 10;
      if (dig !== Number(cpf[t])) return false;
    }
    return true;
  }

  function validarEmail(valor) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(valor || "").trim());
  }

  function validarNome(valor) {
    const nome = String(valor || "").trim().replace(/\s+/g, " ");
    // Somente letras (com acento), espaços, apóstrofo e hífen; pelo menos nome + sobrenome
    return /^[A-Za-zÀ-ÖØ-öø-ÿ'\-]+( [A-Za-zÀ-ÖØ-öø-ÿ'\-]+)+$/.test(nome) && nome.length <= 120;
  }

  function validarTelefone(valor) {
    const d = soDigitos(valor);
    return d.length === 10 || d.length === 11;
  }

  function validarMatricula(valor) {
    const d = soDigitos(valor);
    return d.length >= 5 && d.length <= 15;
  }

  // ---------- Máscaras ----------
  function mascaraCPF(v) {
    const d = soDigitos(v).slice(0, 11);
    return d
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  function mascaraTelefone(v) {
    const d = soDigitos(v).slice(0, 11);
    if (d.length <= 2) return d.length ? "(" + d : "";
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }

  function mascaraMatricula(v) {
    return soDigitos(v).slice(0, 15);
  }

  function mascaraNome(v) {
    // Remove números e símbolos enquanto digita
    return String(v || "").replace(/[^A-Za-zÀ-ÖØ-öø-ÿ'\- ]/g, "").replace(/\s{2,}/g, " ");
  }

  function normalizarNome(v) {
    const minus = ["da", "de", "do", "das", "dos", "e"];
    return String(v || "")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase()
      .split(" ")
      .map((p, i) => (i > 0 && minus.includes(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)))
      .join(" ");
  }

  function escapeHTML(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  const api = {
    soDigitos, validarCPF, validarEmail, validarNome, validarTelefone, validarMatricula,
    mascaraCPF, mascaraTelefone, mascaraMatricula, mascaraNome, normalizarNome, escapeHTML
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Validacao = api;
})(typeof window !== "undefined" ? window : globalThis);
