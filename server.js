const http   = require('http');
const app    = require('./app');
const port   = process.env.PORT || 3000;
const server = http.createServer(app);

const mysql = require('./mysql').pool;

const io = require('socket.io')(server);
app.io = io;
  
io.sockets.on('connection', (socket) => {
    console.log('Conectou ID: ' + socket.id);

    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) };
        conn.query(
            'select * from usuarios;',
            (error, resultado, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) };
                
                socket.emit('ListaUsuarios', resultado);
 
            }
        )
    })

});

server.listen(port);