// Testes automatizados (Squad 5 — QA). Rodar com: node --test tests/
const test = require("node:test");
const assert = require("node:assert");
const V = require("../js/validacao.js");

test("CPF válido e inválido", () => {
  assert.ok(V.validarCPF("529.982.247-25"));
  assert.ok(V.validarCPF("52998224725"));
  assert.ok(!V.validarCPF("529.982.247-24"), "dígito verificador errado");
  assert.ok(!V.validarCPF("111.111.111-11"), "dígitos repetidos");
  assert.ok(!V.validarCPF("abc.def.ghi-jk"), "letras no CPF");
  assert.ok(!V.validarCPF(""), "vazio");
});

test("E-mail", () => {
  assert.ok(V.validarEmail("aluno@uninassau.edu.br"));
  assert.ok(!V.validarEmail("aluno@"));
  assert.ok(!V.validarEmail("aluno uninassau.com"));
  assert.ok(!V.validarEmail(""));
});

test("Nome completo", () => {
  assert.ok(V.validarNome("Maria da Silva"));
  assert.ok(V.validarNome("João D'Ávila"));
  assert.ok(!V.validarNome("Maria"), "sem sobrenome");
  assert.ok(!V.validarNome("Maria 123"), "números");
  assert.ok(!V.validarNome("<script>alert(1)</script> x"), "HTML");
});

test("Telefone e matrícula", () => {
  assert.ok(V.validarTelefone("(81) 99999-8888"));
  assert.ok(V.validarTelefone("(81) 3333-4444"));
  assert.ok(!V.validarTelefone("9999"));
  assert.ok(V.validarMatricula("01234567"));
  assert.ok(!V.validarMatricula("12"));
});

test("Máscaras", () => {
  assert.strictEqual(V.mascaraCPF("52998224725"), "529.982.247-25");
  assert.strictEqual(V.mascaraCPF("529abc98224725999"), "529.982.247-25");
  assert.strictEqual(V.mascaraTelefone("81999998888"), "(81) 99999-8888");
  assert.strictEqual(V.mascaraTelefone("8133334444"), "(81) 3333-4444");
  assert.strictEqual(V.mascaraNome("Ana123 Souza!"), "Ana Souza");
});

test("Normalização e escape", () => {
  assert.strictEqual(V.normalizarNome("  maria   DA silva "), "Maria da Silva");
  assert.strictEqual(V.escapeHTML('<b>"x"</b>'), "&lt;b&gt;&quot;x&quot;&lt;/b&gt;");
});
