const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {accessChat, fetchChats, createGroupChat, renameGroup, removeFromGroup, addToGroup} = require('../controllers/chatControllers')

const router = express.Router();

//Trae el chat uno a uno de un usuario con otro, si no existe el chat lo crea
router.route("/").post(protect, accessChat);
//trae todos los chats de un usuario particular
router.route("/").get(protect, fetchChats);
router.route("/group").post(protect, createGroupChat);
router.route("/rename").put(protect, renameGroup);
router.route("/groupremove").put(protect, removeFromGroup);
router.route("/groupadd").put(protect, addToGroup);

module.exports = router;