import jwt from 'jsonwebtoken';

function verify(req, res, next){
    const authHeader = req.headers.token;
    if(authHeader){
        
        const token = authHeader.split(" ")[1];

        jwt.verify(token, process.env.PW_CRYPT, (err, user)=>{
            if(err) res.status(403).json("token is not valid");
            req.user = user
            next();//continue execution after verification
        })
    }else{
        return res.status(401).json("you're not authenticated");
    }
}

export default verify