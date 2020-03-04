'use strict';

const asideExpandedWidth  = "200px";
const asideCollapsedWidth = "0px";
const asideSelector = "div.main-layout aside";
let asideMenuState = "collapsed"; // collapsed, expanded or top

function resizeAside(size) {
    const asideElement = document.querySelector(asideSelector);
    asideElement.style.width = size;
}

function switchAsideState() {
    if (asideMenuState === "collapsed") {
        resizeAside(asideExpandedWidth);
        asideMenuState = "expanded";
    } else {
        resizeAside(asideCollapsedWidth);
        asideMenuState = "collapsed";
    } 
}

function handleAsideResize() {
    const asideElement = document.querySelector(asideSelector);
    switchAsideState();
}

function onloadHandler() {
    const activator = document.querySelector(".activate-aside");
    activator.addEventListener('click', handleAsideResize);
}

window.onload = onloadHandler;