chrome.action?.onClicked.addListener(async (tab) => {
    if (!tab.id) return

    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (fileUrl) => {
            setTimeout(async () => import(fileUrl).then(() => console.log("")), 0)
        },
        args: [chrome.runtime.getURL("/scripts/script.js")],
        world: "ISOLATED",
    })
})