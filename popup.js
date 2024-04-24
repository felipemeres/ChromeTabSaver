document.getElementById('saveTabs').addEventListener('click', function () {
    chrome.tabs.query({}, function (tabs) {
        let markdownContent = tabs.map(tab => `- [${tab.title}](${tab.url})`).join('\n');
        downloadMarkdown(markdownContent);
    });
});

function downloadMarkdown(text) {
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({
        url: url,
        filename: 'tabs.md'
    });
}
