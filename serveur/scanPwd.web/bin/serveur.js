
//version 0.5
//	éléments de base du serveur, avec les fonctions demande de mot de passe : "mdp"
//version 0.6
//	ajout de l'action "sAléa": vérification de l'aléa envoyer	
//version 0.7
//	ajout du mécanisme d'attente
//version 0.8
//	ajout de l'intégration de la base de donnée 
//	efface les données qui sont la depuis plus de 10 min
//version 0.9
//ajout de la crypto
//modification pour l'action "r" update au lieux d'un delete -> insert
//version 0.9.1
//gestion des erreurs
//résolution bug requette sql de la fonction tryCancel()
//ajout des logs
var http = require('http');
var request = require('request');
var qs = require('querystring');
var url = require('url');
var crypto = require('crypto');
var pg = require('pg');
var winston = require('winston');
var myLevels = {
    levels: {
        info: 0,
        warn: 1
    },
    colors: {
        info: 'blue',
        warn: 'red'
    }
};
winston.add(winston.transports.File, {
    filename: __dirname + '/log/Logging.log',
    levels: myLevels
});

var rsa = require('node-bignumber');
var key = new rsa.Key();

var dbUrl = "tcp://scanpwd_postgres:sCanPw2-P@localhost/4dory";

var client = new pg.Client(dbUrl);

client.connect(function (err) {
    if (err) {
        winston.warn("erreur connection 'clearDb' :" + err);
    } else {
        winston.info('connect to db sucess');
    }
});

function genAlea() {
    return Math.random().toString(36).substring(2);
}


function tryCancel(pubKey) {
    client.query("UPDATE templogins SET alea='', usr='', mdp='', url='',nbessai=" + 5 + ", cancel=" + true + " WHERE clepub = '" + pubKey + "';", function (err, result) {
        if (err) {
            winston.warn("erreur cancel :" + err);
        } else {
            winston.info('cancel ok');
        }
    });
}

var clearDbTimeout = setInterval(function () {
    client.query("SELECT * FROM templogins", function (err, result) {
        if (err) {
            winston.warn("erreur query SELECT 'clearDb' :" + err);
        }
        for (var i = 0; i < result.rows.length; i++) {
            var date = new Date();
            date = result.rows[i].dateajout;
            var now = new Date().getTime();
            if ((now - date.getTime()) > 600000) {
                client.query("DELETE FROM templogins WHERE clepub = '" + result.rows[i].clepub + "';", function (err, result) {
                    if (err) {
                        winston.warn("erreur query DELETE 'clearDb' :" + err);
                    } else {
                        winston.info("clear db");
                    }
                });
            }
        }
    });
}, 600000); // 600000 = 10min

var server = http.createServer(function (req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    //Test si la requette est une requette POST
    if (req.method == 'POST') {
        var body = '';
        //Fonction qui ajoute dans 'body' la data reçut 
        req.on('data', function (data) {
            body += data;
        });
        //Traite la data quand on a fini de la recevoir
        req.on('end', function () {
            var POST = qs.parse(body);
            //ici nous allons faire le traitement des actions
            if (POST.type) {
                //traitement de l'action demande de mot de passe
                if (POST.type == "mdp") {
                    //est appeller pour vérifier si les logins sont en db
                    client.query("SELECT * FROM templogins WHERE clepub = '" + POST.pubKey + "';", function (err, result) {
		        if (err) {
                            res.writeHead(520, {
                                'Content-Type': 'text/html'
                            });
                            res.write(err.toString());
                            res.end();
                            winston.warn("erreur query SELECT action mdp :" + err);
                        } else {
                            var n = POST.pubKey;
                            key.setPublic(n, "3"); // 65537
                            if (result.rows.length > 0) {
                                var cypherAlea = key.encrypt(result.rows[0].alea);
                                var alea = {
                                    alea: cypherAlea
                                };
                                var aleaJSON = JSON.stringify(alea);
                                res.write(aleaJSON);
                                res.end();
                            } else {
                                var newAlea = genAlea();
                                client.query("INSERT INTO templogins(clepub, dateajout, datecommobile, alea, usr, mdp, url, nbessai, cancel) VALUES ('" + POST.pubKey + "', NOW(), NOW(), '" + newAlea + "', '', '', '', 5, false);", function (err, result) {
				    if (err) {
                                        res.writeHead(520, {
                                            'Content-Type': 'text/html'
	                                        });
                                        res.write(err.toString());
                                        res.end();
                                        winston.warn("erreur query INSERT INTO action mdp :" + err);
                                    } else {
                                        var cypherAlea = key.encrypt(newAlea);
                                        var alea = {
                                            alea: cypherAlea
                                        };
                                        var aleaJSON = JSON.stringify(alea);
                                        res.write(aleaJSON);
                                        res.end();
                                    }
                                });
                            }
                        }
                    });
                } else if (POST.type == "sAlea") { //traitement de l'action de vérification de l'aléa
                    //si l'aléa est correct on envoi les identifiants
                    var mainTimeOut = null;
                    var waitLogin = setInterval(function () {
                        //est appeller pour vérifier si les logins sont en db
                        client.query("SELECT * FROM templogins WHERE clepub = '" + POST.pubKey + "';", function (err, result) {
                            if (err) {
                                res.writeHead(520, {
                                    'Content-Type': 'text/html'
                                });
                                res.write(err.toString());
                                res.end();
                                winston.warn("erreur query SELECT action sAlea : " + err);
                            } else {
                                if (result.rows.length > 0) {
                                    //on test si l'alea est correct 
				console.log("attente aléa");
                                    if (result.rows[0].alea == POST.alea) {
					console.log("aléa OK");
                                        //pui on test si il y as eut un ordre "cancel"
                                        if (result.rows[0].cancel) {
                                            res.writeHead(523, {
                                                'Content-Type': 'text/html'
                                            });
                                            res.write("cancel");
                                            res.end();
                                            winston.info("waitLogin : cancel");
                                            cancel = false;
                                            clearInterval(waitLogin);
                                            if (mainTimeOut) {
                                                clearTimeout(mainTimeOut);
                                            }
					}else {

				     	    console.log(result.rows[0].isLogin);
                                            if (result.rows[0].isLogin) {
						console.log("envoi des identifiants");
                                                var logins = {
                                                    login: result.rows[0].usr,
                                                    pwd: result.rows[0].mdp,
                                                    url: result.rows[0].url
                                                };
                                                var loginJSON = JSON.stringify(logins);
                                                //console.log(loginJSON);
                                                res.write(loginJSON);
                                                res.end();
                                                winston.info("login Envoyé");
                                                clearInterval(waitLogin);
                                                if (mainTimeOut) {
                                                    clearTimeout(mainTimeOut);
                                                }
                                            } else {}
                                        }
                                    } else {
					res.writeHead(523, {
						'Content-Type': 'text/html'
					});
					res.write("cancel");
					res.end();
					winston.info("waitLogin : wrong alea");
					cancel = false;
					clearInterval(waitLogin);
					if (mainTimeOut) {
						clearTimeout(mainTimeOut);
					}
				}
                                }
                            }
                        });
                    }, 1000);

                    //timeout qui ferme la connection aprés 5min
                    mainTimeOut = setTimeout(function () {
                        //est appeller pour vérifier si les logins sont en db
                        client.query("SELECT * FROM templogins WHERE clepub = '" + POST.pubKey + "';", function (err, result) {
                            if (err) {
                                res.writeHead(520, {
                                    'Content-Type': 'text/html'
                                });
                                res.write(err.toString());
                                res.end();
                                winston.warn("erreur query SELECT action sAlea(maintimeout) : " + err);
                            } else {
                                if (result.rows.length > 0) {
                                    //on met à jour le nombre d'essai en DB
                                    var Essai = result.rows[0].nbessai - 1;
                                    client.query("UPDATE templogins SET nbessai=" + Essai + " WHERE clepub = '" + POST.pubKey + "';", function (err, result) {
                                        if (err) {
                                            res.writeHead(520, {
                                                'Content-Type': 'text/html'
                                            });
                                            res.write(err.toString());
                                        }
                                    });
                                    //si le nombre d'essai est trop important ou si il y as eut un cancel on stop la demande de réessai sinon on envoi la commande de reessai
                                    //ne pas oubleir le cancel
                                    if (Essai > 0) {
                                        // winston.info("! .... time out .... !");
                                       console.log("demande de renvoi");
					 res.writeHead(521, {
                                            'Content-Type': 'text/html'
                                        });
                                        res.write("waitLogin");
                                    } else {
                                        // winston.info("envoi cancel nbessai : " + Essai);
                                        res.writeHead(522, {
                                            'Content-Type': 'text/html'
                                        });
                                        res.write("cancel");
                                        client.query("DELETE FROM templogins WHERE clepub = '" + POST.pubKey + "';");
                                        tryCancel();
                                    }
                                    res.end();
                                    if (waitLogin) {
                                        clearInterval(waitLogin);
                                    }
                                    clearTimeout(mainTimeOut);
                                }
                            }
                        });
                    }, 60000);
                } else if (POST.type == "r") {
                    client.query("SELECT * FROM templogins WHERE clepub = '" + POST.key + "';", function (err, result) {
                        if (err) {
                            res.writeHead(520, {
                                'Content-Type': 'text/html'
                            });
                            res.write(err.toString());
                            res.end();
                            winston.warn("erreur query SELECT action r : " + err);
                        } else {
                            var newAlea = genAlea();
                            if (result.rows.length > 0) {
                                client.query("UPDATE templogins SET usr='" + POST.login + "', mdp='" + POST.pwd + "', url='" + POST.url + "', \"isLogin\"=true WHERE clepub='" + POST.key + "';", function (err, result) {
                                    if (err) {
                                        res.writeHead(520, {
                                            'Content-Type': 'text/html'
                                        });
                                        res.write(err.toString());
                                        res.end();
                                        winston.warn("erreur query DELETE action r :" + err);
                                    } else {
                                        res.write("success");
                                        res.end();
                                    }
                                });
                            } else {
                                //console.log("n'exist pas");
                                client.query("INSERT INTO templogins(clepub, dateajout, datecommobile, alea, usr, mdp, url, nbessai, cancel, \"isLogin\") VALUES ('" + POST.key + "', NOW(), NOW(), '" + newAlea + "', '" + POST.login + "', '" + POST.pass + "', '" + POST.url + "', 5, false, true);", function (err, result) {
                                    if (err) {
                                        res.writeHead(520, {
                                            'Content-Type': 'text/html'
                                        });
                                        res.write(err.toString());
                                        res.end();
                                        winston.warn("erreur query INSERT INTO 2 action r :" + err);
                                    } else {
                                        res.write("success");
                                        res.end();
                                    }
                                });
                            }
                        }
                    });
                } else if (POST.type == "c") {
                    // console.log("lunch cancel");
                    tryCancel(POST.pubKey);
                    res.write("success");
                    res.end();
                } else {
                    winston.info("demande non traiter");
                    res.end();
                }
                //console.log(POST);
            }
        });
        //Test si la requette est une requette GET
    } else if (req.method == 'GET') {
        winston.warn('GET request');
        var url_parts = url.parse(req.url, true);
        winston.info(url_parts.query);
        var mainBody = '<html>' +
            '<head>' +
            '<meta http-equiv="Content-Type" content="text/html; ' +
            'charset=UTF-8" />' +
            '</head>' +
            '<body>' +
            '<p>salut</p>' +
            '</body>' +
            '</html>';
        res.writeHead(200, {
            "Content-Type": "text/html"
        });
        res.write(mainBody);
        res.end();
    } else { // si aucun type de reuqette n'est trouver on envoi une page HTML
        winston.warn("requet ni post ni get");
        var mainBody = '<html>' +
            '<head>' +
            '<meta http-equiv="Content-Type" content="text/html; ' +
            'charset=UTF-8" />' +
            '</head>' +
            '<body>' +
            '<p>salut</p>' +
            '</body>' +
            '</html>';
        res.writeHead(200, {
            "Content-Type": "text/html"
        });
        res.write(mainBody);
        res.end();
    }
    // console.log("fin de requete");
}).listen(8080);

console.log('Serveur tourne sur http://localhost:8080/');
