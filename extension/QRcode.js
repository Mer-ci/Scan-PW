var setQRCode = function() {
	console.log("setQR Code");
	chrome.extension.sendMessage({dom : "get_size"}, function (response){
		console.log(response);
		jQuery('#qr').empty();
		jQuery('#qr').qrcode({width: response.size,height: response.size,text: setQRText(url)});
		jQuery('#qr')[0].parentElement.style.height = parseInt(response.size)+90+"px";
		jQuery('#qr')[0].parentElement.style.width = parseInt(response.size)+50+"px";

		if (jQuery('#qr')[0].parentElement.parentElement.id == "popup_4dory_body") {
			jQuery('#qr')[0].parentElement.parentElement.style.height = parseInt(response.size)+100+"px";
			jQuery('#qr')[0].parentElement.parentElement.style.width = parseInt(response.size)+60+"px";
			document.getElementsByTagName("html")[0].style.height = parseInt(response.size)+100+"px";
		}
	});
};
var setQRText = function(url) {
	if (window.localStorage.getItem("pubKey")) {
		console.log(window.localStorage.getItem("pubKey"));
		return "http://r.mer.ci?r&"+window.localStorage.getItem("pubKey")+"&"+url.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[1];
	}else {
		return "http://r.mer.ci?r&"+"nopubKey"+"&"+url.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[1];
	}
};
