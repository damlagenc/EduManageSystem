const User = require("../models/_userModel");
const Blacklist = require("../models/_blacklistModel");
const jwt = require("jsonwebtoken");
const md5 = require("md5");
require("dotenv").config();

//Giriş yapma fonk
const postLogin = async (req, res, next) =>
{
    try
    {
        const { username, password } = req.body;

        if (!username || !password)
        {
            return res
                .status(400)
                .json({ error: "Username and password are required." });
        }

        const user = await User.findOne({ username: username });

        if (!user)
        {
            return res.status(401).json({ error: "User doesn't exist." });
        }

        const hashedPassword = md5(password);

        if (hashedPassword !== user.password)
        {
            return res
                .status(401)
                .json({ error: "Wrong username and password combination." });
        }

        const generateAccessToken = await jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "24h" }
        );

        res.status(200).json({
            status: "success",
            token: generateAccessToken,
            message: "You have successfully logged in.",
        });
    } catch (error)
    {
        console.log("postLogin Error: " + error);
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
        console.log(req.body);

        if (!username || !password || !role)
        {
            return res
                .status(400) // 401 Unauthorized değil, 400 Bad Request daha uygun olur.
                .json({ error: "Please do not leave any field blank." });
        }

        // Role değerinin geçerli olup olmadığını kontrol et
        if (!['teacher', 'student'].includes(role))
        {
            return res.status(400).json({ error: "Invalid role. Must be 'teacher' or 'student'." });
        }

        const findUser = await User.findOne({ username: username });
        console.log(findUser);
        if (!findUser)
        {
            const user = new User({
                username: username,
                password: md5(password),
                role: role // Kullanıcı oluştururken role değerini de kaydet
            });
            await user.save();
            res.status(200).json({
                status: "success",
                message: "You have successfully registered.",
            });
        } else
        {
            return res.status(409) // 409 Conflict, kayıt olan kullanıcı zaten varsa daha uygun bir durum kodu.
                .json({ error: "This user already exists." });
        }
    } catch (error)
    {
        console.log("postRegister Error: " + error);
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
        const surveys = await Survey.find({ userId: req.user });
        res.status(200).json({
            status: "success",
            data: surveys,
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

module.exports = {
    postLogin,
    postRegister,
    getLogout,
    postChangePassword,
    getProfile,
};
