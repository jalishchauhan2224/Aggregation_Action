import jwt from "jsonwebtoken";

const generateToken = (payload) =>{
    const secretKey = process.env.PRIVATE_KEY;
    const options = {
        expiresIn : "1h"
    };
    const token = jwt.sign(payload,secretKey,options);
    return token;
}

export default generateToken