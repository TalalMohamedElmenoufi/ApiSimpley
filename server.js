const http   = require('http');
const app    = require('./app')
const port   = process.env.PORT || 3000;
const server = http.createServer(app);

const io = require('socket.io')(server);
app.io = io;

io.sockets.on('connection', (socket) => {
    console.log('Conectou ID: ' + socket.id );
});

server.listen(port);