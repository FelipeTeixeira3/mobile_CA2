import { Injectable } from '@angular/core';
import {Camera, CameraResultType, CameraSource, Photo} from "@capacitor/camera";
import { Filesystem, Directory } from '@capacitor/filesystem';
import { AlertController, Platform } from '@ionic/angular';



@Injectable({
  providedIn: 'root'
})

export class PhotoService {
  public photos: UserPhoto[] = [];
  private photo_storage = 'photos';
  private platform: Platform;

  constructor(platform: Platform, private alertController: AlertController) { 
    this.platform = platform;
  }



  private async convertBase64(photo: Photo) {
    if (photo.webPath) {
      const res = await fetch(photo.webPath);
      const blob = await res.blob();
      
      return await this.convertBlobTo64(blob) as string;
    } 
    return null;
  }

  private convertBlobTo64(blob: Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      }
      reader.readAsDataURL(blob);
    })
  }

  private async saveToDevice(photo: Photo) {
    const base64data = await this.convertBase64(photo);
    if (base64data) {
  
      const filename = `Picture taken at ${new Date().getTime()}.jpeg`;
      const savedFile = await Filesystem.writeFile({
        path: filename,
        data: base64data,
        directory: Directory.Data
      })
      console.log(filename);
      console.log(savedFile);
  
      return {
        filepath: filename,
        webviewPath: photo.webPath
      }
    }
  
    // If base64data is null, return null or some default value
    return null;
  }
  

  async takePhoto() {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    })
  
    const alert = await this.alertController.create({
      header: 'Enter a subtitle',
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'Title'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        }, {
          text: 'Ok',
          handler: data => {
            const title = data.title;
            
            this.photos.unshift({
              filepath: 'tbd',
              webviewPath: photo.webPath,
              title: title
            })
            console.log(this.photos.length);
            this.saveToDevice(photo);
          }
        }
      ]
    })
  
    await alert.present();
  }
}

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
  title?: string;
}