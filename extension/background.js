genrsa();

if(typeof(window.localStorage) != 'undefined'){
    if (window.localStorage.getItem("autoDetect")) {
        console.log('autoDetect exist');
    }else{
        window.localStorage.setItem("autoDetect","true");
        console.log('autoDetect exist pas');
    }
}
else{
    throw "window.localStorage, not defined";
}
if(typeof(window.localStorage) != 'undefined'){
    if (window.localStorage.getItem("size")) {
        console.log('size exist');
    }else{
        window.localStorage.setItem("size","310");
        console.log('size exist pas');
    }
}
else{
    throw "window.localStorage, not defined";
}

chrome.extension.onMessage.addListener(
    function (request, sender, sendResponse) {
        //si le content.js toruve un login -> demande de mot de passe au serveur
        if (request.dom == "getLogin") {
            if (window.localStorage.getItem("autoDetect")=="true") {
                sendResponse({genQR: "true"});
            }
            askMDP(sender.tab.id);
        }else if (request.dom == "getPubKey") {
            sendResponse({pubKey: window.localStorage.getItem("pubKey")});
        }else if (request.dom == "getKey") {
            console.log("getKey");
            var getRsa = genrsa();
            var rsaToSend = {
                "n" : getRsa.n.toString(16),
                "e" : getRsa.e.toString(16),
                "d" : getRsa.d.toString(16),
                "p" : getRsa.p.toString(16),
                "q" : getRsa.q.toString(16),
                "dmp1" : getRsa.dmp1.toString(16),
                "dmq1" : getRsa.dmq1.toString(16),
                "coeff" : getRsa.coeff.toString(16)
            };
            window.localStorage.setItem("pubKey",rsa.n.toString(16));
            sendResponse({rsa: rsaToSend});
            getRsa = "";
            rsaToSend = "";
        }else if (request.dom == "disable_auto_detect") {
            window.localStorage.setItem("autoDetect","false");
            sendResponse({disable : "success"});
        }else if (request.dom == "enable_auto_detect") {
            window.localStorage.setItem("autoDetect","true");
            sendResponse({enable : "success"});
        }else if (request.dom == "get_auto_detect_status") {
            sendResponse({statu : window.localStorage.getItem("autoDetect")});
        }else if (request.dom == "set_size") {
            window.localStorage.setItem("size", request.size);
            sendResponse({setSize : "success"});
        }else if (request.dom == "get_size") {
            sendResponse({size : window.localStorage.getItem("size")});
        }else if (request.dom == "openHelp") {
            chrome.tabs.create({'url': chrome.extension.getURL('/help.html')}, function(tab) {
                // Tab opened.
            });
        }
});

function insertUser (info, tab) {
    chrome.tabs.sendMessage(tab.id, {dom: "insertUserLogin", login: window.localStorage.getItem('login')}, function(response) {
    });
}

function insertPwd (info, tab) {
    chrome.tabs.sendMessage(tab.id, {dom: "insertUserPwd", pwd: window.localStorage.getItem('pwd')}, function(response) {
    });
}

chrome.contextMenus.create({
    "title": "insert user",
    "contexts": ["selection","editable"],
    "onclick" : insertUser
  });
chrome.contextMenus.create({
    "title": "insert password",
    "contexts": ["selection","editable"],
    "onclick" : insertPwd
  });

