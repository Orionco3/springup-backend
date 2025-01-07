const jwt = require("jsonwebtoken");
const user = require("../models/user");

function authenticateToken(req,res,next){
    const authHeader = req.headers['authorization']
    const token = authHeader
   
    if(token == null) res.sendStatus(401);

    jwt.verify(token, process.env.SECRET_TOKEN_KEY, (err, user)=>{
        if(err) return res.sendStatus(403)
        req.user = user;
        next();
    })
}
module.exports = authenticateToken;