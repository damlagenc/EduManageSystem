const jwt = require("jsonwebtoken");
const Blacklist = require("../models/_blacklistModel");

const authenticateToken = async (req, res, next) =>
{
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.sendStatus(401);
    
    // Token'ı Bearer önekinden ayırma
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401); // Bearer token mevcut değilse

    const checkIfBlacklisted = await Blacklist.findOne({ token });

    if (checkIfBlacklisted)
        return res.status(401).json({ message: "This session has expired. Please login" });


    console.log(token);
    //token doğrulama
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) =>
    {
        if (err)
        {
            console.log(err);
            return res.status(401).json({ message: "This session has expired. Please login" });

        }

        const { id } = decoded;
        req.user = id;
        next();
    });
};

module.exports = {
    authenticateToken,
};
