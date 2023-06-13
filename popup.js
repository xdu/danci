let root = document.body
let terms = []
let form = { term: "", desc: "", examples: "" } 

var AddNew = {
    view: function() {
        return m("form.container", {
            onsubmit: function(e) {
                e.preventDefault();
                if (! form.term) {
                    alert("Term must be not empty.")
                    return
                }
                chrome.storage.local.get(["terms"]).then((results) => {
                    terms = results.terms || []
                    terms.push(form)
                    chrome.storage.local.set({ "terms" : terms })
                }).then(() => {
                    m.route.set("/list")
                })
            }
        }, [
            m("fieldset", [ 
                m("label", "Term"),
                m("input.input[type=text][name=term]", {
                    value: form.term,
                    oninput: function(e) { form.term = e.target.value }
                } ),
                m("label", "Desc"),
                m("input[type=text][name=desc]", {
                    value: form.desc,
                    oninput: function(e) { form.desc = e.target.value }
                }),
                m("label", "Examples"),
                m("textarea[rows=5][cols=20][name=examples]", {
                    value: form.examples,
                    oninput: function(e) { form.examples = e.target.value }
                }),
                m("button[type=submit]", { class: "button button-outline" }, "Save")
            ])
        ])
    }
}

var ShowList = {
    view: function() {
        return m("div.container", [
            terms.map(function (item) {
                return m("div.card", [
                    m("div.card-title", item.term),
                    m("div.card-sub", item.desc),
                    m("div.card-text", item.examples)
                ])
            }),
            m("button.button", { onclick: getNewFileHandle }, "Export"),
        ]) 
    }
}

async function getNewFileHandle(e) {
    e.preventDefault();
    
    let markdown = "Hello world"

    const url = URL.createObjectURL(new Blob([markdown], {
      type: "text/markdown;charset=utf-8"
    }));
    
    const id = await chrome.downloads.download({
        url: url,
        filename: "vocabulary.md",
        saveAs: false
      });
    
    window.close()
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

(async () => {
    console.log("init")

    const activeTabId = await getActiveTabId();
    const results = await chrome.scripting.executeScript({
            target: { tabId: activeTabId },
            func: pageGetSelect,
        })

    let str = results[0].result
    if (str && str.length > 0) {
        str = str.trim()
        if (str.includes(" ")) {
            form.examples = str.trim().substr(0, 200)
        } else {
            form.term = str.trim()
        }
        m.route.set('/add')
    } else {
        let results = await chrome.storage.local.get(["terms"])
        terms = results.terms || []
        m.route.set("/list")
    }
})()