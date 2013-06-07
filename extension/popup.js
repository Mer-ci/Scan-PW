var url = "";

createQrframe();

chrome.tabs.getSelected(null, function(tab) {
	console.log("get selected");
	chrome.tabs.sendMessage(tab.id, {dom: "popupOpened"}, function(response) {
		console.log("demande current key");
		console.log(response);
		if (response.pubKey) {
			console.log(response.pubKey);
			url = tab.url;
			setQRCode();
		}
    });
});