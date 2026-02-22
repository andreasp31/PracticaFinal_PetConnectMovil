import { Image } from 'expo-image';
import {StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { useRouter, Stack} from 'expo-router';

export default function HomeScreen() {

  //Para cambiar entre pantallas
  const router = useRouter();
  //lo que se va a mostrar en pantalla: uso botones, imágenes y text
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Image source={require('@/assets/images/logoPet.png')} style={styles.foto}></Image>
      <View style={styles.textos}>
        <Text>Más que un refugio, un punto de encuentro.</Text>
        <Text style={styles.textoDescripcion}>Conecta con nuestros animales a través de paseos, juegos y actividades guiadas diseñadas para fortalecer su felicidad y la tuya.</Text>
      </View>
      <View style={styles.container2}>
        <TouchableOpacity style={styles.miBoton1} onPress={() => router.push("/PantallaInicio")}>
          <Text style={styles.miTextoBoton}>Iniciar Sesión</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.miBoton2} onPress={() => router.push("/PantallaRegistro")}>
          <Text style={styles.miTextoBoton}>Registrarse</Text>
        </TouchableOpacity>
        <View style={styles.iconos}>
          <Image source={require('@/assets/images/facebook.svg')} style={styles.icono} resizeMode="contain"></Image>
          <Image source={require('@/assets/images/Instagram.svg')} style={styles.icono} resizeMode="contain"></Image>
          <Image source={require('@/assets/images/tiktok.svg')} style={styles.icono2} resizeMode="contain"></Image>
        </View>
      </View>
      <Image source={require('@/assets/images/fotoPerro.png')} style={styles.foto2}></Image>
    </View>  
  );
}

//estilos
const styles = StyleSheet.create({
  container: {
    fontFamily: 'MiFuentePersonalizada',
    flex: 1,
    marginTop:-40,
    alignItems: 'center',
    backgroundColor: "white",
  },
  container2: {
    flex: 1,
    alignItems: 'center',
    gap:10,
    marginTop:-30,
  },
  iconos:{
    display:"flex",
    flexDirection:"row",
    alignItems:"center",
    gap:20,
    marginTop:10,
  },
  icono:{
    width:30,
    height:35,
  },
  icono2:{
    width:30,
    height:30,
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
    backgroundColor: "#eec699",
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
    marginTop: 120,
    height: 220,
    width: 220,
    resizeMode: "contain"
  },
  foto2: {
    position: 'absolute', 
    bottom: 0,            
    height: 240,
    width: 350,
    resizeMode: "contain",
  }
});
