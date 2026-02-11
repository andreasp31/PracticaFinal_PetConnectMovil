import { Image, ImageBackground } from 'expo-image';
import {StyleSheet, View, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useRouter, Stack} from 'expo-router';

export default function HomeScreen() {

  //Para cambiar entre pantallas
  const router = useRouter();
  //lo que se va a mostrar en pantalla: uso botones, imágenes y text
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.textoCabecera}>
          <Text style={styles.textosCuenta}>Nombre</Text>
          <Image source={require('@/assets/images/logoPet.png')} style={styles.foto}></Image>
          <View style={styles.iconos}>
            <Image source={require('@/assets/images/facebook.svg')} style={styles.icono} resizeMode="contain"></Image>
            <Image source={require('@/assets/images/Instagram.svg')} style={styles.icono} resizeMode="contain"></Image>
            <Image source={require('@/assets/images/tiktok.svg')} style={styles.icono2} resizeMode="contain"></Image>
          </View>
      </View>
      <ImageBackground style={styles.cabecera} source={require('@/assets/images/fondoPerro23.png')}>  
      </ImageBackground>
      <View style={styles.cajaScroll}>
        <ScrollView horizontal={true} contentContainerStyle={styles.container2}>
          <TouchableOpacity style={styles.miBoton2} onPress={() => router.push("/PantallaInicio")}>
            <Text style={styles.miTextoBoton}>Nuevas Actividades</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.miBoton1} onPress={() => router.push("/PantallaRegistro")}>
            <Text style={styles.miTextoBoton}>Mis Actividades</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.miBoton1} onPress={() => router.push("/PantallaRegistro")}>
            <Text style={styles.miTextoBoton}>Adoptar</Text>
          </TouchableOpacity>
        </ScrollView>
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
  textoCabecera:{
    display:"flex",
    flexDirection:"row",
    gap:20,
    width:400,
    alignItems:"center",
    paddingLeft:30,
    marginTop:30,
    height:50
  },
  cajaScroll:{
    height:65,
    width:360
  },
  textosCuenta:{
    color:"#110501",
    marginTop:25,
    padding:8,
    fontWeight:500,
    height:40,
    borderRadius:15
  },
  cabecera:{
    width:400,
    height:150,
    marginTop:30
  },
  container2: {
    display:"flex",
    flexDirection:"row",
    gap:10,
    justifyContent:"center",
    paddingHorizontal: 20,
    height:30,
    marginTop:20,
    alignItems:"center"
  },
  iconos:{
    display:"flex",
    flexDirection:"row",
    alignItems:"center",
    gap:15,
    marginTop:20
  },
  icono:{
    width:20,
    height:25,
  },
  icono2:{
    width:20,
    height:20,
  },
  miBoton1:{
    color:"#110501",
    borderColor:"#110501",
    borderWidth:1,
    padding:13,
    paddingLeft: 27,
    paddingRight: 27,
    borderRadius: 20,
    margin:5,
    height:45
  },
  miBoton2:{
    backgroundColor: "#eec699",
    color:"#110501",
    padding:13,
    paddingLeft: 27,
    paddingRight: 27,
    borderRadius: 20,
    margin:5,
    height:45
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
    marginTop: 40,
    height: 150,
    width: 150,
    resizeMode: "contain"
  },
  foto2: {
    marginTop: -140,
    height: 240,
    width: 350,
    resizeMode: "contain"
  }
});
