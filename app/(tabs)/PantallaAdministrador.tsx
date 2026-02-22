import { Image, ImageBackground } from 'expo-image';
import {StyleSheet, View, TouchableOpacity, Text, ScrollView, FlatList, Modal, TouchableWithoutFeedback} from 'react-native';
import { useRouter, Stack, useFocusEffect} from 'expo-router';
import { useState, useEffect,useCallback } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Persona {
  usuarioEmail: string;
  estado: 'inscrito' | 'cancelado_tarde';
  hora: string;
}

interface Actividad {
  _id: string;
  nombre: string;
  descripcion: string;
  plazas: number;
  horarios: string[];
  fechaHora: string;
  personasApuntadas?: Persona[];
}

export default function HomeScreen() {
  //Para cambiar entre pantallas
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [modalVisible4, setModalVisible4] = useState(false);
  const [actividadSeleccionada, setActividadSeleccionada] = useState<Actividad | null>(null);
  const [horaSeleccionada, setHoraSeleccionada] = useState<string | null>(null);
  const [nombre, setNombre] = useState('Usuario');
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [emailUsuario, setEmailUsuario] = useState<string | null>(null);
  const [modalConfirmar, setModalConfirmar] = useState(false);
  const [actividadCancelar, setActividadCancelar] = useState<Actividad | null>(null);
  const horarios = ["09:00","11:00","13:00","17:00","19:00"];
  const abrirModal = (item: Actividad)=>{
    setActividadSeleccionada(item);
    setModalVisible(true);
  }
  const cerrarModal = () => {
    setModalVisible(false); 
    setHoraSeleccionada(null); 
  };
  const abrirModal3 = (item: Actividad)=>{
    setActividadSeleccionada(item);
    setModalVisible(true);
  }
  const cerrarModal3 = () => {
    setModalVisible(false); 
    setHoraSeleccionada(null); 
  };
  const abrirModal2 = ()=>{
    setActividadSeleccionada(null);
    setModalVisible2(true);
  }
  const cerrarModal2 = () => {
    setModalVisible2(false); 
  };
  const abrirModal4 = ()=>{
    setModalVisible4(true);
  }
  const cerrarModal4 = () => {
    setModalVisible4(false); 
  };
  const abrirConfirmar = () => {
    if (actividadSeleccionada) {
      setActividadCancelar(actividadSeleccionada);
      setModalConfirmar(true);
    } 
    else {
      console.log("Error: No hay actividad seleccionada");
    }
  };
  const cerrarConfirmar = () => {
    setModalConfirmar(false);
    setActividadCancelar(null);
  };
  const cargarActividades = async () => {
    if (!emailUsuario) return;
    try {
      const respuesta = await axios.get(`http://10.0.2.2:3000/api/mis-actividades/${emailUsuario}`);
      setActividades([...respuesta.data]);
     } 
     catch (error) {
      console.error("Error al traer actividades:", error);
    }
  };
  useEffect(() => {
  const recuperarDatos = async () => {
    const nombreGuardado = await AsyncStorage.getItem("nombreUsuario");
    const emailGuardado = await AsyncStorage.getItem("emailUsuario");
    if (nombreGuardado) setNombre(nombreGuardado);
    if (emailGuardado) setEmailUsuario(emailGuardado);
  };
  recuperarDatos();
  }, []);
  useFocusEffect(
  useCallback(() => {
    if (emailUsuario) {
      cargarActividades();
    }
  }, [emailUsuario])
);
  
  const cancelarReserva = async () => {
    if (!actividadCancelar || !emailUsuario){
      console.log("Faltan datos:", { actividadCancelar, emailUsuario });
      return;
    }
    const actividadId = actividadCancelar._id;
    console.log("Intentando cancelar:", { actividadId, emailUsuario });
    try {
      setModalConfirmar(false);
      setModalVisible(false);
      setActividadSeleccionada(null);
      setActividadCancelar(null);
      await axios.delete("http://10.0.2.2:3000/api/actividades/cancelar", {
        data: { 
          actividadId: actividadId, 
          email: emailUsuario 
        },
      });
      await cargarActividades();
       
    } catch (error) {
      console.error("Error al cancelar:", error);
    }
  };
  const actualizarHora = async () => {
    if (!actividadSeleccionada || !horaSeleccionada || !emailUsuario) return;
    try {
      await axios.put("http://10.0.2.2:3000/api/actividades/actualizarHora", {
        actividadId: actividadSeleccionada._id,
        email: emailUsuario,
        nuevaHora: horaSeleccionada
      });
      await cargarActividades();
      cerrarModal();
    } catch (error) {
      console.error("Error al actualizar hora:", error);
    }
  };
  const cargarHora = (actividad: Actividad) => {
    if (!actividad || !actividad.personasApuntadas || !emailUsuario) return "Sin hora";
    const registro = actividad.personasApuntadas.find(p => p.usuarioEmail === emailUsuario);
    return registro ? registro.hora : "No encontrado";
  };
  const formatearFecha = (fechaString: string) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
  });
}
  //lo que se va a mostrar en pantalla: uso botones, imágenes y text
  const tarjeta = ({ item }:{item : Actividad}) => {
    const horaReserva = cargarHora(item);
    return(
      <View style={styles.tarjeta}>
        <View style={styles.tarjetaInfo}>
          <View style={styles.tarjetaCabecera}>
            <Text style={styles.tarjetaTitulo}>{item.nombre}</Text>
            <TouchableOpacity onPress={() => abrirModal3(item)}>
              <Image source={require('@/assets/images/Edit.png')} contentFit="cover" style={styles.fotoEditar}></Image>
            </TouchableOpacity>
          </View>
          <Text style={styles.tarjetaDescripcion}>{item.descripcion}</Text>
          <Text style={styles.tarjetaDescripcion}>{formatearFecha(item.fechaHora)}</Text>
        </View>
      </View>
    ) 
  };
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.textoCabecera}>
          <Text style={styles.textosCuenta} onPress={abrirModal4}>{nombre}</Text>
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
          <TouchableOpacity style={styles.miBoton1} onPress={() => router.push("/PantallaUsuario")}>
            <Text style={styles.miTextoBoton}>Nuevas Actividades</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botonMenu}>
            <Text style={styles.miTextoBoton3}>Mis Actividades</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.miBoton1} onPress={() => abrirModal2()}>
            <Text style={styles.miTextoBoton}>Adoptar</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      <View style={styles.cajaScroll2}>
        <FlatList data={actividades} renderItem={tarjeta} keyExtractor={item => item._id} horizontal={false} showsVerticalScrollIndicator={true} style={styles.cajaScroll2} extraData={actividades}></FlatList>
      </View>
      <Modal transparent={true} visible={modalVisible} onRequestClose={cerrarModal3}>
        <View style={styles.fondoModal}>
          <View style={styles.modal2}>
            <View style={styles.modal2Cabecera}>
              <TouchableOpacity onPress={cerrarModal3}>
                <Image source={require('@/assets/images/botonCerrar.png')} contentFit="cover" style={styles.fotoCerrar}></Image>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonCancelar} onPress={abrirConfirmar}>
                <Text style={styles.textoBotonCancelar}>Cancelar Reserva</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.bloqueModal3}>
              <Text style={styles.tarjetaTitulo}>{actividadSeleccionada?.nombre}</Text>
              <View style={styles.bloqueFecha2}>
                <Text>Fecha: {actividadSeleccionada ? formatearFecha(actividadSeleccionada.fechaHora) : ''}</Text>
                <Text>Hora: {actividadSeleccionada ? cargarHora(actividadSeleccionada) : ''}</Text>
              </View>
              <Text style={styles.subtituloModal}>Cambio de hora:</Text>
              <View style={styles.contenedorHoras}>
                {horarios.map((hora)=>(
                  <TouchableOpacity key={hora} style={[ styles.botonHora,horaSeleccionada === hora && styles.botonHoraActivo]} onPress={() => setHoraSeleccionada(hora)}>
                    <Text style={[styles.textoHora,horaSeleccionada === hora && styles.textoHoraActivo]}>{hora}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.botonMenu2} onPress={actualizarHora}>
                <Text style={styles.miTextoBoton3}>Actualizar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal transparent={true} visible={modalVisible2} onRequestClose={cerrarModal2}>
        <View style={styles.fondoModal}>
          <View style={styles.modal}>
            <View>
              <TouchableOpacity onPress={cerrarModal2}>
                <Image source={require('@/assets/images/botonCerrar.png')} contentFit="cover" style={styles.fotoCerrar}></Image>
              </TouchableOpacity>
            </View>
            <View style={styles.bloqueModal2}>
              <Text style={styles.tarjetaTitulo2}>Próximamente!</Text>
              <Text style={styles.tarjetaTexto2}>Estamos creando un espacio dedicado a conectar animales de protectoras con familias que busquen un nuevo mejor amigo. Muy pronto podrás conocer sus historias, recibir asesoramiento sobre el proceso y dar el paso para cambiar una vida para siempre</Text>
              <Image source={require('@/assets/images/perroAdopta.png')} contentFit="cover" style={styles.fotoPerro}></Image>
            </View>
          </View>
        </View>
      </Modal>
      <Modal transparent={true} visible={modalConfirmar} onRequestClose={cerrarConfirmar}>
        <View style={styles.fondoModal2}>
          <View style={styles.modalConfirmar}>
            <Text style={styles.tarjetaTitulo2}>¿Estás seguro?</Text>
            <Text style={styles.texto6}>Vas a cancelar tu reserva para esta actividad. Esta acción no se puede deshacer.</Text>
            <View style={styles.bloqueBotones}>
              <TouchableOpacity style={styles.miBoton1} onPress={cerrarConfirmar}>
                <Text style={styles.miTextoBoton}>Volver</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonCancelar2} onPress={cancelarReserva}>
                <Text style={styles.textoBotonCancelar}>Sí, cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal transparent={true} visible={modalVisible4} onRequestClose={cerrarModal4}>
        <TouchableWithoutFeedback onPress={cerrarModal4}>
          <View style={styles.fondoModal02}>
            <TouchableWithoutFeedback>
              <View style={styles.modalConfirmar2}>
                <Text style={styles.tarjetaTitulo2}>Mi cuenta</Text>
                <TouchableOpacity  style={styles.botonCancelar2} onPress={() => {cerrarModal4(); router.push("/PantallaInicio");}}>
                  <Text style={styles.textoBotonCancelar}>Cerrar Sesión</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  modalConfirmar:{
    backgroundColor:"#ffffff",
    width:340,
    minHeight:200,
    borderRadius:25,
    padding:20,
    alignItems:"center",
    textAlign:"center",
    display:"flex",
    flexDirection:"column",
    gap:20
  },
  modalConfirmar2:{
    backgroundColor:"#ffffff",
    width:200,
    minHeight:100,
    borderRadius:25,
    padding:20,
    alignItems:"center",
    textAlign:"center",
    display:"flex",
    flexDirection:"column",
    gap:20
  },
  texto6:{
    textAlign:"center"
  },
  bloqueBotones:{
    display:"flex",
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
    gap:10
  },
  botonCancelar:{
    backgroundColor:"#460c0c",
    height:40,
    width:160,
    alignItems:"center",
    justifyContent:"center",
    borderRadius:18
  },
  botonCancelar2:{
    backgroundColor:"#460c0c",
    height:45,
    width:130,
    alignItems:"center",
    justifyContent:"center",
    borderRadius:18
  },
  textoBotonCancelar:{
    color:"#ffffff"
  },
  modal2Cabecera:{
    display:"flex",
    flexDirection:"row",
    gap:110,
    marginBottom:20
  },
  bloqueFecha2:{
    display:"flex",
    flexDirection:"row",
    gap:20,
    marginBottom:20
  },
  subtituloModal:{
    fontSize:18
  },
  fondoModal:{
    flex:1,
    backgroundColor:"rgba(0, 0, 0, 0.32)",
    justifyContent:"center",
    alignItems:"center"
  },
    fondoModal2:{
    flex:1,
    backgroundColor:"rgba(0, 0, 0, 0.32)",
    justifyContent:"center",
    alignItems:"center"
  },
  fondoModal02:{
    flex:1,
    backgroundColor:"rgba(0, 0, 0, 0.32)",
    justifyContent:"flex-start",
    alignItems:"flex-start",
    paddingTop:50,
    paddingLeft:30
  },
  fotoPerro:{
    width:100,
    height:220,
    alignSelf:"center",
  },
  contenedorHoras:{
    display:"flex",
    flexDirection:"row",
    gap:15,
    marginTop:10,
    justifyContent:"center",
    marginBottom:10
  },
  botonHora:{
    borderColor:"#110501",
    borderWidth:1,
    borderRadius: 15,
    padding:6
  },
  botonHoraActivo:{
    backgroundColor:"#110501",
    borderRadius: 15,
    padding:6
  },
  textoHora:{
    color:"#110501"
  },
  textoHoraActivo:{
    color:"#ffffffff"
  },
  fotoModal:{
    width:300,
    height:150,
    borderRadius:16,
    marginBottom:20,
    overflow:"hidden"
  },
  bloqueModal:{
    display:"flex",
    flexDirection:"column",
    gap:10
  },
  bloqueModal3:{
    display:"flex",
    flexDirection:"column",
    gap:10,
    alignItems:"center",
    textAlign:"center",
    justifyContent:"center"
  },
  fotoCerrar:{
    height:30,
    width:30,
    resizeMode: "contain"
  },
  fotoEditar:{
    height:25,
    width:25,
    margin:10,
    resizeMode: "contain"
  },
  modal:{
    backgroundColor:"#ffffff",
    width:340,
    minHeight:500,
    borderRadius:25,
    padding:20,
    alignItems:"center",
    textAlign:"center",
  },
  modal2:{
    backgroundColor:"#ffffff",
    width:340,
    minHeight:350,
    borderRadius:25,
    padding:20,
    alignItems:"center",
    textAlign:"center",
  },
  tarjeta:{
    color:"#110501",
    borderColor:"#110501",
    borderWidth:1,
    borderRadius: 20,
    margin:5,
    padding:10,
    minHeight:110,
    width:320,
    marginTop:15
  },
  tarjetaCabecera:{
    display:"flex",
    flexDirection:"row",
    justifyContent:"space-between",
    width:300,
    alignItems:"center",
    height:50
  },
  tarjetaInfo:{
    display:"flex",
    flexDirection:"column",
    gap:5
  },
  tarjetaTitulo:{
    fontSize:22,
    fontWeight:500
  },
  tarjetaTitulo2:{
    fontSize:22,
    fontWeight:500,
    alignSelf:"center"
  },
  tarjetaTexto2:{
    alignSelf:"center",
    display:"flex",
    textAlign:"center"
  },
  bloqueModal2:{
    display:"flex",
    flexDirection:"column",
    justifyContent:"center",
    textAlign:"center",
    gap:20
  },
  botonTarjeta:{
    backgroundColor: "#eec699",
    color:"#110501",
    padding:8,
    borderRadius:15,
    height:35
  },
  tarjetaDescripcion:{
      maxWidth:300
  },
  botonMenu:{
    backgroundColor: "#110501",
    color:"#ffffffff",
    padding:13,
    paddingLeft: 27,
    paddingRight: 27,
    borderRadius: 20,
    margin:5,
    height:45
  },
  botonMenu2:{
    backgroundColor: "#110501",
    color:"#ffffffff",
    padding:13,
    paddingLeft: 27,
    paddingRight: 27,
    borderRadius: 20,
    margin:5,
    height:45,
    width:150,
    alignItems:"center",
    alignSelf:"center"
  },
  textoCabecera:{
    display:"flex",
    flexDirection:"row",
    gap:20,
    width:400,
    alignItems:"center",
    paddingLeft:30,
    marginTop:30,
    height:85
  },
  cajaScroll:{
    height:65,
    width:360,
    marginBottom:15,
    marginTop:15
  },
  cajaScroll2:{
    marginLeft:15,
    marginRight:15,
    paddingLeft:8,
    flex:1,
    width:"100%"
  },
  textosCuenta:{
    color:"#110501",
    marginTop:25,
    padding:8,
    fontWeight:500,
    height:40,
    borderRadius:15,
    cursor:"pointer"
  },
  cabecera:{
    width:400,
    height:150,
    marginTop:20
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
  miTextoBoton3:{
    color:"#ffffffff",
  },
  miTextoBoton2:{
    color:"#110501",
    fontSize:12,
    fontWeight:500
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
