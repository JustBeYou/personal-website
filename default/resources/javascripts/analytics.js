/**
 * data:
 * - event type
 * - message
 */
'use strict';

window.addEventListener('load', async () => {
    await generateSessionId();
    addLinksHandlers();
    registerSections();

    logger({type: 'load', message: `User ${session} arrived`});
    window.dispatchEvent(new Event('scroll'));
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

const watchedSections = [];
function registerSections() {
    watchedSections.push(...document.querySelectorAll('section'));
}

window.addEventListener('scroll', () => {
    handleOnlyEventEnd('scroll', () =>{
        const metrics = getGenericMetrics();
        logger({type: 'scroll', message: `Scrolled to ${metrics.scroll}`});
        const activeSections = getActiveSections();
        logger({type: 'reading', message: `User is reading ${activeSections.map(elem => `#${elem.id}`)}`});
    });
});

window.addEventListener('resize', () => {
    handleOnlyEventEnd('resize', () => {
        const metrics = getGenericMetrics();
        logger({type: 'resize', message: `Window resize to ${metrics.width}:${metrics.height}`});
    });
});

function getActiveSections() {
    return watchedSections.filter(section => isInViewport(section));
}

const timers = {
    resize: null,
    scroll: null,
};
function handleOnlyEventEnd(timerName, callback) {
    if (timers[timerName] !== null) {
        clearTimeout(timers[timerName]);
        timers[timerName] = null;
    }
    timers[timerName] = setTimeout(callback, DEFAULT_EVENT_TIMEOUT);
}

window.addEventListener('unload', () => {
    logger({type: 'unload', message: `User ${session} left`});
});

function isInViewport(elem) {
    const bounding = elem.getBoundingClientRect();
    const limit = window.innerHeight || document.documentElement.clientHeight;
    return (
        (bounding.top >= 0 && bounding.top <= limit) ||
        (bounding.top < 0 && bounding.bottom > 0)
    );
};

function getSystemInfo() {
    return {
        url: window.location.href,
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
        scroll: window.scrollY,
    };
}

function logger(data) {
    const now = new Date();

    console.log(`[EVENT] ${now} [${data.type}] - ${data.message}`);
}

const DEFAULT_EVENT_TIMEOUT = 200;