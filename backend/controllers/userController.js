const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require('../config/generateToken')

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, pic } = req.body;
  
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please Enter all the Feilds");
    }
  
    const userExists = await User.findOne({ email });
  
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }
  
    const user = await User.create({
      name,
      email,
      password,
      pic,
    });
  
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        pic: user.pic,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("User not found");
    }
  });

	//Metodo de login del usuario
	const authUser = asyncHandler(async (req, res) => {
		const { email, password } = req.body;
	
		const user = await User.findOne({ email });
	
		if (user && (await user.matchPassword(password))) {
			res.json({
				_id: user._id,
				name: user.name,
				email: user.email,
				isAdmin: user.isAdmin,
				pic: user.pic,
				token: generateToken(user._id),
			});
		} else {
			res.status(401);
			throw new Error("Invalid Email or Password");
		}
	});
	
	//controlador cuya funcion es buscar usuarios por name y email en la aplicacion de chat
  const allUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search
      ? {
				//or es un operador de mongoDB
          $or: [
						//La i describe que la coincidencia puede ser indiferente a mayusculas 
            { name: { $regex: req.query.search, $options: "i" } },
						//Buscamos a traves de los regex coincidencias en queries de name y email
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};
  
		//buscamos en la BD usuarios con las coincidencia de las queries alla arriba es decir  buscamos usuarios por email y name 
		//la linea del _id explica que buscara todos los usuarios menos quien esta logeado 
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.send(users);
  });



	module.exports ={registerUser, authUser, allUsers}