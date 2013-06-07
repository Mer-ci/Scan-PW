var ip = "127.0.0.1"; //ne pas oublier de modifié le manifest
var port = "8080";
var xhr = new XMLHttpRequest();

//initialise la demande mot de passe
function askMDP (TabId) {
	xhr.open("POST", "http://"+ip+":"+port, true);
	console.log("demande mdp envoyer");
	xhr.onreadystatechange = function() {
		console.log(xhr.readyState);
		if (xhr.readyState == 4) {
			// console.log(xhr);
			if (xhr.status == 200) {
				var responseParse = JSON.parse(xhr.responseText);
				// console.log(responseParse);
				if (responseParse.alea) {
					sendAlea(responseParse.alea, TabId);
				}
			}else if (xhr.status === 0) {
				alert("erreur de connection au serveur reesayez plus tard");
			}else {
				alert("error : " +xhr.status+" veuillez recharger la page");
			}
		}
	};
	xhr.send("type=mdp&pubKey="+encodeURIComponent(window.localStorage.getItem('pubKey')));
}

//envoi l'aléa reçut dans askMDP au serveur puis récupére les identifiants pour les envoyer au content.js concerner
function sendAlea (alea, TabId) {
	xhr.open("POST", "http://"+ip+":"+port, true);
	console.log("envoi de l'aléa");
	xhr.onreadystatechange = function() {
		// console.log(xhr.readyState);
		if (xhr.readyState == 4) {
			var responseParse;
			if (xhr.status == 200) {
				if (xhr.responseText === "") {
					console.log("faux retour");
					chrome.tabs.sendMessage(TabId, {dom: "cancelAsk"}, function(response) {
					});
				}else {
					responseParse = JSON.parse(xhr.responseText);
					if (responseParse.login) {
						window.localStorage.setItem('login', responseParse.login);
						window.localStorage.setItem('pwd', responseParse.pwd);
						chrome.tabs.sendMessage(TabId, {dom: "getRsa"}, function(response) {
							if (response.sendRsa) {
								sendMessageToInsertLogin(TabId, responseParse.login, responseParse.pwd, responseParse.url);
							}
						});
					}
				}
			}else if (xhr.status == 521){
				console.log('erreur de reception login');
				chrome.tabs.sendMessage(TabId, {dom: "sendNewPassRequest"}, function(response) {
				});
			}else if (xhr.status == 522) {
				console.log("cancel Ask");
				chrome.tabs.sendMessage(TabId, {dom: "cancelAsk"}, function(response) {
				});
			}else {
				alert("error : " +xhr.status+" veuillez recharger la page");
			}
		}
	};
	xhr.timeout = 300000;
    xhr.ontimeout = function () { console.log("Timed out!!!"); };
    chrome.tabs.sendMessage(TabId, {dom: "getRsa"}, function(response) {
		if (response.sendRsa) {
			var dechypherAlea = do_decrypt(alea, response.sendRsa);
			console.log(dechypherAlea);
			xhr.send("type=sAlea&alea="+dechypherAlea+"&pubKey="+window.localStorage.getItem('pubKey'));
		}
	});
}
function sendMessageToInsertLogin (tabId, login, pass, url) {
	chrome.tabs.sendMessage(tabId, {dom: "insertLogin", login: login, pwd: pass, url: url}, function(response) {

	});
}
