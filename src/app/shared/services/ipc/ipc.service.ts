import { EventEmitter } from 'events';
import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';
import { Song } from '../../../interfaces';

@Injectable({
  providedIn: 'root'
})
export class IPCService extends EventEmitter {
  private promiseReplies: any = {};

  constructor() {
    super()
    this.Send = this.Send.bind(this);
    this.GenerateId = this.GenerateId.bind(this);

    // Some IPC hooks.
    ipcRenderer.on('song-discovered', (event, song: Song) => {
      this.emit('song-discovered', song);
    });

    ipcRenderer.on('song-error', (event, error) => {
      this.emit('song-error', error);
    });
  }

  public Send(channel: string, ...args): Promise<any[]> {
    let uuid = this.GenerateId();
    let promise: Promise<any[]> = new Promise<any[]>((resolve, reject) => {
      
      ipcRenderer.once(`reply-${uuid}`, (event, status: string, ...args) => {
        // console.log("IPC Reply: ", status, args);

        if (status === 'error')
          throw args[0];
        else if (status === 'success')
          resolve(...args);
        // resolve(...args);

        delete this.promiseReplies[uuid];
      });
    });

    this.promiseReplies[uuid] = promise;
    ipcRenderer.send(channel, uuid, ...args);


    return promise;
  }

  private GenerateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
