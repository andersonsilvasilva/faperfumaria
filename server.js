// Ponto de entrada para hospedagens que rodam a aplicação via um servidor Node.js customizado
// (ex.: Hostinger "App Node.js", que usa Phusion Passenger e precisa de um arquivo que escute
// em process.env.PORT), em vez do CLI "next start". Não usado em desenvolvimento (`npm run dev`
// continua usando o CLI padrão do Next.js).
const { createServer } = require("http");
const next = require("next");

const port = process.env.PORT || 3000;
const app = next({ dev: false });
const handle = app.getRequestHandler();

// Uma exceção não tratada aqui derrubaria o processo inteiro (e todas as requisições em
// andamento, o que o navegador mostra como falha de conexão, não como um 500 de verdade). Logar
// e manter o processo de pé é sempre melhor do que isso.
process.on("uncaughtException", (error) => {
  console.error("uncaughtException:", error);
});
process.on("unhandledRejection", (reason) => {
  console.error("unhandledRejection:", reason);
});

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res).catch((error) => {
      console.error("Erro ao processar requisição:", error);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end("Internal Server Error");
      }
    });
  }).listen(port, () => {
    console.log(`FA Perfumaria pronta na porta ${port}`);
  });
});
