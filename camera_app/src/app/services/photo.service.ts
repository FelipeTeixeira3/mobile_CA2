import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from "@capacitor/camera";
import { Filesystem, Directory } from '@capacitor/filesystem';
import { AlertController, Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  public photos: UserPhoto[] = [];

  constructor(private platform: Platform, private alertController: AlertController) { }

  private async convertBase64(photo: Photo): Promise<string | null> {
    if (photo.webPath) {
      const blob = await (await fetch(photo.webPath)).blob();
      return await this.convertBlobTo64(blob) as string;
    }
    return null;
  }

  private convertBlobTo64(blob: Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  private async saveToDevice(photo: Photo) {
    const base64data = await this.convertBase64(photo);
    if (!base64data) return null;

    const filename = `Picture taken at ${new Date().getTime()}.jpeg`;
    const savedFile = await Filesystem.writeFile({
      path: filename,
      data: base64data,
      directory: Directory.Data
    });

    console.log(filename);
    console.log(savedFile);

    return { filepath: filename, webviewPath: photo.webPath };
  }

  async takePhoto() {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });
  
    const alert = await this.alertController.create({
      header: 'Enter a subtitle',
      inputs: [
        { name: 'title', type: 'text', placeholder: 'Title' },
        { name: 'favorite', type: 'checkbox', label: 'Favorite' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Ok',
          handler: async data => {
            const savedPhoto = await this.saveToDevice(photo);
            if (savedPhoto) {
              this.photos.unshift({ filepath: savedPhoto.filepath, webviewPath: savedPhoto.webviewPath, title: data.title, favorite: data.favorite });
              console.log(this.photos.length);
            }
          }
        }
      ]
    });
  
    await alert.present();
  }
  
}

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
  title?: string;
  favorite?: boolean;
}

