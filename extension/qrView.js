var smallSsize = 310;
var mediumSize = 410;
var bigSize = 510;

function createQrframe(){

	qrfrm = document.createElement("div");
	qrfrm.setAttribute("id", "main_4dory_div");
	qrfrm.style.zIndex = 1E3;
	qrfrm.style.textAlign = "center";
	qrfrm.style.paddingTop = "10px";
	qrfrm.style.overflowX="hidden";
	qrfrm.style.overflowY="hidden";
	qrfrm.style.position="absolute";
	qrfrm.style.display = "block";
	qrfrm.style.right = "10px";
	qrfrm.style.top = "10px";
	// qrfrm.style.background="white";
	document.body.appendChild(qrfrm);

	var qr_frame = document.getElementById("main_4dory_div");

	// active l'affichage automatique 
	detectB = document.createElement("button");
	detectB.setAttribute("id", "enable_auto_detect_4dory_button");
	detectB.innerText = "activer détection automatique";
	qrfrm.appendChild(detectB);

	detect_Button = document.getElementById("enable_auto_detect_4dory_button");

	detect_Button.addEventListener("click", function() {
		chrome.extension.sendMessage({dom: "enable_auto_detect"}, function(response) {
			console.log(response);
			document.getElementById('enable_auto_detect_4dory_button').style.height = "10px";
			document.getElementById('enable_auto_detect_4dory_button').style.visibility = "collapse";
			document.getElementById('disable_auto_detect_4dory_button').style.visibility = "visible";
			document.getElementById('disable_auto_detect_4dory_button').style.height = "";
		});
	});

	// desactive l'affichage automatique 
	dDetectB = document.createElement("button");
	dDetectB.setAttribute("id", "disable_auto_detect_4dory_button");
	dDetectB.innerText = "desactiver détection automatique";
	qrfrm.appendChild(dDetectB);

	d_detect_Button = document.getElementById("disable_auto_detect_4dory_button");

	d_detect_Button.addEventListener("click", function() {
		// qr_frame.style.visibility = 'collapse';
		chrome.extension.sendMessage({dom: "disable_auto_detect"}, function(response) {
			console.log(response);
			document.getElementById('enable_auto_detect_4dory_button').style.visibility = "visible";
			document.getElementById('enable_auto_detect_4dory_button').style.height = "";
			document.getElementById('disable_auto_detect_4dory_button').style.visibility = "collapse";
			document.getElementById('disable_auto_detect_4dory_button').style.height = "10px";
		});
	});


	chrome.extension.sendMessage({dom: "get_auto_detect_status"}, function (response) {
		console.log(response);
		if (response.statu) {
			if (response.statu == "true") {
				document.getElementById('enable_auto_detect_4dory_button').style.height = "10px";
				document.getElementById('enable_auto_detect_4dory_button').style.visibility = "collapse";
				document.getElementById('disable_auto_detect_4dory_button').style.height = "";
				document.getElementById('disable_auto_detect_4dory_button').style.visibility = "visible";
			}else  {
				document.getElementById('enable_auto_detect_4dory_button').style.visibility = "visible";
				document.getElementById('enable_auto_detect_4dory_button').style.height = "";
				document.getElementById('disable_auto_detect_4dory_button').style.visibility = "collapse";
				document.getElementById('disable_auto_detect_4dory_button').style.height = "10px";
			}
		}
	});

	if (document.getElementsByTagName("body")[0].id != "popup_4dory_body") {
		//création du bouton close
		closeB = document.createElement("button");
		closeB.setAttribute("id", "close_4dory_button");
		closeB.innerText = "close";
		qrfrm.appendChild(closeB);

		close_button = document.getElementById("close_4dory_button");

		close_button.addEventListener("click", function() {
			// qr_frame.style.visibility = 'collapse';
			qr_frame.innerHTML = "";
		});
	}

	//création bouton help
	helpB = document.createElement("button");
	helpB.setAttribute("id", "help_4dory_link");
	helpB.innerText = "help";
	qrfrm.appendChild(helpB);

	help_button = document.getElementById("help_4dory_link");

	help_button.addEventListener("click", function() {
		// chrome.tabs.create({'url': chrome.extension.getURL('test.html')}, function(tab) {
		// });
		// window.open(__dirname + "/help.html");
		chrome.extension.sendMessage({dom: "openHelp"}, function (response) {
		});
	});

	//création de la div affichant le qr
	qrframe = document.createElement("div");
	qrframe.setAttribute("id", "qr");
	qrframe.style.padding = "10px";
	qrframe.style.background = "white";
	qrfrm.appendChild(qrframe);

	//création du boutton petite taille
	smallB = document.createElement("button");
	smallB.setAttribute("id", "small_4dory_button");
	smallB.innerText = "small";
	qrfrm.appendChild(smallB);

	smallButton = document.getElementById("small_4dory_button");

	smallButton.addEventListener("click", function () {
		chrome.extension.sendMessage({dom : "set_size", size : smallSsize}, function(response){
			console.log(response);
		});
		setQRCode();
	});

	//création du boutton taille moyenne
	mediumB = document.createElement("button");
	mediumB.setAttribute("id", "medium_4dory_button");
	mediumB.innerText = "medium";
	qrfrm.appendChild(mediumB);

	mediumButton = document.getElementById("medium_4dory_button");

	mediumButton.addEventListener("click", function () {
		chrome.extension.sendMessage({dom : "set_size", size : mediumSize}, function(response){
			console.log(response);
		});
		setQRCode();
	});

	//création du boutton taille grande
	largeB = document.createElement("button");
	largeB.setAttribute("id", "large_4dory_button");
	largeB.innerText = "large";
	qrfrm.appendChild(largeB);

	largeButton = document.getElementById("large_4dory_button");

	largeButton.addEventListener("click", function () {
		chrome.extension.sendMessage({dom : "set_size", size : bigSize}, function(response){
			console.log(response);
		});
		setQRCode();
	});

	$(function() {
		$( "#main_4dory_div" ).draggable().resizable();
	});

	url = document.URL;

	setQRCode();

}