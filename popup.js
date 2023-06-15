let root = document.body
let terms = []
let form = { term: "", desc: "", examples: "" } 

import getSelectText from "./selection.js";

var AddTerm = {
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
                m(".float-right", [
                    m("button.button", [
                        m("i", {class: "fa fa-google"}),
                        m("#", "Translate")    
                    ]),
                ]),
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
            terms.toReversed().map(function (item, idx) {
                return m("div.card", [
                    m(".float-right", [
                        m("a", { href: "#!/edit/" + idx }, [
                            m("i", { class: "fa fa-edit" })
                        ])
                    ]),
                    m("span.card-title", item.term),
                    item.desc ? m("span.card-sub", "("+ item.desc + ")") : m("span"),
                    m("div.card-text", item.examples)
                ])
            }),
            m("button.button", { onclick: getNewFileHandle }, "Export"),
        ]) 
    }
};

var EditTerm = {
    view: function(vnode) {

        console.log(vnode.attrs)
        form = terms[vnode.attrs.idx]

        return m("form.container", [
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
                m(".float-right", [
                    m("button[type=button]", { class: "button button-danger", onclick: function (e) {
                        e.preventDefault();
                        
                    }}, "Delete")
                ]),
                m("button[type=button]", { class: "button button-outline", onclick: function (e) {
                    e.preventDefault();
                    if (! form.term) {
                        alert("Term must be not empty.")
                        return
                    }
                    terms[vnode.attrs.idx] = form
                    chrome.storage.local.set({ "terms" : terms }).then(m.route.set("/list"))                    
                }}, "Save")
            ])
        ])
    }
};

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
    "/add" : AddTerm,
    "/edit/:idx": EditTerm
});


(async () => {

    let str = await getSelectText()

    if (str) {

        if (str.includes(" ") || str.includes("\u00a0")) {
            form.examples = str
        } else {
            form.term = str
        }
        m.route.set('/add')

    } else {

        let results = await chrome.storage.local.get(["terms"])
        terms = results.terms || []

        m.route.set("/list")
    }
})()