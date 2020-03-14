const {Schema, model} = require('mongoose');
const config = require('../config.json');

const pageSchema = new Schema({
    title: {
        type: String,
        unique: true,
        required: true,
    },

    filePath: {
        type: String,
        unique: true,
    },

    renderPath: {
        type: String,
        unique: true,
    },

    navButtons: {
        type: Array,
    },

    hasAsideMenu: {
        type: Boolean,
        default: false,
    },

    content: {
        type: String,
        require: true,
    },

    admin: {
        type: Boolean,
        default: false,
    }
});

pageSchema.post('validate', (page) => {
    if (page.navButtons.length > 4) {
        throw new Error('No more than 4 navigation buttons!');
    }

    if (page.title.includes('/') || page.title.includes('.')) {
        throw new Error('Invalid characters in title.');
    }

    page.filePath = 'views/pages/' + page.title + '.ejs';
    page.renderPath = 'pages/' + page.title;
});

const ejs = require('ejs');
const fs = require('fs');

function saveEJSFile(page) {
    fs.writeFileSync(page.filePath, page.content, 'utf-8');
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

async function generateCachedHTML(page) {
    const html = await ejs.renderFile(page.filePath, {
        title: capitalizeFirstLetter(page.title),
        logoText: config.logo,
        navButtons: page.navButtons,
        hasAsideMenu: page.hasAsideMenu,
    });

    let cachedPagePath = 'public/' + page.title + '.html';
    if (page.admin === true) {
        cachedPagePath = cachedPagePath.replace('public/', 'public/admin/');
    }
    fs.writeFileSync(cachedPagePath, html, 'utf-8');    
}


pageSchema.post('validate', async (page) => {
    saveEJSFile(page);
    await generateCachedHTML(page);
});

module.exports = model('Page', pageSchema);
