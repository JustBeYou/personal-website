window.addEventListener('load', async () => {
    const resp = await fetch('/page', {
        method: 'GET',
    });
    const pagesResp = await resp.json();

    const listElemTemplate = document.getElementById('dropdown-template');
    const target = document.getElementById('dropdown-content1');

    for (const page of pagesResp.pages) {
        const newListElem = listElemTemplate.content.cloneNode(true);
        const innerLink = newListElem.querySelector('a');
        innerLink.setAttribute('href', 'pages.html#' + page.title);
        innerLink.textContent = page.title;

        target.appendChild(newListElem);
    }
});