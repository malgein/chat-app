const express = require("express");
const {
  allMessages,
  sendMessage,
} = require("../controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Ambas rutas son protegidas mediante un middleware
// Ruta que me trae todos los mensajes de una chat en particular mediante su id
router.route("/:chatId").get(protect, allMessages);
// Ruta qye crea un mensaje nuevo mediante un metodo post
router.route("/").post(protect, sendMessage);

module.exports = router;