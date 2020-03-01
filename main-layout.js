'use strict';

const asideExpandedWidth  = "200px";
const asideCollapsedWidth = "0px";
const asideSelector = "div.main-layout aside";
let asideMenuState = "expanded"; // collapsed, expanded or top

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
    if (window.innerWidth <= 768) return ;
    
    const asideElement = document.querySelector(asideSelector);
    switchAsideState();
}

function moveAsideToTop() {
    const asideElement = document.querySelector(asideSelector);
    asideElement.style.width = "100%";
    asideMenuState = "top";
}

function applyMobileView() {
    moveAsideToTop();
}

function applyWebView() {
    switchAsideState();
}

function handleWindowResize(mobileViewEvent) {
    if (mobileViewEvent.matches) {
        applyMobileView();
    } else {
        applyWebView();
    }
}

function onloadHandler() {
    const activator = document.querySelector(".activate-aside");
    activator.addEventListener('click', handleAsideResize);
    
    const mobilePortView = window.matchMedia("(max-width: 768px)");
    mobilePortView.addListener(handleWindowResize);
    
    handleWindowResize(mobilePortView);
}

window.onload = onloadHandler;