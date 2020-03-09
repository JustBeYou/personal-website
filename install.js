const installerConfig = require('./default/installer.json');
const database = require('./database.js');
const Page = require('./models/page.js');
const process = require('process');
const fs = require('fs');
const {ncp} = require('ncp');

async function install() {
    console.warn("If there is any content in the database it will be deleted!");
    await database();
    await copyResources();
    await installWebpages();
}

async function copyResources() {
    await ncp('default/resources/images', 'public/images');
    await ncp('default/resources/javascripts', 'public/javascripts');
    await ncp('default/resources/stylesheets', 'public/stylesheets');
    await ncp('default/parts', 'views/parts');
}

async function installWebpages() {
    console.log("Installing default web pages...");
    await Page.remove({});
    
    for (const page of installerConfig.pages) {
        const content = fs.readFileSync(page.filePath, 'utf-8');
        delete page.filePath;
        
        const newPage = new Page({
            ...page,
            content,
        });
            
        await newPage.save();
        console.log("Created", page.title);
    }
    
    console.log("Done.");
}

install()
    .then(() => {
        console.log("Installed successfully.");
        process.exit(0);
    })
    .catch((err) => {
        console.log("Could not install.", err.toString());
        process.exit(-1);
    });