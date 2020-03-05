const {Schema, model} = require('mongoose');

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

    content: {
        type: String,
        require: true,
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
    page.renderPath = 'cached_pages/' + page.title;
});

const ejs = require('ejs');
const fs = require('fs');

function saveEJSFile(page) {
    fs.writeFileSync(page.filePath, page.content, 'utf-8');
}

async function generateCachedHTML(page) {
    const html = await ejs.renderFile(page.filePath, {
        title: page.title,
        logoText: "logo",
        navButtons: page.navButtons,
    });

    const cachedPagePath = 'public/' + page.title + '.html';
    fs.writeFileSync(cachedPagePath, html, 'utf-8');    
}


pageSchema.post('validate', async (page) => {
    saveEJSFile(page);
    await generateCachedHTML(page);
});

module.exports = model('Page', pageSchema);
