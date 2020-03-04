var express = require('express');
var router = express.Router();

function createNavButton(label, icon, href) {
    return {label, icon, href};
}

const navButtons = [
    createNavButton("Home", "fas fa-home", "#home"),
    createNavButton("Projects", "fas fa-project-diagram", "#projects"),
    createNavButton("About", "fas fa-address-card", "#about"),
];

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: "LittleWho", logoText: "Logo", navButtons });
});

module.exports = router;
