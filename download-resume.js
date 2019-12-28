const request = require("request");
const fs = require("fs");

let url = "https://github.com/jonfk/resume/releases/latest/download/Jonathan_Fokkan_Resume.pdf";

request(url).pipe(fs.createWriteStream("static/resume.pdf"));
