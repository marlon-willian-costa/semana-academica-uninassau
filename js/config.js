/**
 * CONFIGURAÇÃO CENTRAL — 6ª Semana Acadêmica UNINASSAU
 * Squad 1 (Tech Lead) é dono deste arquivo. Altere aqui datas, carga horária,
 * cursos e credenciais de integração (Base44 / EmailJS).
 */
window.APP_CONFIG = {
  evento: {
    nome: "6ª Semana Acadêmica UNINASSAU",
    local: "UNINASSAU — Auditório Principal",
    // Carga horária mínima para emissão do certificado (em horas)
    cargaMinima: 20,
    // Dias do evento — cada check-in vale as horas do dia
    dias: [
      { id: "D1", data: "2026-11-17", titulo: "Abertura & Palestra Magna", horas: 5, foto: "assets/img/hero.webp", posicao: "50% 40%",
        descricao: "Cerimônia de abertura e palestra magna reúnem a comunidade acadêmica no auditório principal." },
      { id: "D2", data: "2026-11-18", titulo: "Trilhas de Tecnologia", horas: 5, foto: "assets/img/hero.webp", posicao: "75% 60%",
        descricao: "Sessões técnicas por trilha, com foco nos cursos de tecnologia e nas tendências do mercado." },
      { id: "D3", data: "2026-11-19", titulo: "Workshops Práticos", horas: 5, foto: "assets/img/workshop.webp", posicao: "50% 40%",
        descricao: "Oficinas mão na massa para aplicar na prática o que foi visto nas trilhas." },
      { id: "D4", data: "2026-11-20", titulo: "Hackathon & Mesa-Redonda", horas: 5, foto: "assets/img/workshop.webp", posicao: "75% 50%",
        descricao: "Equipes resolvem desafios em tempo real e, em seguida, debatem em mesa-redonda." },
      { id: "D5", data: "2026-11-21", titulo: "Mostra de Projetos & Encerramento", horas: 5, foto: "assets/img/mostra.webp", posicao: "50% 50%",
        descricao: "Os projetos da turma são apresentados a professores e visitantes, com encerramento do evento." }
    ]
  },

  cursos: [
    "Análise e Desenvolvimento de Sistemas",
    "Ciência da Computação",
    "Sistemas de Informação",
    "Engenharia de Software",
    "Redes de Computadores",
    "Administração",
    "Direito",
    "Enfermagem",
    "Psicologia",
    "Outro"
  ],

  backend: {
    // "local"  -> salva no localStorage do navegador (demo / desenvolvimento)
    // "base44" -> usa a API REST de entidades do Base44
    modo: "local",
    base44: {
      baseUrl: "https://app.base44.com/api/apps",
      appId: "",   // ex.: "6730f0c1e2..." (painel Base44 > Settings)
      apiKey: ""   // ATENÇÃO: chave exposta no front-end. Veja docs/SEGURANCA.md
    }
  },

  // Envio automático de e-mail (opcional) — https://www.emailjs.com
  emailjs: {
    publicKey: "",
    serviceId: "",
    templateId: ""
  },

  // PIN simples para o painel do professor (barreira de uso, não é autenticação forte)
  pinProfessor: "2026",

  certificado: {
    // Imagem de fundo oficial (PNG/JPG, A4 paisagem, 3508x2480 recomendado).
    // Se não existir, o sistema desenha um fundo padrão azul/amarelo.
    template: "assets/certificado-template.png",
    // Posições em mm (A4 paisagem = 297 x 210)
    posNome: { y: 105, tamanho: 30 },
    posTexto: { y: 122, tamanho: 14 }
  }
};
