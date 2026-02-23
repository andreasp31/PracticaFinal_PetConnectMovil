import { Image } from 'expo-image';
import {StyleSheet, View, TouchableOpacity, Text, TextInput } from 'react-native';
import { useRouter, Stack} from 'expo-router';
import React, { useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const [email, ponerEmail] = useState('');
  const [clave, ponerClave] = useState('');
  const [confirmarClave, ponerConfirmarClave] = useState('');
  const [nombre, ponerNombre] = useState('');
  const [apellidos, ponerApellidos] = useState('');
  const [errorMensaje, ponerMensaje] = useState('');
  //Para cambiar entre pantallas
  const router = useRouter();
  //lo que se va a mostrar en pantalla: uso botones, imágenes y text
  const registrar = async()=>{
      ponerMensaje('');
      try{
        const respuesta = await axios.post("http://10.0.2.2:3000/api/registro",{
          nombre: nombre,
          apellidos: apellidos,
          email: email,
          clave: clave,
          clave2: confirmarClave
        });
        router.push('/PantallaInicio');

      }
      catch (error: any) {
        let mensajeFinal = "Error al registrar";

        if (error.response && error.response.data) {
            const data = error.response.data;
            // Si usamos el nuevo formato .format() del backend:
            if (data.detalles) {
                // Buscamos el primer error que aparezca en el objeto formateado
                // Zod .format() devuelve algo como { nombre: { _errors: [] } }
                const primerCampoConError = Object.keys(data.detalles).find(key => key !== '_errors');
                if (primerCampoConError) {
                    mensajeFinal = data.detalles[primerCampoConError]._errors[0];
                }
            } 
            // Por si acaso sigue viniendo como mensaje directo
            else if (data.message) {
                mensajeFinal = data.message;
            }
        }
        ponerMensaje(mensajeFinal);
      }
  }
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Image source={require('@/assets/images/logoPet.png')} style={styles.foto}></Image>
      <View style={styles.textos}>
        <Text style={styles.texto}>Registrarse</Text>
      </View>
      <View style={styles.container3}>
        <TextInput style={styles.input} placeholder='Nombre' value={nombre} onChangeText={ponerNombre}></TextInput>
        <TextInput style={styles.input} placeholder='Apellidos' value={apellidos} onChangeText={ponerApellidos}></TextInput>
        <TextInput style={styles.input} placeholder='Introduce un correo' autoCapitalize='none' value={email} onChangeText={ponerEmail} keyboardType="email-address"></TextInput>
        <TextInput style={styles.input} placeholder='Introduce una contraseña' autoCapitalize='none' value={clave} onChangeText={ponerClave} secureTextEntry={true}></TextInput>
        <TextInput style={styles.input} placeholder='Repite la contraseña' autoCapitalize='none' value={confirmarClave} onChangeText={ponerConfirmarClave} secureTextEntry={true}></TextInput>
      </View>
      <View style={styles.container2}>
        <TouchableOpacity style={styles.miBoton1} onPress={registrar}>
          <Text style={styles.miTextoBoton}>Entrar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.miBoton2} onPress={() => router.push("/PantallaHome")}>
          <Text style={styles.miTextoBoton}>Volver</Text>
        </TouchableOpacity>
        <View style={styles.iconos}>
          <Image source={require('@/assets/images/facebook.svg')} style={styles.icono} resizeMode="contain"></Image>
          <Image source={require('@/assets/images/Instagram.svg')} style={styles.icono} resizeMode="contain"></Image>
          <Image source={require('@/assets/images/tiktok.svg')} style={styles.icono2} resizeMode="contain"></Image>
        </View>
      </View>
    </View>  
  );
}

//estilos
const styles = StyleSheet.create({
  container: {
    fontFamily: 'MiFuentePersonalizada',
    flex: 1,
    alignItems: 'center',
    backgroundColor: "white",
  },
  contenedor1:{
    display:"flex",
    flexDirection:"column",
    alignItems:"center",
    gap:2,
  },
  texto:{
    fontSize:20
  },
  input:{
    borderColor:"#110501",
    borderWidth: 1.5,
    borderRadius: 20,
    width:300,
    height:50,
    paddingLeft:15,
  },
  container2: {
    flex: 1,
    alignItems: 'center',
    gap:10,
    marginTop:-60,
  },
  container3: {
    alignItems: 'center',
    gap:10,
    marginTop:30,
  },
  iconos:{
    display:"flex",
    flexDirection:"row",
    alignItems:"center",
    gap:20,
  },
  icono:{
    width:25,
    height:25,
  },
  icono2:{
    width:20,
    height:24,
  },
  miBoton1:{
    backgroundColor: "#eec699",
    color:"#110501",
    padding:13,
    paddingLeft: 60,
    paddingRight: 60,
    borderRadius: 20,
    marginTop: 90
  },
  miBoton2:{
    padding:13,
    paddingLeft: 67,
    paddingRight: 67,
    borderRadius: 20,
    margin:5
  },
  textos:{
    display:"flex",
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
    marginTop:-20,
    marginLeft:30, 
    marginRight:30, 
    textAlign:"center",
    color:"black",
  },
  miTextoBoton:{
    color:"#110501",
  },
  textoDescripcion: {
    textAlign: "center", 
    color:"#110501",     
    fontSize: 14,
    marginBottom: 5,    
  },
  foto: {
    marginTop:30,
    height: 220,
    width: 220,
    resizeMode: "contain",
  },
  foto2: {
    marginTop: -180,
    height: 260,
    width: 400,
    resizeMode: "contain"
  }
});
