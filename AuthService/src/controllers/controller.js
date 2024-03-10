const User = require("../models/_userModel");
const Blacklist = require("../models/_blacklistModel");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const logger = require('../../logger');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { authenticateToken } = require('../middlewares/authorization');



mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() =>
{
    console.log('Connected to the MongoDB');
}).catch(err =>
{
    console.error('Could not connect to MongoDB...', err);
});

const postLogin = ('/api/auth/login', async (req, res) =>
{
    const { username, password } = req.body;

    try
    {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).send('User not found');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send('Incorrect Password!');

        // User matched, create JWT Payload
        const payload = {
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: 3600 }, (err, token) =>
        {
            if (err) throw err;
            res.status(200).json({ token });
        });

    } catch (e)
    {
        logger.error(`Login Error: ${e.message}`);
        res.status(500).send('Server Error');
    }
});

const postRegister = ('/api/auth/register', async (req, res) =>
{
    const { username, password, role } = req.body;

    try
    {
        let user = await User.findOne({ username });
        if (user)
        {
            return res.status(400).send('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({
            username,
            password: hashedPassword,
            role,
        });

        await user.save();

        res.status(201).send('User registered successfully');
    } catch (error)
    {
        logger.error(`Registration Error: ${error.message}`);
        res.status(500).send('Error in Saving');
    }
});

// Çıkış yapma fonksiyonu
const getLogout = async (req, res) =>
{
    // Token'ı request header'dan al
    const token = req.headers['authorization']?.split(' ')[1];

    if (token)
    {
        // Token'ı kara listeye ekle veya başka bir yöntemle geçersiz kıl
        // Bu örnekte, Blacklist modelini kullanarak token'ı saklıyoruz.
        const blacklistedToken = new Blacklist({ token });
        await blacklistedToken.save();

        res.status(200).send('Logged out successfully');
    } else
    {
        res.status(400).send('No token provided');
    }
};

// Şifre değiştirme fonksiyonu

const postChangePassword = async (req, res, next) =>
{
    const { oldPass, newPass } = req.body;
    // Token'dan kullanıcı ID'sini al
    const userId = req.user.user.id;

    if (!oldPass || !newPass)
    {
        return res.status(400).json({ error: "Please provide both old and new password." });
    }

    try
    {
        const user = await User.findById(userId);
        if (!user)
        {
            return res.status(404).send('User not found');
        }

        // Eski şifrenin doğruluğunu kontrol et
        const isMatch = await bcrypt.compare(oldPass, user.password);
        if (!isMatch)
        {
            return res.status(400).send('Incorrect old password');
        }

        // Yeni şifreyi hash'le ve güncelle
        const hashedNewPassword = await bcrypt.hash(newPass, 10);
        user.password = hashedNewPassword;
        await user.save();

        res.status(200).json({ message: "Password changed successfully" });
    } catch (error)
    {
        console.log("postChangePassword Error: " + error);
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        });
    }
};

// Profil bilgilerini getirme fonksiyonu
const getProfile = async (req, res) =>
{
    const userId = req.user.id; // authenticateToken middleware'inden gelen kullanıcı ID'si

    try
    {
        const user = await User.findById(userId).select('-password'); // Şifreyi hariç tutarak kullanıcıyı getir
        if (!user)
        {
            return res.status(404).send('User not found');
        }

        res.status(200).json(user);
    } catch (error)
    {
        res.status(500).send('Server error');
    }
};
// Tüm kullanıcıları listeleme fonksiyonu
const getUsers = async (req, res) =>
{
    try
    {
        const users = await User.find().select('-password'); // Kullanıcıları şifreler hariç getir
        res.status(200).json(users);
    } catch (error)
    {
        res.status(500).send('Server error');
    }
};
module.exports = {
    postLogin,
    postRegister,
    getLogout,
    getProfile,
    getUsers,
    postChangePassword
}

