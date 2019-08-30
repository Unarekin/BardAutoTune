import { app, BrowserWindow, screen, session, ipcMain } from 'electron';
import { Midi } from '@tonejs/midi';
import getPath from 'platform-folders';

import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs';
import * as readdir from 'readdir-enhanced';


import {
  Song,
  Track,
  Note,
  Instrument
} from './src/app/interfaces/song.interface';


let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

function createWindow() {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: 800,
    height: 600,
    // width: size.width,
    // height: size.height,
    // frame: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.setMenuBarVisibility(false);

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  if (serve) {
    win.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

}

try {

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', () => {
    createWindow();
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}


function loadSong(dir: string): Promise<Song> {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(dir), (err, data) => {
      if (err) {
        reject(err);
      } else {
        let parsed = new Midi(data)
        // Coerce @tonejs/midi formatted midi into our internal interface

        // _id and _rev are handled by the renderer process, not here.
        // They originate from the PoucHDB instance, but are included
        // on the interface for type checking.
        let midi: Song = {
          _id: '',
          _rev: '',
          Name: parsed.header.name,
          Path: path.resolve(dir),
          Duration: parsed.durationTicks,
          Tracks: parsed.tracks.map((track: any) => {
            return {
              Name: track.name,
              Channel: track.channel,
              Notes: track.notes.map((note: any) => {
                return {
                  Midi: note.midi,
                  Time: note.time,
                  Ticks: note.ticks,
                  Name: note.name,
                  Pitch: note.pitch,
                  Octave: note.octave,
                  Velocity: note.velocity,
                  Duration: note.duration
                }
              }),
              Instrument: {
                Number: track.instrument.number,
                Family: track.instrument.family,
                Name: track.instrument.name,
                Percussion: track.instrument.percussion
              }
            }
          })
        };

        resolve(midi);
      }
    });
  })
}

ipcMain.on('song-scan', (event, uuid: string, dir: string, subdirs: boolean = false) => {

  let actualDir: string = path.resolve(dir);
  if (dir.substr(0,7).toLowerCase() == 'special') {
    // Special folder.  Music, Downloads, Documents, etc.
    actualDir = app.getPath(dir.substr(8));
  }

  readdir.stream(actualDir, {deep: subdirs, filter: '*.mid', basePath: actualDir})
    .on('file', (file: string) => {
      //ipcMain.emit('song-discovered')
      loadSong(path.resolve(path.join(dir, file)))
        .then((song: Song) => {
          event.reply('song-discovered', song);
        })
        .catch((err) => {
          console.error(err);
          event.reply('song-error', err);
        });
    })
    .on('end', () => {
      event.reply(`reply-${uuid}`, 'success', null);
    })
    .on('error', (err) => {
      console.error(err);
      event.reply(`reply-${uuid}`, 'error', err);
    });
});

ipcMain.on('song-load', (event, uuid: string, dir: string) => {
  loadSong(dir)
    .then((song: Song) => {
      event.reply(`reply-${uuid}`, 'success', song);
    })
    .catch((err) => {
      event.reply(`reply-${uuid}`, 'error', err);
    })
});



// ipcMain.on('song-list', (event, uuid, ...args) => {
//   // Pull uuid from front of args array.
//   // console.log("ID: ", uuid);
//   // console.log("Args: ", args);
//   // let uuid = args.shift();

//   fs.readdir('./songs', (err, files) => {
//     if (err) {
//       console.error(err);
//       event.reply(`reply-${uuid}`, 'error', err);
//     } else {
//       // console.log(files);
//       // console.log(`Replying: reply-${uuid}, ${args}`);
//       event.reply(`reply-${uuid}`, 'success', files);
//     }
//   });
// });


// ipcMain.on('song', (event: any, uuid: string, file: string) => {
//   fs.readFile(path.join("./songs", file), (err, data) => {
//     if (err) {
//       console.error(err);
//       event.reply(`reply-${uuid}`, 'error', err);
//     } else {
//       // event.reply(`reply-${uuid}`, 'success', data);
//       let parsed = new Midi(data)
//       // Coerce @tonejs/midi formatted midi into our internal interface
//       let midi: Song = {
//         Name: parsed.header.name,
//         Duration: parsed.durationTicks,
//         Tracks: parsed.tracks.map((track: any) => {
//           return {
//             Name: track.name,
//             Channel: track.channel,
//             Notes: track.notes.map((note: any) => {
//               return {
//                 Midi: note.midi,
//                 Time: note.time,
//                 Ticks: note.ticks,
//                 Name: note.name,
//                 Pitch: note.pitch,
//                 Octave: note.octave,
//                 Velocity: note.velocity,
//                 Duration: note.duration
//               }
//             }),
//             Instrument: {
//               Number: track.instrument.number,
//               Family: track.instrument.family,
//               Name: track.instrument.name,
//               Percussion: track.instrument.percussion
//             }
//           }
//         })
//       };

//       event.reply(`reply-${uuid}`, 'success', midi);
//     }
//   });
// })