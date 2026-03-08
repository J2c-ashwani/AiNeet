import fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';

let dataBuffer = fs.readFileSync(process.argv[2]);

pdf(dataBuffer).then(function (data) {
    console.log(data.text.substring(0, 2000));
}).catch(err => console.error(err));
