const express = require('express');
const router = express.Router();

const usuarios = require('../controllers/usuarios');

router.get('/', usuarios.listaUsuarios);

router.post('/criarUser', usuarios.insertUsuario);

router.post('/criarCar', usuarios.insertVeiculo);

router.post('/criarPayment', usuarios.insertPayment);

router.get('/:id_usuario', usuarios.idUsuario);

router.patch('/', usuarios.updatetUsuario);

router.delete('/', usuarios.deletetUsuario);

router.post('/email', usuarios.checkUser);

router.get('/address/:address', usuarios.address);

router.post('/pre-ride', usuarios.preRide);

router.put('/socket/:id', usuarios.socket);

module.exports = router;