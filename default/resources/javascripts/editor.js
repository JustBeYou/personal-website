let editor = null;
let currentPageId = null;
let isCtrl = false;

window.addEventListener('load', async () => {
    const textArea = document.getElementById('editor-area');
    editor = CodeMirror.fromTextArea(textArea, {
        lineNumbers: true,
        mode: "htmlmixed",
    });
    editor.setSize(null, '500px');

    const select = document.getElementById('editor-select');
    const resp = await fetch('/page', {
        method: 'GET',
    });
    const pagesResp = await resp.json();

    const pageOptionTemplate = document.getElementById('page-option');
    for (const page of pagesResp.pages) {
        const newOption = pageOptionTemplate.content.cloneNode(true);
        const innerOption = newOption.querySelector('option');
        innerOption.value = page._id;
        innerOption.textContent = page.title;

        select.appendChild(newOption);
    }

    loadPageForEdit();
    select.addEventListener('change', loadPageForEdit);
    
    document.onkeyup = (e) => {
        if(e.keyCode === 17) isCtrl = false;
    }

    document.onkeydown = (e) => {
        if(e.keyCode === 17) isCtrl = true;
        if(e.keyCode === 83 && isCtrl === true) {
            savePage();
            return false;
        }
    }
});

async function loadPageForEdit() {
    const pagesSelect = document.getElementById('editor-select');
    const selectedPageId = pagesSelect.options[pagesSelect.selectedIndex].value;

    const resp = await fetch(`/page/id/${selectedPageId}`, {
        method: 'GET',
    });
    const pageResp = await resp.json();

    currentPageId = selectedPageId;
    editor.setValue(pageResp.page.content);
}

async function savePage() {
    const pageNewContent = editor.getValue();
    await fetch(`/page/id/${currentPageId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({content: pageNewContent}),
    });

}