const mongoose = require("mongoose");
const Schema = mongoose.Schema;


//Kullanıcılar Veritabanı Modeli
const userSchema = new Schema(
    {
        username: {
            type: String,
            trim: true,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            trim: true,
            required: true,
        },
        role: {
            type: String,
            required: true,
            enum: ['teacher', 'student'], // Rolün sadece 'öğretmen' veya 'öğrenci' olabileceğini belirtir
        },

    },
    { collection: "user", timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
