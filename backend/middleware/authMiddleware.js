const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const asyncHandler = require("express-async-handler");

//Este middleware es creado con el proposito de servir antes de llegar al controler de allUsers ay de varioos controladores tanto de chats, como de usuarios y mensajes, si el token de ese usuario es valido o si esta logeado correctamente8
const protect = asyncHandler(async (req, res, next) => {
    let token;
  
    if (
			//Aqui en los headers el middleware recibe el token del usuario que genera cuando se logea o se registra
      req.headers.authorization &&
			// esta linea especifica que el token es de tipo bearer
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
				// aqui partimos el contenido del token para usar partes de el que necesitamos
        token = req.headers.authorization.split(" ")[1];
  
        //decodes token id
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
				//Una vez decodificado el token buscamos en la BD el usuario a traves del id que nos da el token sin el password
        req.user = await User.findById(decoded.id).select("-password");
  
        next();
      } catch (error) {
        res.status(401);
        throw new Error("Not authorized, token failed");
      }
    }
  
    if (!token) {
      res.status(401);
      throw new Error("Not authorized, no token");
    }
  });

	
  
  module.exports = { protect };