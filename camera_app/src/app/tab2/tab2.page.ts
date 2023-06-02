import { Component } from '@angular/core';
import { PhotoService } from '../services/photo.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  // constructor -  method used to initialize a newly created object and calls the takePhoto() method from the PhotoService
  constructor(private photoService: PhotoService) { }
  takePhoto() {
    this.photoService.takePhoto();
  }
}
