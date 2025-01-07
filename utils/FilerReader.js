var http = require('http');
var fs = require('fs');


function htmlFileRead(name , data){
    return new Promise(function(resolve, reject) {
        fs.writeFile(`${appRoot}/PdfHtml/${name}.html`, data, function (err) {
            if (err) throw err;
            resolve('Saved');
          });
    })
    

}
module.exports = {
    htmlFileRead 
}

