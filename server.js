// Ponto de entrada para hospedagens que rodam a aplicação via um servidor Node.js customizado
// (ex.: Hostinger "App Node.js", que usa Phusion Passenger e precisa de um arquivo que escute
// em process.env.PORT), em vez do CLI "next start". Não usado em desenvolvimento (`npm run dev`
// continua usando o CLI padrão do Next.js).
const { createServer } = require("http");
const next = require("next");

const port = process.env.PORT || 3000;
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, () => {
    console.log(`FA Perfumaria pronta na porta ${port}`);
  });
});
