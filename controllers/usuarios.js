
const mysql = require('../mysql').pool;

const googleMaps = require('../services/googleMaps');

exports.listaUsuarios = (req, res, next) => {

    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) };
        conn.query(
            'select * from usuarios;',
            (error, resultado, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) };

                res.status(200).send({
                    response: resultado
                })
            }
        )
    })

}

exports.insertUsuario = (req, res, next) => {

    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) };
        conn.query(
            'insert into usuarios (fbId, nome, email, tipo, accessToken) value (?, ?, ?, ?, ?)',
            [
                req.body.fbId,
                req.body.nome,
                req.body.email,
                req.body.tipo,
                req.body.accessToken,
            ],
            (error, resultado, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) };
                res.status(201).send({
                    user: {
                        fbId: req.body.fbId,
                        nome: req.body.nome,
                        email: req.body.email,
                        tipo: req.body.tipo,
                        accessToken: req.body.accessToken,
                        id: resultado.insertId

                    }
                })

            }
        )
    });

}


exports.insertVeiculo = (req, res, next) => {

    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) };
        conn.query(
            'insert into veiculos (id_usuario, placa, marca, modelo, cor) value (?, ?, ?, ?, ?)',
            [
                req.body.id_usuario,
                req.body.placa,
                req.body.marca,
                req.body.modelo,
                req.body.cor,
            ],
            (error, resultado, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) };
                res.status(201).send({
                    car: {
                        placa: req.body.placa,
                        marca: req.body.marca,
                        modelo: req.body.modelo,
                        cor: req.body.cor
                    }
                })
            }
        )
    });

}


exports.insertPayment = (req, res, next) => {

    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) };
        conn.query(
            'insert into payments (id_usuario, nome, numero, validade, cvv) value (?, ?, ?, ?, ?)',
            [
                req.body.id_usuario,
                req.body.nome,
                req.body.numero,
                req.body.validade,
                req.body.cvv,
            ],
            (error, resultado, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) };
                res.status(201).send({
                    payment: {
                        nome: req.body.nome,
                        numero: req.body.numero,
                        validade: req.body.validade,
                        cvv: req.body.cvv
                    }
                })
            }
        )
    });

}


exports.idUsuario = (req, res, next) => {

    const id = req.params.id_usuario;

    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) };
        conn.query(
            'select * from usuarios where id = ? ; ',
            [id],
            (error, resultado, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) };

                res.status(200).send({
                    response: resultado
                });

            }
        )
    })

}

exports.updatetUsuario = (req, res, next) => {

    const id = req.body.id_usuario;
    const nome = req.body.nome;
    const email = req.body.email;

    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) };
        conn.query(
            `update usuarios set
             nome = ?,
             email = ?
             where id = ?`,
            [nome, email, id],
            (error, resultado, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) };
                res.status(202).send({
                    mensagem: 'usuarios atualizado com sucesso!',
                    response: resultado
                })
            }
        )
    })

}

exports.deletetUsuario = (req, res, next) => {

    const id = req.body.id_usuario;

    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) };
        conn.query(
            `delete from usuarios where id = ?`,
            [id],
            (error, resultado, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) };
                res.status(202).send({
                    mensagem: 'usuarios removido com sucesso!',
                    response: resultado
                })
            }
        )
    })

}

exports.checkUser = (req, res, next) => {

    const email = req.body.email;

    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) };
        conn.query(
            'select * from usuarios where email = ? ; ',
            [email],
            (error, resultado, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) };

                res.status(200).send({
                    error: false,
                    user: resultado[0]
                });


            }
        )
    })

}

exports.address = async (req, res, next) => {

    try{
        const list = await googleMaps.getPlaces(
            encodeURIComponent(req.params.address)
        );

        if(list.error){
            throw list.message;
        }

        const addressList = list.data.predictions.map( addr => {
            const { 
                place_id, 
                description, 
                structured_formatting: { secondary_text }
            } = addr;

            return { place_id, description, secondary_text  }
        });

        res.json({ error: false, list: addressList });

    }catch(err){
        res.json({ error: true, massage: err.message });
    }

}

exports.preRide = async (req, res, next) => {

    try{

        const { origin, destination } = req.body;

        const routeRequest = await googleMaps.getRoute(origin, destination);

        if (routeRequest.error){
            throw routeRequest.message;
        }

        const { 
            distance,
            duration,
            start_address,
            end_address,
            steps,
        } = routeRequest.data.routes[0].legs[0];


        const route = steps.map(step => {
            return  {
                        latitude: step.start_location.lat,
                        longitude: step.start_location.lng,
                    },
                    {
                        latitude: step.end_location.lat,
                        longitude: step.end_location.lng,
                    }
          });

        const price = (distance.value / 1000 * 2.67).toFixed(2);

        res.json({ error: false, info: { distance, duration, start_address, end_address, route, price }   });

        res.json(routeRequest);

    }catch(err){
        res.json({ error: true, message: err.message });
    }

}

exports.socket = async (req, res, next) => {

    const { id } = req.params;
    const { socketId } = req.body;

    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) };
        conn.query(
            `update usuarios set
             socketId = ?
             where id = ?`,
            [socketId, id],
            (error, resultado, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) };

                res.status(202).send({
                    error: false
                })
            }
        )
    })

}


exports.socketCoods = async (req, res, next) => {

    const { id } = req.params;
    const { MinhaLat } = req.body;
    const { Minhalng } = req.body;

    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) };
        conn.query(
            `update usuarios set
             latitude = ?,
             longitude = ?
             where id = ?`,
            [MinhaLat, Minhalng, id],
            (error, resultado, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) };

                res.status(202).send({
                    error: false
                })
            }
        )
    })

}