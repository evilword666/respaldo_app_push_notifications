import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
//import { NgCalendarModule } from 'ionic2-calendar';
import { Http } from '@angular/http'; //https://stackoverflow.com/questions/43609853/angular-4-and-ionic-3-no-provider-for-http
import {DatabaseProvider } from '../../providers/database/database';
import { NgZone  } from '@angular/core';
import { Events } from 'ionic-angular';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
    isPainted:boolean = false;
    resp:any;
    band=0;
    data:any = {};
    horarios_medico:any;
    numeroFilas:any;
    eventsCalendar = [];
    contadorCitas = 0;
    
  constructor(public events: Events, private zone: NgZone, public navCtrl: NavController, private http:Http,private alertCtrl: AlertController, private database: DatabaseProvider) {
    this.data.username = '';
    this.data.response = '';    
    this.http = http;  

    if(window.localStorage.getItem("numFilasDBremota") == null){
        window.localStorage.setItem("numFilasDBremota","0")
    }
    //Obtiene las citas de la BD local y las 'pinta' en el calendario
    //this.consultarHorariosBDremota()
    this.events.subscribe('updateScreen', () => {
        this.zone.run(() => {
          console.log('force update the screen');
          alert("Actualizaremos esta pagina")
        });
      });

  } 
  
  /**************************************************************************************************************/
  /********** Esta se tiene que ejecutar para obtener los datos de la BD en el servidor de expediente ***********/
  /**************************************************************************************************************/          
  consultarHorariosBDremota(){

    if(window.localStorage.getItem("id_doctor") != undefined)
    {
      
      var link = 'http://93.104.215.239/ecg_mqtt/DATABASE/agendaMedicos.php';
      var id_medico = JSON.stringify({id_medico: window.localStorage.getItem("id_doctor")});
            
        this.http.post(link, id_medico)
        .subscribe(data => {
            this.data.response = data["_body"]; 

            this.resp = JSON.parse(this.data.response);
            this.horarios_medico = JSON.stringify(this.resp['horarios']);
            this.numeroFilas = JSON.stringify(this.resp['numFilas']);
            window.localStorage.setItem("numFilasDBActual",this.numeroFilas)
            //alert("LocalStorageXD: "+window.localStorage.getItem("numFilasDBremota")+" numberFilas:"+this.numeroFilas)

                if(window.localStorage.getItem("numFilasDBremota") != this.numeroFilas){
                    //Limpiamos la BD local para poder insertar los nuevos valores de la BD remota
                    //alert("Hay datos nuevos que agregar ")
                    this.isPainted = false;
                    this.eventsCalendar.splice(0,this.eventsCalendar.length) //Vaciar el arreglo que se pinta cada que halla nuevos elementos 
                    this.clearTable();                                                                 
                }else{
                    alert("No ha habido cambios en la base de datos remota, siguen habiendo "+window.localStorage.getItem("numFilasDBremota"))
                    if(this.isPainted == false){                        
                        this.getCitas();
                    }else{
                        //alert("No vamos a pintar nada")
                    }
                }
        },  error => {
            console.log("Oooops!");
            alert("No se pudieron enviar los datos\nIntentelo mas tarde");
            });
    }else{
            alert("El doctor no tiene un  ID asignado")
         }   
  }

  /**************************************************************************************************************/
  /**************************************************************************************************************/
  /**************************************************************************************************************/
  
  almacenarHorariosEnLocalBD(fecha_consulta: string, hora:string, horb:string, descripcion: string, numCitas:number){
    this.database.almacenarCitasEnBD(fecha_consulta, hora,horb,descripcion, numCitas).then((data) =>{                
        //alert(JSON.stringify("Numero de datos insertados: "+data))
        
        if(JSON.stringify(data) == numCitas+""){
            //alert("Se agregaron todas las citas de la BD remota a la DB local")
            this.getCitas();
        }

    },(error) => {
        console.log("Error al crear usuario: "+error)
        //alert("Error al crear: "+error)
    })
    
}

//Con esta funcion obtendremos las citas del medico almacenadas en la BD local
getCitas(){
    this.eventsCalendar = []; //Vaciamos el arreglo por si tiene eventos anteriores
    
    //Usamos la funcion creada en el proveedor database.ts para obtener los datos de las citas
    this.database.obtenerCitas().then((data: any) => {
      console.log(data);

        //if(this.contadorCitas == 0){

            //alert("Ahora pintaremos "+data.length+" citas en el calendario")
            for (let i = 0; i < data.length; i++) {
                const element = data[i];            
                
                let fecha_consulta_g = JSON.stringify(data[i]['fecha_consulta'])
                let hora_g = JSON.stringify(data[i]['hora'])
                let horb_g = JSON.stringify(data[i]['horb'])
                let descripcion_g = JSON.stringify(data[i]['descripcion'])

                let fecha_consulta_SC = fecha_consulta_g.replace(/"/g, ''); 
                var hora_SC = hora_g.replace(/"/g, ''); 
                var horb_SC = horb_g.replace(/"/g, ''); 
                var descripcion_SC = descripcion_g.replace(/"/g, ''); 
                
                //Con esta linea mandamos a actualizar los eventos de la BD local en el calendario
                this.eventSource = this.addSchedules(fecha_consulta_SC, hora_SC, horb_SC, descripcion_SC);
                this.isPainted = true;
            }
            this.contadorCitas = 1;
/*
        }else{
            alert("Ya no se puede realizar mas consultas")
        }
*/
    }, (error) => {
      console.log(error);
      alert("error: "+error)
    })
  }


    ionViewDidLoad() {                    
        setInterval(() => { 
            this.consultarHorariosBDremota(); // Now the "this" still references the component
         }, 10000);
    }
  

  rellenarArregloConConsultaBDremota(){
    var resp2 = JSON.parse(this.horarios_medico);
    var nFilas = JSON.parse(this.numeroFilas);

        //alert("Se agregaran "+nFilas+" nuevas filas")

        if(this.resp['respValue'] == "200"){

            for (let i = 0; i < Object.keys(resp2).length; i++) {
                const element = this.resp['horarios'][i];
                var fecha_consulta = JSON.stringify(element['fecha_consulta'])
                var hora = JSON.stringify(element['hora'])
                var horb = JSON.stringify(element['horb'])
                var descripcion = JSON.stringify(element['descripcion'])

                var fecha_consulta_SC = fecha_consulta.replace(/"/g, ''); 
                var hora_SC = hora.replace(/"/g, ''); 
                var horb_SC = horb.replace(/"/g, ''); 
                var descripcion_SC = descripcion.replace(/"/g, ''); 
                
                //this.eventSource es el evento en el html que se ira refrescando 
                //this.eventSource = this.addSchedules(fecha_consulta_SC, hora_SC, horb_SC, descripcion_SC);
                this.almacenarHorariosEnLocalBD(fecha_consulta_SC, hora_SC, horb_SC, descripcion_SC,nFilas);
            }
            window.localStorage.setItem("numFilasDBremota",window.localStorage.getItem("numFilasDBActual"))
        }else{
        alert("Hubo un error en la consulta de los horarios")
        //this.exitoLogin();
        }
  }



clearTable(){
/*
    this.resp = "";
    this.horarios_medico = ""
    this.numeroFilas = ""
*/
    //alert("Entrando a limpiar tabla local")
    this.database.limpiarTabla().then((data) =>{
        console.log("Tabla Borrada: "+data)
        //alert("Tabla local Borrada!!!");
        //alert("Rellenaremos el arreglo para insertar en la BD local")
        this.rellenarArregloConConsultaBDremota();

    },(error) => {
        console.log("Error no se pudo borrar tabla: "+error)
        alert("Error no se pudo borrar tabla: "+error)
    })
}




  
  eventSource;
  viewTitle;
  isToday: boolean;
  calendar = {
      locale: 'es-MX',
      autoSelect: 'true',
      mode: 'month',
      currentDate: new Date()
  }; // these are the variable used by the calendar.
  loadEvents() {
      //this.eventSource = this.createRandomEvents();
      this.eventSource = this.addEvent();      
      //this.eventSource = this.addSchedules(); 
  }

  onViewTitleChanged(title) {
      this.viewTitle = title;
  }
  onEventSelected(event) {
      console.log('Event selected:' + event.startTime + '-' + event.endTime + ',' + event.title);
      //alert(event.title)
      this.alertDetallesEvento( event.title )
  }
  changeMode(mode) {
      this.calendar.mode = mode;
  }
  today() {
      this.calendar.currentDate = new Date();
  }
  onTimeSelected(ev) {
      console.log('Selected time: ' + ev.selectedTime + ', hasEvents: ' +
          (ev.events !== undefined && ev.events.length !== 0) + ', disabled: ' + ev.disabled);
  }
  onCurrentDateChanged(event:Date) {
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      event.setHours(0, 0, 0, 0);
      this.isToday = today.getTime() === event.getTime();

      //alert("Cambio de pantalla")
  }


  updateCalendar1(event:Date){
    //location.reload();
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    event.setHours(0, 0, 0, 0);
    this.isToday = today.getTime() === event.getTime();
  }

  updateCalendar2(){
    this.events.publish('updateScreen');
  }

  updateCalendar3(){    
    this.navCtrl.setRoot(this.navCtrl.getActive().component);
    this.isPainted = false;
    this.getCitas()
  }


  alertDetallesEvento(evento){

    let alert = this.alertCtrl.create({
      title: '<center><h4>Detalles</h4></center>',
      subTitle: evento,
      buttons: ['Aceptar']
    });
    alert.present();
  }
  

  
/********************************************************************************************************/
/****************************** Funcion para agregar un evento manualmente  *****************************/
/********************************************************************************************************/
  //Agregar eventos uno a uno de la base de datos
  //createEvent(title, location, notes, startDate, endDate)
  addEvent(){

    var startTime;
    var endTime;
    var events2 = [];

    //Formato de la base de datos de Saul
    startTime = "2019-01-15 17:30:00"
    endTime = "2019-01-19 18:00:00"

    var startTime3v = "2019-01-15 13:30:00"
    var endTime3v = "2019-01-16 15:00:00" 

    let startTime2 = new Date(startTime);
    let endTime2 = new Date(endTime);
    
    let startTime3 = new Date(startTime3v);
    let endTime3 = new Date(endTime3v);

    events2.push({
        title: 'Cita con paciente Jorge',
        startTime: startTime2,
        endTime: endTime2,
        allDay: false        
    },
    {
        title: 'Cita con paciente Maria',
        startTime: startTime3,
        endTime: startTime3,
        allDay: false        
    }

    );


    alert("Se a agregado un evento")
    //alert(startTime2)
    alert("startTime2: "+startTime+"\nendTime: "+endTime)
    return events2;
  }

/********************************************************************************************************/
/********************* Funcion para agregar los horarios descargados desde la BD ************************/
/********************************************************************************************************/

    //Agregar eventos uno a uno de la base de datos
  //createEvent(title, location, notes, startDate, endDate)
  addSchedules(dateM, startHour, endHour, description){
  
    
    var startTime;
    var endTime;
    
     //Formato de la base de datos de Saul
    startTime = dateM+" "+startHour;
    endTime = dateM+" "+endHour; 

    let inicio = new Date(startTime);
    let fin = new Date(endTime);
    

    this.eventsCalendar.push({
        title: description,
        startTime: inicio,
        endTime: fin,
        allDay: false        
    });

/*
    alert("Se a agregado un evento")    
    alert("startTime: "+startTime+"\nendTime: "+endTime)
    alert("inicio: "+inicio+"\nendTime: "+fin)
    alert("Tamaño arreglo consultas: "+this.eventsCalendar.length)
    alert("Contenido arreglo consultas: "+JSON.stringify(this.eventsCalendar[0]))
    console.log("Contenido arreglo consultas: "+JSON.stringify(this.eventsCalendar[0]))
*/
    
    return this.eventsCalendar;
  }
/********************************************************************************************************/
/********************************************************************************************************/
/********************************************************************************************************/



  onRangeChanged(ev) {
    console.log('range changed: startTime: ' + ev.startTime + ', endTime: ' + ev.endTime);
  }


  markDisabled = (date:Date) => {
      var current = new Date();
      current.setHours(0, 0, 0);
      return date < current;
  };
    

}
