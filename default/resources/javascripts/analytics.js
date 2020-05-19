/**
 * data:
 * - event type
 * - message
 */
'use strict';

window.addEventListener('load', async () => {
    await generateSessionId();
    logger({type: 'load', message: `User ${session} arrived`});

    addLinksHandlers();
});

function addLinksHandlers() {
    [...document.querySelectorAll('a')]
        .map((element) => ({element, link: element.getAttribute('href')}))
        .forEach(element => {
            element.element.addEventListener('click', () => {
                logger({type:'click', message: `User clicked on ${element.link}`});
            });
        });
}

let scrollTicking = false;
let lastScrollPosition = 0;
window.addEventListener('scroll', () => {
    lastScrollPosition = window.scrollY;

    if (!scrollTicking) {
        setTimeout(() => {
            const metrics = {...getGenericMetrics()};
            logger({type: 'scroll', message: `Scrolling to ${metrics.scroll}`});
            scrollTicking = false;
        }, 300);

        scrollTicking = true;
    }
});

window.addEventListener('resize', () => {
    const metrics = {...getGenericMetrics()};
    logger({type: 'resize', message: `Window resize to ${metrics.width}:${metrics.height}`});
});

window.addEventListener('unload', () => {
    logger({type: 'unload', message: `User ${session} left`});
});

function getSystemInfo() {
    return {
        browser: navigator.appName,
        platform: navigator.platform,
        location: navigator.geolocation,
        language: navigator.language,
        useragent: navigator.userAgent,
    };
}

let currentIP;
async function getIP() {
    if (currentIP !== undefined) return currentIP;

    const resp = await fetch('/ip');
    const data = await resp.json();
    currentIP = data.ip;
    return currentIP;
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 } 

let session;
async function generateSessionId() {
    if (localStorage.getItem('session') === null) {
        const ip = await getIP();
        const info = getSystemInfo();
        const sessionId = CryptoJS.SHA256(ip + info.useragent + makeid(5)).toString();
        localStorage.setItem('session', sessionId);
    }
    session = localStorage.getItem('session');
}

function getGenericMetrics() {
    return {
        height: window.innerHeight,
        width: window.innerWidth,
        scroll: lastScrollPosition,
    };
}

function logger(data) {
    const now = new Date();

    console.log(`[EVENT] ${now} [${data.type}] - ${data.message}`);
}