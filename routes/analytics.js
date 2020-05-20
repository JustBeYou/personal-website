const express = require('express');
const router = express.Router();
const Visit = require('../models/analytics/Visit');
const Reading = require('../models/analytics/Reading');
const Action = require('../models/analytics/Action');

function lastNDays (days) {
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
        const current = new Date();
        current.setHours(0, 0, 0, 0);
        current.setDate(current.getDate() - i);
        result.push(current);
    }

    return result;
}

router.post('/analytics/visitors', async (req, res) => {
    const pageName = req.body.page;
    const daysNumber = req.body.days;

    const result = [];
    const days = lastNDays(daysNumber);

    for (const day of days) {
        const nextDay = new Date(day.getTime());
        nextDay.setDate(nextDay.getDate() + 1);
        const found = await Visit.find({
            page: pageName,
            date: {
                '$gte': day,
                '$lte': nextDay,
            }
        });
        result.push({unique: new Set(found.map(visit => visit.user)).size, total: found.length});
    }

    res.json(result);
});

router.post('/analytics/reading', async (req, res) => {
    const pageName = req.body.page;
    const daysNumber = req.body.days;

    const result = {};

    const currentDay = new Date();
    const pastDay = new Date(currentDay.getTime());
    pastDay.setDate(pastDay.getDate() - daysNumber);

    const found = await Reading.find({
        page: pageName,
        date: {
            '$gte': pastDay,
            '$lte': currentDay,
        }
    });
    found.forEach(reading => {
        if (reading.target in result) {
            result[reading.target] += reading.time;
        } else {
            result[reading.target] = reading.time;
        }
    });

    for (const reading in result) {
        result[reading] /= 1000 * 60;
    }

    res.json(result);
});

router.post('/analytics/actions', async (req, res) => {
    const pageName = req.body.page;
    const daysNumber = req.body.days;
    const type = req.body.type;

    const result = {};

    const currentDay = new Date();
    const pastDay = new Date(currentDay.getTime());
    pastDay.setDate(pastDay.getDate() - daysNumber);

    const found = await Action.find({
        page: pageName,
        type,
        date: {
            '$gte': pastDay,
            '$lte': currentDay,
        }
    });
    found.forEach(action => {
        if (action.target in result) {
            result[action.target] += action.count;
        } else {
            result[action.target] = action.count;
        }
    });

    res.json(result);
});

module.exports = router;