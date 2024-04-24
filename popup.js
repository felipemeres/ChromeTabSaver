document.getElementById('saveTabs').addEventListener('click', function () {
    chrome.tabs.query({}, function (tabs) {
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        let markdownContent = `# ${formattedDate}\n\n`;
        let processedTabs = 0; // Track the number of processed tabs

        tabs.forEach(tab => {
            // Filter out tabs with unsupported URL schemes
            if (!tab.url.startsWith('http://') && !tab.url.startsWith('https://') || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://')) {
                markdownContent += `- [${tab.title}](${tab.url}) - could not retrieve description about this tab\n`;
                processedTabs++;
                if (processedTabs === tabs.length) {
                    downloadMarkdown(markdownContent);
                }
                return; // Skip the rest of the loop for this tab
            }

            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: tabDescription
            }, (injectionResults) => {
                if (chrome.runtime.lastError || !injectionResults || !Array.isArray(injectionResults)) {
                    console.error("Script injection failed: ", chrome.runtime.lastError?.message);
                    markdownContent += `- [${tab.title}](${tab.url}) - could not retrieve description about this tab\n`;
                } else {
                    for (const frameResult of injectionResults) {
                        markdownContent += `- [${tab.title}](${tab.url}) - ${frameResult.result.description}\n`;
                    }
                }
                processedTabs++;
                if (processedTabs === tabs.length) {
                    downloadMarkdown(markdownContent);
                }
            });
        });

        if (tabs.length === 0) {
            downloadMarkdown(markdownContent); // Handle case where there are no tabs
        }
    });
});

function tabDescription() {
    let description = document.querySelector('meta[name="description"]') ? document.querySelector('meta[name="description"]').getAttribute("content") : "No description available.";
    return { description };
}

function downloadMarkdown(text) {
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({
        url: url,
        filename: `tabs-${new Date().toISOString().slice(0, 10)}.md`
    });
}
