module.exports =function (kicker){
    return async (req,res,next)=>{
        try{
             await kicker(req,res);
        }catch(ex){
            next(ex);
        }
    }
}