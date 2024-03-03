const jwt = require("jsonwebtoken");
const Blacklist = require("../models/_blacklistModel");


//Giriş yapmak isteyen kişinin elindeki tokenın kontrol edildiği kısım
const authenticateToken = async (req, res, next) =>
{
    const authHeader = req.headers["authorization"]; // get the session cookie from request header
    if (!authHeader) return res.sendStatus(401); // if there is no cookie from request header, send an unauthorized response.
    const checkIfBlacklisted = await Blacklist.findOne({ token: authHeader }); // Check if that token is blacklisted
    // if true, send an unathorized message, asking for a re-authentication.
    if (checkIfBlacklisted)
        return res
            .status(401)
            .json({ message: "This session has expired. Please login" });
    // Verify using jwt to see if token has been tampered with or if it has expired.
    // that's like checking the integrity of the cookie
    jwt.verify(authHeader, process.env.JWT_SECRET_KEY, async (err, decoded) =>
    {
        if (err)
        {
            // if token has been altered or has expired, return an unauthorized error
            return res
                .status(401)
                .json({ message: "This session has expired. Please login" });
        }

        const { id } = decoded; // get user id from the decoded token
        req.user = id; // put the data object into req.user
        next();
    });



};

module.exports = {
    authenticateToken,
};
