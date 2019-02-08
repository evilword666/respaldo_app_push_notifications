//import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';


/*
  Generated class for the DatabaseProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class DatabaseProvider {

  contador:any = 0;
  private db: SQLiteObject;
  private isOpen: boolean;


  constructor( public storage: SQLite) {
    console.log('Hello DatabaseProvider Provider');

    if (!this.isOpen) {
      this.storage = new SQLite();
      this.storage.create({ name: "data.db", location: "default" }).then((db: SQLiteObject) => {
        this.db = db;
        db.executeSql("CREATE TABLE IF NOT EXISTS horarios (id INTEGER PRIMARY KEY AUTOINCREMENT, fecha_consulta text, hora text, horb text, descripcion text)", []);
        this.isOpen = true;
      }).catch((error) => {
        console.log(error);
      })
    }

  }

/***********************************************************************************************************/
/***************************** Funciones para almacenar datos la primera vez *******************************/
/***********************************************************************************************************/
  almacenarCitasEnBD(fecha_consulta: string, hora:string, horb:string, descripcion: string, numCitas:number ){
    
    return new Promise ((resolve, reject) => {
      let sql = "INSERT INTO horarios (fecha_consulta, hora, horb, descripcion) VALUES (?, ?, ?, ?)";
      this.db.executeSql(sql, [fecha_consulta, hora, horb, descripcion]).then((data) =>{
      //Aqui iba el resolve  
        
      }, (error) => {
        reject(error);
      });
      this.contador++; 
      resolve(this.contador);   
      
      if(this.contador == numCitas){
        //alert("Contador local: "+this.contador+" \nParametro: "+numCitas)        
        //alert("Se reiniciara el contador a 0")
        this.contador = 0;
      }else{
        
      }
//      resolve(this.contador);     
    });
  }
   
  obtenerCitas(){
    return new Promise ((resolve, reject) => {
      this.db.executeSql("SELECT * FROM horarios", []).then((data) => {
        let arrayUsers = [];
        if (data.rows.length > 0) {
          for (var i = 0; i < data.rows.length; i++) {
            arrayUsers.push({
              id: data.rows.item(i).id,
              fecha_consulta: data.rows.item(i).fecha_consulta,
              hora: data.rows.item(i).hora,
              horb: data.rows.item(i).horb,
              descripcion: data.rows.item(i).descripcion
            });            
          }          
        }
        resolve(arrayUsers);
      }, (error) => {
        reject(error);
      })
    })
  }
  


/***********************************************************************************************************/
/*************************************** Actualizar eventos del calendario *********************************/
/***********************************************************************************************************/

/***********************************************************************************************************/
/***********************************************************************************************************/
limpiarTabla(){
    return new Promise ((resolve, reject) => {
      this.db.executeSql("DELETE FROM horarios", []).then((data) => {
        let arrayUsers = [];
        if (data.rows.length > 0) {
          for (var i = 0; i < data.rows.length; i++) {
            arrayUsers.push({
              id: data.rows.item(i).id,
              fecha_consulta: data.rows.item(i).fecha_consulta,
              hora: data.rows.item(i).hora,
              horb: data.rows.item(i).horb,
              descripcion: data.rows.item(i).descripcion
            });            
          }          
        }
        resolve(arrayUsers);
      }, (error) => {
        reject(error);
      })
    })
  }
/***********************************************************************************************************/
/***********************************************************************************************************/  

/***********************************************************************************************************/
/***********************************************************************************************************/
}
