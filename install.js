const installerConfig = require('./default/installer.json');
const database = require('./database.js');
const Page = require('./models/page.js');
const User = require('./models/user.js');
const process = require('process');
const fs = require('fs');
const {ncp} = require('ncp');
const {exec} = require('child_process');

async function install() {
    console.warn("If there is any content in the database it could be deleted!");
    await database();

    let name = 'admin', password = 'admin', email = 'admin@example.com';
    if (process.argv.length < 4) {
        console.log("Using default creds...");
    } else {
        name     = process.argv[1];
        password = process.argv[2];
        email    = process.argv[3];
    }

    try {
        const newAdmin = new User({name, password, email, admin: true});
        await newAdmin.save();
        console.log('Admin:', newAdmin);
    } catch (err) {
        console.log('Error: ', err);
    }

    await copyResources();
    await installWebpages();
}

async function copyResources() {
    await exec(`mkdir -p public/admin &&
                mkdir -p public/images &&
                mkdir -p public/javascripts && 
                mkdir -p public/stylesheets &&
                mkdir -p views/parts &&
                mkdir -p views/pages`);
    await new Promise(r => setTimeout(r, 1500));
    await ncp('default/resources/images', 'public/images');
    await ncp('default/resources/javascripts', 'public/javascripts');
    await ncp('default/resources/stylesheets', 'public/stylesheets');
    await ncp('default/parts', 'views/parts');
    await new Promise(r => setTimeout(r, 1500));
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
