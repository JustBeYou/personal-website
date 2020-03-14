const jwt = require('jsonwebtoken');
const User = require('./models/user.js');
const config = require('./config.json');
const passwordHash = require('password-hash');
const {Router} = require('express');
const {safeResponse} = require('./error.js');

const router = new Router();
const cookieField = 'token';

router.post('/signin', async (req, res) => {
    await safeResponse(res, async () => {
        if (req.user !== null && req.user.admin === true) {
            res.json({redirect: 'admin'});
            return ;
        } else if (req.user !== null) {
            req.json({redirect: 'user'});
            return ;
        }

        const resp = await authUser(req.body.name, req.body.password);
        setCookie(res, resp.token);
        res.json(resp);
    });
});

router.post('/signout', async (req, res) => {
    await safeResponse(res, () => {
        clearCookie(res);
        res.json({message: 'signed out'});
    }); 
});

function setCookie(res, token) {
    res.cookie(cookieField, token, {maxAge: 9000000000, httpOnly: true, /*secure: true*/ });
    res.append('Set-Cookie', cookieField + '=' + token + ';');
}

function clearCookie(res) {
    res.clearCookie(cookieField);
}

async function authUser(name, password) {
    const user = await User.findOne({name});
    if (user == null) {
        throw 'User not found.';
    }

    const isValid = passwordHash.verify(password, user.password);
    console.log(password, user.password);
    if (!isValid) {
        throw 'Invalid password.';
    }

    return {token: jwt.sign({name: user.name, admin: user.admin}, config.secret), redirect: user.admin ? 'admin' : 'user'};
}

function authMiddleware(req, res, next) {
    req.user = null;

    const token = req.cookies[cookieField];
    if (token === undefined) {
        next();
        return ;
    }

    try {
        const user = jwt.verify(token, config.secret);
        req.user = user;
    } catch (err) {

    }

    next();
}

function userMiddleware(req, res, next) {
    if (req.user === null) {
        res.redirect('/signin.html');
        return ;
    }

    next();
}

function adminMiddleware(req, res, next) {
    if (req.user === null) {
        res.redirect('/signin.html');
        return ;
    }

    if (req.user.admin === false) {
        res.status(403).json({message: 'permission denied'});
        return ;
    }

    next();
} 

module.exports = {
    authMiddleware,
    userMiddleware,
    adminMiddleware,
    router,
};