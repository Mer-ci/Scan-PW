var inputPassword;
var inputUser;
var url = "";
var rsa = null;
var allreadyAskMdp = false;

function dechypher (cypherText) {
	var decypherText = do_decrypt(cypherText, rsa);
	return decypherText;
}

//fonction permetant de détecter si une input est un champ user
function isUserForm (input) {
	if (input.type == "text" || input.type == "email" ) {
		return true;
	} else {
		return false;
	}
}

//fonction permettant l'insertion des identifiants
function insertLogins (JSONObject) {
	var objectParse = JSON.parse(JSONObject);
	if (objectParse.url == document.URL.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[1]) {
		var dechypheruserMdp = dechypher(objectParse.userMdp);
		var dechypheruserLogin = dechypher(objectParse.userLogin);
		inputPassword.value = dechypheruserMdp;
		inputUser.value = dechypheruserLogin;
		dechypheruserMdp = "";
		dechypheruserLogin = "";
		// inputUser.form.submit();
		// rsa = null;
	}else {
		chrome.extension.sendMessage({dom: "getLogin"}, function(response) {
		});
	}
}

//fonction permetant la détection des formulaires de logins
function findPassForm () {
	var inputs = document.getElementsByTagName('input');
	//var inputs = document.getElementById(RegExp("email"));
	for (var i = 0; i < inputs.length; i++) {
		if (inputs[i].type == "password") {
			inputPassword = inputs[i];
			for (i - 1; i >= 0; i--) {
				if (isUserForm(inputs[i])) {
					inputUser = inputs[i];
					chrome.extension.sendMessage({dom: "getKey"}, function (response) {
						if (response.rsa) {
							rsa = response.rsa;
							chrome.extension.sendMessage({dom: "getPubKey"}, function (response) {
								window.localStorage.setItem("pubKey",response.pubKey);
								chrome.extension.sendMessage({dom: "getLogin"}, function(response) {
									allreadyAskMdp = true;
									if (response.genQR) {
										createQrframe();
										var buttonToHide = document.getElementById('enable_auto_detect_4dory_button');
										buttonToHide.style.visibility = "collapse";
										buttonToHide.style.height = "10px";
									}
								});
							});
						}
					});
					return;
				}
			}
			return;
		}
	}
}

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	//quand on reçoit les mot de passe du serveur on inert les mot de passe dans la page
	if (request.dom == "getRsa") {
		sendResponse({sendRsa: rsa});
	}
	if (request.dom == "insertLogin") {
		console.log("insert Login");
		var object = {
			url : request.url,
			userLogin : request.login,
			userMdp : request.pwd
		};
		var objectParse = JSON.stringify(object);
		insertLogins(objectParse);
	}
	//insertion 
	if (request.dom == "insertUserLogin") {
		var selectedElement = document.activeElement;
		var dechypheruserLogin = dechypher(request.login);
		selectedElement.value = dechypheruserLogin;
	}
	if (request.dom == "insertUserPwd") {
		var selectedElement = document.activeElement;
		var dechypheruserMdp = dechypher(request.pwd);
		selectedElement.value = dechypheruserMdp;
	}
	if (request.dom == "sendNewPassRequest") {
		chrome.extension.sendMessage({dom: "getLogin"}, function(response) {
		});
	}
	if (request.dom == "popupOpened") {
		console.log("popup opened");
		if (rsa==null) {
			console.log("rsa null");
			chrome.extension.sendMessage({dom: "getKey"}, function (response) {
				console.log("ask popup key");
				if (response.rsa) {
					rsa = response.rsa;
					chrome.extension.sendMessage({dom: "getPubKey"}, function (response) {
						window.localStorage.setItem("pubKey",response.pubKey);
						chrome.extension.sendMessage({dom: "getLogin"}, function(response) {
							allreadyAskMdp = true;
							console.log("envoi currentKey");
							console.log(window.localStorage.getItem("pubKey"));
							sendResponse({pubKey: window.localStorage.getItem("pubKey")});
						});
					});
				}
			});
		}else{
			console.log("envoi currentKey");
			console.log(window.localStorage.getItem("pubKey"));
			sendResponse({pubKey: window.localStorage.getItem("pubKey")});
		}
	}
	if (request.dom == "cancelAsk") {
		inputUser.value = "error : time out";
	}
	if (request.dom == "allreadyAskMdp") {
		sendResponse({askMdp : allreadyAskMdp});
	}
	if (request.dom == "askContentLogin") {
		sendResponse({alreadyLogin : allreadyAskMdp});
		if (!allreadyAskMdp) {
			allreadyAskMdp = true;
		}
	}
});

window.onload=findPassForm();