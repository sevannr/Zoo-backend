'use strictt'

// constants
const CONSTANTS = require('./../constants/constants');
// modules
var bcrypt = require('bcrypt-nodejs');
// models
var Response = require('./../models/response')
var User = require('./../models/user');
// services
var jwt = require('./../services/jwt');

// actions
function pruebas(req, res) {
    res.status(200).send(new Response({
        isSuccess: true,
        message: 'Testing user controller and function pruebas',
        result: req.user
    }));
}

function login(req, res) {
    var params = req.body;
    var { email, password } = params;

    User.findOne({ email: email.toLowerCase() }, (err, user) => {
        if (err) {
            res.status(500).send(new Response({
                isSuccess: false,
                message: CONSTANTS.BD_ERROR_500
            }));
        } else {
            user ?
                bcrypt.compare(password, user.password, (err, check) => {
                    if (check) {
                        if (params.gettoken) {
                            res.status(200).send(new Response({
                                isSuccess: true,
                                result: jwt.createToken(user)
                            }));
                        } else {
                            res.status(200).send(new Response({
                                isSuccess: true,
                                result: user
                            }));
                        }
                    } else {
                        res.status(401).send(new Response({
                            isSuccess: true,
                            result: 'User or password incorrect'
                        }));
                    }
                }) :
                res.status(404).send(new Response({
                    isSuccess: false,
                    message: CONSTANTS.BD_ERROR_404
                }));
        }
    });
}


function save(req, res) {
    var params = req.body;

    if (params.password && params.name && params.email) {
        var user = new User({} = params);

        bcrypt.hash(params.password, null, null, function(err, hash) {
            user.password = hash;
            user.email = user.email.toLowerCase();

            User.findOne({ email: user.email }, (err, issetUser) => {
                if (err) {
                    res.status(500).send(new Response({
                        isSuccess: false,
                        message: CONSTANTS.BD_ERROR_500
                    }));
                } else {
                    issetUser ?
                        res.status(401).send(new Response({
                            isSuccess: false,
                            message: 'This user already exists in DB'
                        })) :
                        user.save((err, userStored) => {
                            err
                                ?
                                res.status(500).send(new Response({
                                    isSuccess: false,
                                    message: CONSTANTS.BD_ERROR_500
                                })) :
                                !userStored ?
                                res.status(501).send(new Response({
                                    isSuccess: false,
                                    message: CONSTANTS.BD_ERROR_501
                                })) :
                                res.status(200).send(new Response({
                                    isSuccess: true,
                                    result: userStored
                                }));
                        });
                }
            });
        });
    } else {
        res.status(401).send(new Response({
            isSuccess: false,
            message: CONSTANTS.MODEL_INVALID
        }));
    }
}

function update(req, res) {
    userId = req.params.id;
    var update = req.body;

    if (userId != req.user.sub) {
        res.status(401).send(new Response({
            isSuccess: false,
            message: CONSTANTS.BD_ERROR_401
        }));
    }

    User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdate) => {
        if (err) {
            res.status(500).send(new Response({
                isSuccess: false,
                message: CONSTANTS.BD_ERROR_500
            }));
        } else {
            if (!userUpdate) {
                res.status(501).send(new Response({
                    isSuccess: false,
                    message: CONSTANTS.BD_ERROR_501
                }));
            } else {
                res.status(200).send(new Response({
                    isSuccess: true,
                    result: userUpdate
                }));
            }
        }
    })


}


// export
module.exports = {
    pruebas,
    login,
    save,
    update
};