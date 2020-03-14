const fs = require('fs');
const database = require('./database.js');
const Page = require('./models/page.js');
const md5 = require('md5');

async function watchDog() {
    await database();
    const pages = await Page.find({});

    for (const page of pages) {
        // original file path
        const path = page.filePath.replace('views', 'default');
        console.log(`Watching file ${path}.`);
        watchFile(page._id, path);
    }
}

const fsDelay = 200;

function watchFile(id, path) {
    let md5Prev = null;
    let fsWait = null;

    fs.watch(path, async (event, filename) => {
        if (filename && event === 'change') {
            if (fsWait) return ;
            fsWait = setTimeout(() => {
                fsWait = false;
            }, fsDelay);
            
            // sometimes readFileSync will fail and it will return an emtpy string
            let content = '';
            while (content === '') content = fs.readFileSync(path, 'utf-8');

            const md5Current = md5(content);
            if (md5Current === md5Prev) {
                return ;
            }
            console.log(`Page ${filename} with id ${id} has changed. (${md5Prev})`);
            md5Prev = md5Current;

            const page = await Page.findById(id);
            page.content = content;
            await page.save();
            console.log(`Page ${filename} updated. (${md5Current})`);
        }
    });
}

watchDog();