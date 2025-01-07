var pdf = require('html-pdf');
var options = { format: 'A4' };
 
function GenertePdfCv(html , userId){
    return new Promise(function(resolve, reject) {
        pdf.create(html, options).toFile(`${appRoot}/Cv/${userId}-${new Date()}.pdf`, function(err, res) {
            if (err) return console.log(err);
            resolve(res)
          });
    })
}


function GenertePdfWithOutUser(html){
    return new Promise(function(resolve, reject) {
        var name = new Date();
            name = name + ".pdf"
        pdf.create(html, options).toFile(`${appRoot}/Cv/${name}`, function(err, res) {
            if (err) return console.log(err);
            resolve(name)
          });
    })
}




function GenertePdfForTest(html , name){
    return new Promise(function(resolve, reject) {
        pdf.create(html, options).toFile(`${appRoot}/Cv/${name}`, function(err, res) {
            if (err) return console.log(err);
            resolve(name)
          });
    })
}

module.exports = {
    GenertePdfCv,
    GenertePdfWithOutUser,
    GenertePdfForTest
}