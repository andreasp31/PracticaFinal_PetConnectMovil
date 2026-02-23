import { Image, ImageBackground } from 'expo-image';
import {StyleSheet, View, TouchableOpacity, Text, ScrollView, FlatList, Modal, TouchableWithoutFeedback} from 'react-native';
import { useRouter, Stack, useFocusEffect} from 'expo-router';
import { useState, useEffect, useCallback} from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Persona {
  usuarioEmail: string;
  estado: 'inscrito' | 'cancelado_tarde';
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
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [emailUsuario, setEmailUsuario] = useState<string | null>(null);
  const [nombre, setNombre] = useState('Usuario');
  //Horas disponibles para cada actividad
  const horarios = ["09:00","11:00","13:00","17:00","19:00"];
  //modales
  const abrirModal = (item: Actividad)=>{
    const apuntado = esPersonaApuntada(item);
    const perdido = esPlazaPerdida(item);
    const sinPlazas = item.plazas <= 0;
    setActividadSeleccionada(item);
    if (apuntado || perdido || sinPlazas) {
      console.log("Usuario ya inscrito o sin plazas");
      return; 
    }
    setModalVisible(true);
  }
  const cerrarModal = () => {
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
  //obtener las todas actividades creadas por el admin 
  const cargarActividades = async () => {
      try {
        const respuesta = await axios.get("http://10.0.2.2:3000/api/actividades");
        setActividades(respuesta.data);
      } catch (error) {
        console.error("Error al traer actividades:", error);
      }
  };
  //para que lo haga al mismo tiempo en segundo plano
  useEffect(() => {
  const inicializar = async () => {
    // Recuperamos datos primero
    const nombreGuardado = await AsyncStorage.getItem("nombreUsuario");
    const emailGuardado = await AsyncStorage.getItem("emailUsuario");
    //para poner el nombre al encabezado
    if (nombreGuardado) setNombre(nombreGuardado);
    if (emailGuardado) {
      setEmailUsuario(emailGuardado); 
      try {
        const respuesta = await axios.get("http://10.0.2.2:3000/api/actividades");
        setActividades(respuesta.data);
      } catch (error) {
        console.error("Error al traer actividades:", error);
      }
    }
  };
  inicializar();
}, []);
  useFocusEffect(
    useCallback(() => {
      cargarActividades(); 
    }, [emailUsuario])
  );
  //lo que se va a mostrar en pantalla: uso botones, imágenes y text
  const tarjeta = ({ item }:{item : Actividad}) => {
    const apuntado = esPersonaApuntada(item);
    const perdido = esPlazaPerdida(item);
    const sinPlazas = item.plazas <= 0;
    //estados
    const deshabilitado = apuntado || perdido || sinPlazas;
    return(
      <View style={styles.tarjeta}>
        <View style={styles.tarjetaInfo}>
          <View style={styles.tarjetaCabecera}>
            <Text style={styles.tarjetaTitulo}>{item.nombre}</Text>
            /*Estados de los botones */
            <TouchableOpacity style={[styles.botonTarjeta, deshabilitado && styles.botonDesactivado]} onPress={() => abrirModal(item)}>
              <Text style={[styles.miTextoBoton2, deshabilitado && styles.textoBotonDesactivado]}>{apuntado ? "Inscrito" : perdido ? "Plaza Perdida" : sinPlazas ? "Agotado" : "Ver más"}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.tarjetaDescripcion}>{item.descripcion}</Text>
          <Text style={styles.tarjetaDescripcion}>{formatearFecha(item.fechaHora)}</Text>
        </View>
      </View>
    )
  }
  //función para apuntarse a una actividad seleccionando una franja horaria
  const inscripcion = async()=>{
      if (!actividadSeleccionada || !horaSeleccionada) return;
      try {
        const emailUsuario = await AsyncStorage.getItem("emailUsuario");
        console.log("Inscribiendo al usuario:", emailUsuario);
        const datos = {
          actividadId: actividadSeleccionada._id,
          email: emailUsuario,
          fechaHora: horaSeleccionada
        };
        await axios.post("http://10.0.2.2:3000/api/actividades/inscribir", datos);
        //aqui vuelve a enseñar la lista de activides que sino no se carga automaticamente
        const respuesta = await axios.get("http://10.0.2.2:3000/api/actividades");
        setActividades([...respuesta.data]);
        await cargarActividades();
        cerrarModal();
      } 
      catch (error) {
        console.error("Error al inscribirse:", error);
        console.log("No se pudo completar la inscripción");
      }
  }
  //buscar si el estado es inscrito para luego los estilos de los botones
  const esPersonaApuntada = (actividad: Actividad) => {
    return actividad.personasApuntadas?.some(p => 
      p.usuarioEmail === emailUsuario && p.estado === 'inscrito'
    );
  };
  //buscar si el estado es cancelado tarde para luego los estilos de los botones que sea distinto
  const esPlazaPerdida = (actividad: Actividad) => {
    return actividad.personasApuntadas?.some(p => 
      p.usuarioEmail === emailUsuario && p.estado === 'cancelado_tarde'
    );
  };
  //formatear la decha para que se enseñe bonita
  const formatearFecha = (fechaString: string) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
  });
}
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
          <TouchableOpacity style={styles.botonMenu} onPress={() => router.push("/PantallaUsuario")}>
            <Text style={styles.miTextoBoton3}>Nuevas Actividades</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.miBoton1} onPress={() => router.push("/PantallaActividades")}>
            <Text style={styles.miTextoBoton}>Mis Actividades</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.miBoton1} onPress={() => abrirModal2()}>
            <Text style={styles.miTextoBoton}>Adoptar</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      <View style={styles.cajaScroll2}>
        <FlatList data={actividades} renderItem={tarjeta} keyExtractor={item => item._id} horizontal={false} showsVerticalScrollIndicator={true} style={styles.cajaScroll2} extraData={emailUsuario}></FlatList>
      </View>
      <Modal transparent={true} visible={modalVisible} onRequestClose={cerrarModal}>
        <View style={styles.fondoModal}>
          <View style={styles.modal}>
            <View>
              <ImageBackground source={require('@/assets/images/perroGato.jpg')} style={styles.fotoModal}>
              <TouchableOpacity onPress={cerrarModal}>
                <Image source={require('@/assets/images/botonCerrar.png')} contentFit="cover" style={styles.fotoCerrar}></Image>
              </TouchableOpacity>
            </ImageBackground>
            </View>
            <View style={styles.bloqueModal}>
              <Text style={styles.tarjetaTitulo}>{actividadSeleccionada?.nombre}</Text>
              <Text>{actividadSeleccionada?.descripcion}</Text>
              <Text>Fecha: {actividadSeleccionada ? formatearFecha(actividadSeleccionada.fechaHora) : ''}</Text>
              <Text>Plazas disponibles: {actividadSeleccionada?.plazas}</Text>
              <Text>Selecciona un horario:</Text>
              <View style={styles.contenedorHoras}>
                {horarios.map((hora)=>(
                  <TouchableOpacity key={hora} style={[ styles.botonHora,horaSeleccionada === hora && styles.botonHoraActivo]} onPress={() => setHoraSeleccionada(hora)}>
                    <Text style={[styles.textoHora,horaSeleccionada === hora && styles.textoHoraActivo]}>{hora}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.botonMenu2} onPress={inscripcion}>
                <Text style={styles.miTextoBoton3}>Inscribirse</Text>
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
  fondoModal02:{
    flex:1,
    backgroundColor:"rgba(0, 0, 0, 0.32)",
    justifyContent:"flex-start",
    alignItems:"flex-start",
    paddingTop:50,
    paddingLeft:30
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
  botonDesactivado:{
    backgroundColor: '#ffffff',
    borderColor: '#0f0f0f',
    borderWidth: 1,
  },
  textoBotonDesactivado: {
    color: '#0f0f0f',
  },
  fondoModal:{
    flex:1,
    backgroundColor:"rgba(0, 0, 0, 0.32)",
    justifyContent:"center",
    alignItems:"center"
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
    marginBottom:40
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
  fotoCerrar:{
    height:30,
    width:30,
    margin:10,
    resizeMode: "contain"
  },
  modal:{
    backgroundColor:"#ffffff",
    width:340,
    minHeight:500,
    borderRadius:25,
    padding:20
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
    fontSize:18,
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
    height:440
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
