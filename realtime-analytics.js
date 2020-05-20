const liveConnections = {};

function connectionHandler(socket) {
    console.log(new Date(), `Connected ${socket.id}`);
    liveConnections[socket.id] = {};

    socket.on('new session', (message) => {
        console.log(new Date(), `User ${socket.id} is identified by`, message);
        liveConnections[socket.id] = message;
        liveConnections[socket.id]['eventQueue'] = [];
        liveConnections[socket.id]['readings'] = {};
        liveConnections[socket.id]['clicks'] = {};
        liveConnections[socket.id]['loaded'] = false;
        liveConnections[socket.id]['timer'] = null;
        registerEventHandling(socket);
        inactivityTimer(socket);
    });
}

const INACTIVE_TIMEOUT = 1000 * 60 * 1; // 10 minutes
function inactivityTimer(socket) {
    if (liveConnections[socket.id]['timer'] !== null) {
        clearTimeout(liveConnections[socket.id]['timer']);
    }
    liveConnections[socket.id]['timer'] = setTimeout(
        () => socket.disconnect(),
        INACTIVE_TIMEOUT,    
    )
}

function registerEventHandling(socket) {
    socket.on('event', (message) => {
        inactivityTimer(socket);
        console.log(new Date(), `User ${socket.id} messaged ${message.type}`);

        // discard events if they arrive before page load
        if (message.type !== 'load' && !liveConnections[socket.id]['loaded']) {
            return ;
        }

        switch (message.type) {
            case 'load': {
                liveConnections[socket.id]['startTime'] = message.time;
                for (const section of liveConnections[socket.id].sections) {
                    liveConnections[socket.id]['readings'][section] = {
                        active: false,
                        startTime: 0,
                        totalTime: 0,
                    }
                }
                liveConnections[socket.id]['loaded'] = true;
                break;
            }

            case 'reading': {
                handleSections(socket.id, message.reading, liveConnections[socket.id].sections, new Date());
                break;
            }

            case 'click': {
                if (message.target in liveConnections[socket.id]['clicks']) {
                    liveConnections[socket.id]['clicks'][message.target]++;
                } else {
                    liveConnections[socket.id]['clicks'][message.target] = 1;
                }
                break;
            }
        }

        liveConnections[socket.id]['eventQueue'].push(message);
    });

    socket.on('disconnect', async () => {
        const endTime = new Date();

        console.log(new Date(), `Disconnected ${socket.id}`);

        const summary = {
            session: liveConnections[socket.id].session,
            url: liveConnections[socket.id].url,
            date: Date.parse(liveConnections[socket.id]['startTime']),
            timeSpent: endTime - Date.parse(liveConnections[socket.id]['startTime']),
            readings: {},
            clicks: liveConnections[socket.id]['clicks']
        };

        handleSections(
            socket.id, 
            [], 
            liveConnections[socket.id].sections, 
            endTime
        );
        for (const section in liveConnections[socket.id]['readings']) {
            summary.readings[section] = liveConnections[socket.id]['readings'][section]['totalTime'];
        }

        console.log(new Date(), 'Summary', summary);
        clearTimeout(liveConnections[socket.id]['timer']);

        await saveSummary(summary);
        delete liveConnections[socket.id];
    });
}

const Visit = require('./models/analytics/Visit');
const Action = require('./models/analytics/Action');
const Reading = require('./models/analytics/Reading');
async function saveSummary(summary) {
    const visit = new Visit({
        user: summary.session,
        date: summary.date,
        page: summary.url,
        time: summary.timeSpent,
    });

    await visit.save();

    for (const target in summary.clicks) {
        const action = new Action({
            visitId: visit._id,
            user: summary.session,
            page: summary.url,
            date: summary.date,

            type: 'click',
            target,
            count: summary.clicks[target],
        });
        await action.save();
    }

    for (const target in summary.readings) {
        const reading = new Reading({
            visitId: visit._id,
            user: summary.session,
            page: summary.url,
            date: summary.date,

            target,
            time: summary.readings[target],
        });
        await reading.save();
    }
}

function handleSections(id, activeSections, allSections, time) {
    for (const section of allSections) {
        // was active and still active
        if (activeSections.includes(section) && liveConnections[id]['readings'][section].active) {
            // nothing to do...
        
        // was not active, but became
        } else if (activeSections.includes(section) && !liveConnections[id]['readings'][section].active) {
            liveConnections[id]['readings'][section].active = true;
            liveConnections[id]['readings'][section].startTime = time;

        // was active, but it isn't anymore
        } else if (!activeSections.includes(section) && liveConnections[id]['readings'][section].active) {
            liveConnections[id]['readings'][section].active = false;
            liveConnections[id]['readings'][section].totalTime += time - Date.parse(liveConnections[id]['readings'][section].startTime);
            liveConnections[id]['readings'][section].startTime = 0;
        }
    }
}

module.exports = connectionHandler;