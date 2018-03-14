import { Injectable } from '@angular/core';
import { HttpService } from './HttpService';

declare let window;
let win: any = null;
let fs: any = null;
if (window.nw) {
  fs = window.require('fs');
  win = window.nw.Window.get();
}

@Injectable()
export class DownloadFileService {

  baseUrl: string;

  constructor(
    private http: HttpService
  ) {
    this.baseUrl = http.baseUrl;
  }

  public downloadFileToDisk(attachId, attachName, diskPath, option?) {
    option = Object.assign({
      open: false
    }, option);
    if (window.nw && win) {
      let xhr = new XMLHttpRequest();
      let url = this.baseUrl + 'fileUploadController/downFile?fileId=' + attachId;
      win.setProgressBar(-1);
      xhr.open('GET', url, true);
      xhr.responseType = "arraybuffer";
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          let arrayBuffer = xhr.response,
            byteArray = new Uint8Array(arrayBuffer);
          let buffer = window.Buffer.alloc(byteArray.length);
          for (let i = 0; i < byteArray.length; i++) {
            buffer.writeUInt8(byteArray[i], i);
          }
          fs.writeFile(diskPath, buffer, function (error) {
            if (!error && option.open) {
              window.nw.Shell.openItem(diskPath);
            }
            byteArray = null;
            buffer = null;
          });
          win.setProgressBar(-1);
        }
      };
      xhr.addEventListener("progress", function (e) {
        win.setProgressBar(e.loaded / e.total);
      });
      xhr.send();
    }
  }
}
