import { Injectable } from '@angular/core';
import * as QRCode from 'qrcode';

@Injectable({
  providedIn: 'root'
})
export class QrCodeService {

  constructor() {}

  public static getImageQrcode(sharedLinkUrl: string, size: number): string {
    let createdImage: HTMLCanvasElement;
    QRCode.toCanvas(sharedLinkUrl, (error, canvasResult: HTMLCanvasElement) => {
      if (error) {
        throw new Error('Should not create qr code image' + error);
      }
      createdImage = canvasResult;
    });
    return `<img src="${createdImage.toDataURL('image/png')}" width="${size}"  alt="${sharedLinkUrl}" />`;
  }
}
