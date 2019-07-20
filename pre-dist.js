const shell = require("shelljs");

// Copy files to release dir
shell.cp("-R", "pre-dist/", "dist/");
