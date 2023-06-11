var root = document.body
var word, annotation, examples
var book = [{
    word: "Hello",
    annotation: "Hi",
    exemples: "Hello, world"
}]

var AddNew = {
    view: function() {
        return m("form", {
            onsubmit: function(e) {
                e.preventDefault();

                console.log("Send message");
                chrome.runtime.sendMessage({id: "save", payload : {
                    word, annotation, examples
                }}).then((list) => {
                    book = list
                    m.route.set('/list')
                })

            }
        }, [
            m("fieldset", [ 
                m("label", "Word"),
                m("input.input[type=text][name=word]", {value: word} ),
                m("label", "Annotation"),
                m("input[type=text][name=annotation]", ),
                m("label", "Examples"),
                m("textarea[rows=5][cols=20][name=examples]", {value: examples}),
                m("button[type=submit]", { class: "button button-outline" }, "Save")
            ])
        ])
    }
}

var ShowList = {
    view: function() {
        return m("table", [
            m("thead", [
                m("tr", [
                    m("th", "Word"),
                    m("th", "Desc"),
                    m("th", "Ex.")
                ])
            ]),
            m("tbody", book.map(function (item) {
                return m("tr", [
                    m("td", item.word),
                    m("td", item.annotation),
                    m("td", item.examples)
                ])
            }))
        ])
    }
}

m.route(root, "/list", {
    "/list": ShowList,
    "/add": AddNew
})

async function getActiveTabId() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab.id;
}

function pageGetSelect() {
    return window.getSelection().toString()
}

(async function () {
    const activeTabId = await getActiveTabId();
    const results = await chrome.scripting.executeScript({
            target: { tabId: activeTabId },
            func: pageGetSelect,
        })

    let str = results[0].result
    if (str && str.length > 0) {
        str = str.trim()
        if (str.includes(" ")) {
            examples = str.trim().substr(0, 200)
        } else {
            word = str.trim()
        }
        m.route.set('/add')
    }
})();

window.onload = () => {
    console.log("Page loaded")
}