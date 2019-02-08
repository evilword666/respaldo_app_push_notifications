import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login'

import { NgCalendarModule } from 'ionic2-calendar';  //Esta libreria es necesaria para que funcione el calendario

import { HttpModule} from '@angular/http';
import { DatabaseProvider } from '../providers/database/database';
import { SQLite } from '@ionic-native/sqlite';
import { BackgroundMode } from '@ionic-native/background-mode';
import { Platform,ToastController } from 'ionic-angular';


import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { Firebase } from '@ionic-native/firebase/ngx';

import { FcmService } from '../providers/fcm/fcm.service';

var config = {
  apiKey: "AIzaSyCaFaLbM62wbOPodcMtZGIpEg8XZBSakQ8",
  authDomain: "agendabm001.firebaseapp.com",
  databaseURL: "https://agendabm001.firebaseio.com",
  projectId: "agendabm001",
  storageBucket: "agendabm001.appspot.com",
  messagingSenderId: "97593199603"
};


@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage
  ],
  imports: [
    NgCalendarModule,    
    BrowserModule,
    HttpModule,


    IonicModule.forRoot(MyApp, { 
      scrollPadding: false, 
      scrollAssist: true, 
      autoFocusAssist: false 
     }) ,

     AngularFireModule.initializeApp(config),
     AngularFirestoreModule

  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage
  ],
  providers: [
    //HTTP,
    StatusBar,
    SplashScreen,
    SQLite,
    Firebase,
    FcmService,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    DatabaseProvider
  ]
})
export class AppModule {}
