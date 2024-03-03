const router = require("express").Router();
const controller = require("../controllers/controller");
const middleware = require("../middlewares/authorization")

//Giriş yapma
router.post("/login", controller.postLogin);

//Kayıt olma
router.post("/register", controller.postRegister);

//Çıkış yapma
router.get("/logout", middleware.authenticateToken, controller.getLogout);

//Şifre değişikliği işlemi
router.post("/change-password", middleware.authenticateToken, controller.postChangePassword);

//Kullanıcının profilini getirme
router.get("/profile", middleware.authenticateToken, controller.getProfile)

module.exports = router;
