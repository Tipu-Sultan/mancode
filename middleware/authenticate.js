const jwt = require('jsonwebtoken');


function setUser(user,secretKey) {
    return jwt.sign({
        _id: user._id,
    },
    secretKey,
    { expiresIn: '1h' }
    )
}

function getUser(token,secretKey){
    if(!token) return null;
    try{
        return jwt.verify(token,secretKey);
    }catch(error){
       return null; 
    }
}
module.exports ={
    setUser,
    getUser
}