let list = []

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.id === "save") {

		list.push(message.payload)
		sendResponse(list)

	} else if (message.id === "load") {
		
		sendResponse(list)
	}
})