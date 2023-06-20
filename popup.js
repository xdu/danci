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
                    terms.unshift(form)
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
                m("label", "Hint"),             
                m("input[type=text][name=desc]", {
                        value: form.desc,
                        oninput: function(e) { form.desc = e.target.value }
                    }),
                m("label", "Usage"),
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
        if (terms.length > 0) {
            return m("div.container", [
                terms.map(function (item, idx) {
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
                m("button[type=button].button", { onclick: getNewFileHandle }, "Export"),
                m(".float-right", [
                        m("button[type=button]", { class: "button button-danger", onclick: function (e) {
                            terms = []
                            chrome.storage.local.set({ "terms" : terms }).then(m.route.set("/list"))
                        }}, "Clear")
                    ]),
            ]) 
        } else {
            return m("div.container", [m("div", "Vocabulary List is Empty.")])
        }
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
                        terms.splice(vnode.attrs.idx, 1)
                        chrome.storage.local.set({ "terms" : terms }).then(m.route.set("/list"))
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
    
    let md = terms.map((item) => {
        let str = "#### " + item.term + " ####" + "\r\n";
        if (item.desc) {
            str = str + "*" + item.desc + "*\r\n";
        }
        if (item.examples) {
            str = str + item.examples + "\r\n";
        }
        return str
    }).join("\r\n");

    const url = URL.createObjectURL(new Blob([md], {
      type: "text/markdown;charset=utf-8"
    }));
    
    const id = await chrome.downloads.download({
        url: url,
        filename: "vocabulary.md",
        saveAs: false
      });
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