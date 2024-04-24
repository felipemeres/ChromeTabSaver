chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.method == "getDescription") {
        let description = document.querySelector('meta[name="description"]') ? document.querySelector('meta[name="description"]').getAttribute("content") : "No description available.";
        sendResponse({ description: description });
    }
});
