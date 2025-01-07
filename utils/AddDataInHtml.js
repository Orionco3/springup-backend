var cons = require('consolidate');

function HtmlHelper(path , data){
        return new Promise(function(resolve, reject) {
            cons.swig(`${appRoot}/PdfHtml/${path}.html`, data, function(err, html){
                if (err)  resolve(false)
                resolve(html)
              });
          });   
}

module.exports = {
    HtmlHelper
}