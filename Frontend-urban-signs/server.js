const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);

// Middleware para CORS con credenciales
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200'); // tu frontend
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

server.use(router);

server.listen(3000, () => {
  console.log('JSON Server escuchando en http://localhost:3000');
});
