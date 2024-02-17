const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const notificationSchema = mongoose.Schema({
  type: { type: String, required: true }, // Tipo de notificación (puedes personalizar según tus necesidades)
  content: { type: String, required: true,  default: [] }, // Contenido de la notificación
});

const userSchema = mongoose.Schema(
  {
    name: { type: "String", required: true },
    email: { type: "String", unique: true, required: true },
    password: { type: "String", required: true },
    pic: {
      type: "String",
      required: true,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    notifications: [notificationSchema], 
  },
  { timestaps: true }
);

//Metodo para comparar la clave de los usuarios al hacer login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified) {
    next();
  }

  //metodo que encripta la clave del usuario que se logea
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

module.exports = User;