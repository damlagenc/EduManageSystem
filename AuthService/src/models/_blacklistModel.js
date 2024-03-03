const mongoose = require("mongoose");


//Süresi dolmuş veya çıkış yapılmış (kullanılamaz olmuş) tokenların eklendiği veritabanı modeli
const BlacklistSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: true,
            ref: "User",
        },
    },
    { collection: "blacklist", timestamps: true }
);
const Blacklist = mongoose.model("Blacklist", BlacklistSchema);

module.exports = Blacklist;