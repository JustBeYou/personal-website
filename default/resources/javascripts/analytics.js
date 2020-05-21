/**
 * data:
 * - event type
 * - message
 */
'use strict';

let socket;
window.addEventListener('load', async () => {
    socket = io('/realtime-analytics');
    
    await generateSessionId();
    const systemInfo = await getSystemInfo();

    addLinksHandlers();
    registerSections();
    socket.emit('new session', {
        session, 
        ...systemInfo, 
        ip: await getIP(), 
        sections: watchedSections.map(section => section.id)
    });

    logger({type: 'load', message: `User ${session} arrived`});
    window.dispatchEvent(new Event('scroll'));
});

function addLinksHandlers() {
    [...document.querySelectorAll('a')]
        .map((element) => ({element, link: element.getAttribute('href')}))
        .forEach(element => {
            element.element.addEventListener('click', () => {
                logger({type:'click', message: `User clicked on ${element.link}`, target: element.link});
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
        const sectionScores = activeSections.map(section => ({section, score: sectionViewScore(section)}));
        const bestSection = sectionScores.reduce((bestSection, currentSection) => {
            if (currentSection.score > bestSection.score) return currentSection;
            return bestSection;
        });
        const readingNow = [bestSection.section.id];
        logger({type: 'reading', message: `User is reading ${readingNow}`, reading: readingNow});
    });
});

window.addEventListener('resize', () => {
    handleOnlyEventEnd('resize', () => {
        const metrics = getGenericMetrics();
        logger({type: 'resize', message: `Window resize to ${metrics.width}:${metrics.height}`});
    });
});

function getActiveSections() {
    return watchedSections.filter(section => sectionViewScore(section) > 0);
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

function sectionViewScore(elem) {
    const limit = window.innerHeight || document.documentElement.clientHeight;
    const bounding = elem.getBoundingClientRect();
    let upperBound = bounding.top;
    let lowerBound = bounding.bottom;

    if (bounding.top < 0) upperBound = 0;
    if (bounding.bottom > limit) lowerBound = limit;

    return lowerBound - upperBound + 1;
}

let currentSystemInfo;
async function getSystemInfo() {
    if (currentSystemInfo !== undefined) return currentSystemInfo;

    const position = await getPosition();
    currentSystemInfo = {
        url: window.location.pathname,
        browser: navigator.appName,
        platform: navigator.platform,
        location: position,
        language: navigator.language,
        useragent: navigator.userAgent,
    };
    return currentSystemInfo;
}

function getPosition() {
    return new Promise(resolve => {
      navigator.geolocation.getCurrentPosition(
        position => {
            resolve(position);
        },
        () => {
            resolve(null);
        },
      );
    });
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
        const info = await getSystemInfo();
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

async function logger(data) {
    const now = new Date();

    socket.emit('event', {time: now, ...data, ...(await getGenericMetrics())})
    console.log(`[EVENT] ${now} [${data.type}] - ${data.message}`);
}

const DEFAULT_EVENT_TIMEOUT = 200;