const express = require('express');
const router = express.Router();
const Page = require('../models/page.js');
const {safeResponse} = require('../error.js');
const config = require('../config.json');
const {adminMiddleware} = require('../auth.js');

router.get('/page/id/:id', async (req, res) => {
    await safeResponse(res, async () => {
        const page = await Page.findById(req.params.id);

        res.json({ page });
    });
});

router.get('/page/:title', async (req, res) => {
    await safeResponse(res, async () => {
        const page = await Page.findOne({title: req.params.title});

        const deps = {};
        for (const dep of page.deps) {
            const depModel = require(`./${dep}.js`);
            const all = await depModel.find({});
            deps[dep] = all;
        }

        res.render(page.renderPath, {
            title: page.displayTitle,
            logoText: config.logo,
            navButtons: page.navButtons,
            hasAsideMenu: page.hasAsideMenu,
            description: page.description,
            keywords: page.keywords,
            author: page.author,
            ...deps,
        });
    });
});

router.get('/page', adminMiddleware, async (req, res) => {
    await safeResponse(res, async () => {
        const pages = await Page.find({});

        res.json({ pages });
    });
});

router.put('/page', adminMiddleware, async (req, res) => {
    await safeResponse(res, async () => {
        const page = new Page(req.body);
        await page.save();

        res.json({ page });
    });
});

router.post('/page/id/:id', adminMiddleware, async (req, res) => {
    await safeResponse(res, async () => {
        const page = await Page.findById(req.params.id);
        Object.assign(page, req.body);
        await page.save();

        res.json({ page });
    });
});

router.delete('/page/:title', adminMiddleware, async (req, res) => {
    await safeResponse(res, async () => {
        const page = await Page.findOne({ 
            title: req.params.title 
        });
        await page.delete();

        res.json({});
    });
});

router.put('/page/:title/navButtons', adminMiddleware, async (req, res) => {
    await safeResponse(res, async () => {
        const page = await Page.findOne({
            title: req.params.title,
        });
        page.navButtons.push(req.body);
        await page.save();

        res.json({ page });
    });
});

router.delete('/page/:title/navButtons/:label', adminMiddleware, async (req, res) => {
    await safeResponse(res, async () => {
        const page = await Page.findOne({
            title: req.params.title,
        });
        page.navButtons = page.navButtons.filter((button) => {
            return button.label !== req.params.label;
        });
        await page.save();

        res.json({ page });
    });
});

module.exports = router;
