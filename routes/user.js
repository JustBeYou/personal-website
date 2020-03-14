const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const {safeResponse} = require('../error.js');
const {adminMiddleware} = require('../auth.js');

router.get('/user', adminMiddleware, async (req, res) => {
    await safeResponse(res, async () => {
        const users = await User.find({});

        res.json({users});
    });
});

router.put('/user', adminMiddleware, async (req, res) => {
    await safeResponse(res, async () => {
        const user = new User(req.body);
        await user.save();

        res.json({user});
    });
});

router.post('/user/:id', adminMiddleware, async (req, res) => {
    await safeResponse(res, async () => {
        const user = await User.findById(req.params.id);
        Object.assign(user, req.body);
        await user.save();

        res.json({user});
    });
});

router.delete('/user/:id', adminMiddleware, async (req, res) => {
    await safeResponse(res, async () => {
        const user = await User.findById(req.params.id);
        await user.delete();

        res.json({});
    });
});

module.exports = router;