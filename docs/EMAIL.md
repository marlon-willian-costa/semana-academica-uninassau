# Disparo automático de e-mail (Squad 4)

Como o site é estático (GitHub Pages), o envio usa o **EmailJS**, que manda e-mails direto do navegador.

1. Criar conta em https://www.emailjs.com e conectar um serviço (Gmail/Outlook) → copiar o **Service ID**.
2. Criar um **Email Template**:
   - **To Email:** `{{to_email}}`
   - **Subject:** `Seu certificado — {{evento}}`
   - **Content:**
     ```
     Olá, {{to_name}}!

     Obrigado por participar da {{evento}}.
     Você cumpriu {{carga_horaria}} horas e seu certificado segue em anexo.

     Até a próxima edição!
     Coordenação da Semana Acadêmica UNINASSAU
     ```
   - Aba **Attachments → Add Attachment → Variable Attachment**: parâmetro `certificado_pdf`, nome `certificado.pdf`, tipo PDF.
3. Copiar o **Template ID** e a **Public Key** (Account → General).
4. Preencher `emailjs` em `js/config.js`. O botão "Enviar por e-mail" aparece automaticamente na página de certificado.

> O plano gratuito tem limite mensal de envios e de tamanho de anexo. O PDF com o fundo padrão tem poucos KB;
> com imagem de fundo oficial, use JPG comprimido.
