import React from 'react'
import {Box, 
  Container, 
  Text, 
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react'
import Login from '../authentication/Login'
import Signup from '../authentication/Signup'

const HomePage = () => {
  return (
    <Container>
      <Box
        d="flex"
        justifyContent="center"
        p={3}
        bg="white"
        w="100%"
        m="40px 0 15px 0"
        borderRadius="lg"
        borderWidth="1px"
      >
        <Text fontSize="4xl" fontFamily="Work sans" color="black" textAlign='center'>
          Chat App
        </Text>
      </Box>
      <Box bg="white" w="100%" p={4} borderRadius="lg" borderWidth="1px">
        {/* Las tabs funcionan como pestanas para seleecionar una opcion */}
        <Tabs isFitted variant="soft-rounded">
          <TabList mb="1em">
            {/* En este caso estamos manejando las opciones de login y signup para registro y logeo respectivamente */}
            <Tab>Login</Tab>
            <Tab>Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              {/* Si seleccionamos login nos vamos a login  */}
              <Login />
            </TabPanel>
            <TabPanel>
              {/* Lo mismo si seleccionamos signup nos vamos a registro */}
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  )
}

export default HomePage