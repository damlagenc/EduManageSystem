const User = require("../models/_userModel");
const Blacklist = require("../models/_blacklistModel");
const jwt = require("jsonwebtoken");
const md5 = require("md5");
require("dotenv").config();
const logger = require('../../logger');

//Giriş yapma fonk
const postLogin = async (req, res, next) =>
{
    try
    {
        const { username, password } = req.body;

        if (!username || !password)
        {
            logger.error("Username and password are required.");
            return res.status(400).json({ error: "Username and password are required." });
        }

        const user = await User.findOne({ username: username });

        if (!user)
        {
            logger.error("User doesn't exist.");
            return res.status(401).json({ error: "User doesn't exist." });
        }

        const hashedPassword = md5(password);

        if (hashedPassword !== user.password)
        {
            logger.error("Wrong username and password combination.");
            return res.status(401).json({ error: "Wrong username and password combination." });
        }
        //token üretme
        const generateAccessToken = await jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "24h" }
        );

        logger.info(`User logged in: ${username}`);
        res.status(200).json({
            status: "success",
            token: generateAccessToken,
            message: "You have successfully logged in.",
        });
    } catch (error)
    {
        logger.error(`postLogin Error: ${error}`);
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }
};


//Kayıt olma fonk
const postRegister = async (req, res, next) =>
{
    try
    {
        const { username, password, role } = req.body;

        if (!username || !password || !role)
        {
            logger.error("Please do not leave any field blank.");
            return res.status(400).json({ error: "Please do not leave any field blank." });
        }

        const findUser = await User.findOne({ username: username });

        if (!findUser)
        {
            const user = new User({
                username: username,
                password: md5(password),
                role: role
            });
            await user.save();
            logger.info(`New user registered: ${username}`);
            res.status(200).json({
                status: "success",
                message: "You have successfully registered.",
            });
        } else
        {
            logger.error("This user already exists.");
            return res.status(409).json({ error: "This user already exists." });
        }
    } catch (error)
    {
        logger.error(`postRegister Error: ${error}`);
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }
};

//Çıkış yapma fonk
const getLogout = async (req, res, next) =>
{
    try
    {
        const authHeader = req.headers["authorization"];
        if (!authHeader) return res.sendStatus(204);

        const checkIfBlacklisted = await Blacklist.findOne({ token: authHeader });
        // if true, send a no content response.
        if (checkIfBlacklisted) return res.sendStatus(204);
        // otherwise blacklist token
        const newBlacklist = new Blacklist({
            token: authHeader,
        });
        await newBlacklist.save();
        // Also clear request cookie on client

        res.status(200).json({ message: "You are logged out!" });
    } catch (error)
    {
        console.log("getLogout Error: " + error);
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }
};

//Şifre değişikliğini gerçekleştiren fonk
const postChangePassword = async (req, res, next) =>
{
    try
    {
        const { oldPass, newPass } = req.body;

        if (oldPass && newPass)
        {
            const user = await User.findById(req.user);

            const hashedPassword = md5(oldPass);

            if (hashedPassword !== user.password)
            {
                return res
                    .status(401)
                    .json({ error: "Wrong username and password combination." });
            } else
            {
                await User.findByIdAndUpdate(req.user, { password: md5(newPass) });
                res
                    .status(200)
                    .json({ status: "success", message: "Password changed" });
            }
        } else
        {
            return res.status(401).json({ error: "Check the fields" });
        }
    } catch (error)
    {
        console.log("postChangePassword Error: " + error);
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }
};

//Kullanıcının profilini getiren fonk
const getProfile = async (req, res, next) =>
{
    try
    {
        const courses = await courses.find({ userId: req.user });
        res.status(200).json({
            status: "success",
            data: courses,
            message: "Process successful",
        });
    } catch (error)
    {
        console.log("getProfile Error: " + error);
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }
};
// Kullanıcıları getiren fonksiyon
const getUsers = async (req, res, next) =>
{
    try
    {
        const users = await User.find(); // Tüm kullanıcıları getir
        res.status(200).json(users); // Kullanıcıları JSON formatında gönder
    } catch (error)
    {
        res.status(500).json({ message: "Sunucu hatası", error: error }); // Hata durumunda 500 kodu ile hata mesajını gönder
    }
};
module.exports = {
    postLogin,
    postRegister,
    getLogout,
    postChangePassword,
    getProfile,
    getUsers,
};
