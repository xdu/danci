/*
 * Get current web page selected text
 *
 */

async function getActiveTabId() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab.id;
}

function pageGetSelect() {
    return window.getSelection().toString()
}

export default async () => {
    let str 

    // Get current active tab
    const activeTabId = await getActiveTabId();

    // Execute the content script
    try {
        const results = await chrome.scripting.executeScript({
                target: { tabId: activeTabId },
                func: pageGetSelect,
            })

        // Get the selected text
        str = results[0].result
    
    } catch (err) {
        console.log("Can't get the current text selection.")
    }

    return (str && str.length > 0) ? str.trim().substr(0, 200) : ""
 
}