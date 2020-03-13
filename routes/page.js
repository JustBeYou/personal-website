const express = require('express');
const router = express.Router();
const Page = require('../models/page.js');
const {safeResponse} = require('../error.js');
const config = require('../config.json');

router.get('/page/id/:id', async (req, res) => {
    await safeResponse(res, async () => {
        const page = await Page.findById(req.params.id);

        res.json({ page });
    });
});

router.get('/page/:title', async (req, res) => {
    await safeResponse(res, async () => {
        const page = await Page.findOne({title: req.params.title});

        res.render(page.renderPath, {
            title: page.title,
            logoText: config.logo,
            navButtons: page.navButtons,
            hasAsideMenu: page.hasAsideMenu,
        });
    });
});

router.put('/page', async (req, res) => {
    await safeResponse(res, async () => {
        const page = new Page(req.body);
        await page.save();

        res.json({ page });
    });
});

router.post('/page/:title', async (req, res) => {
    await safeResponse(res, async () => {
        const page = await Page.findOne({
            title: req.params.title,
        });
        Object.assign(page, req.body);
        await page.save();

        res.json({ page });
    });
});

router.delete('/page/:title', async (req, res) => {
    await safeResponse(res, async () => {
        const page = await Page.findOne({ 
            title: req.params.title 
        });
        await page.delete();

        res.json({});
    });
});

router.put('/page/:title/navButtons', async (req, res) => {
    await safeResponse(res, async () => {
        const page = await Page.findOne({
            title: req.params.title,
        });
        page.navButtons.push(req.body);
        await page.save();

        res.json({ page });
    });
});

router.delete('/page/:title/navButtons/:label', async (req, res) => {
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
