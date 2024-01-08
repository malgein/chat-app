import React, {useState} from 'react'
import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import { useToast } from '@chakra-ui/toast';
import axios from 'axios'
// import {useHistory} from 'react-router-dom'

const Signup = () => {

// Version deployada del backend
  const ENDPOINT = 'https://chat-app-production-3083.up.railway.app/'


  //  http://localhost:5000/
  // https://chat-app-production-3083.up.railway.app/

	//Estado que representa  el mostrar o no la contraseña
  const [show, setShow] = useState(false);
	//Nonbre del usuario que se registra
  const [name, setName] = useState();
	//Email del usuario que se registra
  const [email, setEmail] = useState();
	//Estado para el password confirmando asi la misma
  const [confirmpassword, setConfirmpassword] = useState();
	//Password del usuario que se registra
  const [password, setPassword] = useState();
  const [pic, setPic] = useState();
	const [loading, setLoading] = useState(false)
	//Constante hecha paara usar las norificaciones de toast
	const toast = useToast()

	// const history = useHistory()

	//hanleclik que activa la muestra de la clave  la oculta
  const handleClick = () => setShow(!show);

	//funcion que se encarga de agregar las imagenes del usuario
	const postDetails = (pics) => {
		
		//Si el archivo anidado no existe envia una notificacion de alerta, es decir cuando decidimos no seleccionar nada
		setLoading(true);
    if (pics === undefined) {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    // console.log(pics);
		//El formato de las imagenes debe ser exlusivamente  jpeg o png
    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
			//Establecemos que lo que anodaremos seran las pics(imagenes)
      data.append("file", pics);
			//El nombre de la app en clodinary podemos conseguir dicho nombre
      data.append("upload_preset", "chat-app");
			//Nombre del usuario de igual manera lo hallaremos en clooudinary
      data.append("cloud_name", "dz9ytnn8w");
			//Hacemos una peticion  a clodinary para traernos los datos del archivo recien subido
      fetch("https://api.cloudinary.com/v1_1/dz9ytnn8w/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
					// Esto nos trae como valor de resultado los datos del archivo que subimos y lo guardamos en el estado de pic
          setPic(data.url.toString());
          // console.log(data.url.toString());
					//Alternaremos en varias ocasiones con el cambio de valor del state de loading
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    } else {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }
	}

	//handle click que se ejecutara al oprimir el boton de enviar del formulario
	const submitHandler = async () => {
		setLoading(true);
		//Si enviamos el formulario sin el password y el email y el nombre y la confrimacion del password nos llega una notificacion de toast
    if (!name || !email || !password || !confirmpassword) {
      toast({
        title: "Please Fill all the Feilds",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }
		//Si la confirmacion del password no funciona nos llega un mensaje de que los password no funcionan
    if (password !== confirmpassword) {
      toast({
        title: "Passwords Do Not Match",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    // console.log(name, email, password, pic);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

			// const result = {
			// 	"name": name,
			// 	"email": email,
			// 	"password": password,
			// 	"pic" : pic
			// }


      const {data}  = await axios.post(
        `${ENDPOINT}api/user/`, 
					{
						name,
						email,
						password,
						pic
					},
					config
				);
      // console.log(data);
      toast({
        title: "Registration Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      // history.push("/chats");
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }

	}

  return (
		// componente de chakra ui para hacer formularios y cualquier otra cosa de frontend
		<VStack spacing="5px">
		<FormControl id="first-name" isRequired>
			<FormLabel>Name</FormLabel>
			<Input
				placeholder="Enter Your Name"
				onChange={(e) => setName(e.target.value)}
			/>
		</FormControl>
		<FormControl id="email" isRequired>
			<FormLabel>Email Address</FormLabel>
			<Input
				type="email"
				placeholder="Enter Your Email Address"
				onChange={(e) => setEmail(e.target.value)}
			/>
		</FormControl>
		<FormControl id="password" isRequired>
			<FormLabel>Password</FormLabel>
			<InputGroup size="md">
				<Input
					type={show ? "text" : "password"}
					placeholder="Enter Password"
					onChange={(e) => setPassword(e.target.value)}
				/>
				{/* el inputrightelement coloca a la derecha el boton de show en al input de password */}
				<InputRightElement width="4.5rem">
					<Button h="1.75rem" size="sm" onClick={handleClick}>
					{/* Representa el texto de mostrar o no la clave, si el estado show esta falso que lo esta por defecto muestra la palabra show si no esta false muestra hide, claro hay un event handler que al oprimir el boton cambia el valor de show a su valor opuesto */}
						{show ? "Hide" : "Show"}
					</Button>
				</InputRightElement>
			</InputGroup>
		</FormControl>
		<FormControl id="password" isRequired>
			<FormLabel>Confirm Password</FormLabel>
			<InputGroup size="md">
				<Input
					type={show ? "text" : "password"}
					placeholder="Confirm password"
					onChange={(e) => setConfirmpassword(e.target.value)}
				/>
				<InputRightElement width="4.5rem">
					<Button h="1.75rem" size="sm" onClick={handleClick}>
						{show ? "Hide" : "Show"}
					</Button>
				</InputRightElement>
			</InputGroup>
		</FormControl>
		{/* Formulario para agregar tu imagen de perfil */}
		<FormControl id="pic">
			<FormLabel>Upload your Picture</FormLabel>
			<Input
				type="file"
				p={1.5}
				accept="image/*"
				onChange={(e) => postDetails(e.target.files[0])}
			/>
		</FormControl>
		{/* el boton al enviar ejecuta un handler para enviar la informacion al backend y a la bd */}
		<Button
			colorScheme="blue"
			width="100%"
			style={{ marginTop: 15 }}
			onClick={submitHandler}
			isLoading={loading}
		>
			Sign Up
		</Button>
	</VStack>
  )
}

export default Signup