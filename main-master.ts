import { app, BrowserWindow, screen, session, ipcMain } from 'electron';
import { Midi } from '@tonejs/midi';

import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as cluster from 'cluster'


import {
  Song,
  Track,
  Note,
  Instrument
} from './src/app/interfaces/song.interface';


let processIsExiting: boolean = false;


// Ensure songs directory is created.
mkdirp('./songs', (err) => {
  if (err)
    console.error(err);
});

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

    // Initial forking
    for (let i=0;i<numWorkers;i++)
      cluster.fork();
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



// Cluster handling
// const numWorkers: number = require('os').cpus().length - 1;
const numWorkers: number = 1;
let processExiting: boolean = false;

const taskQueue: any = {
  available: [],
  workers: {}
};

function findAvailableWorker(): any | null {
  let key = Object.keys(taskQueue.workers).find((key) => taskQueue.workers[key].status == 'available');
  // console.log("Attempting to find worker: ", key);
  if (key)
    return cluster.workers[key];

  return null;
}

function queueTask(command: string, settings: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let task = Object.assign({}, settings, { cmd: command})
    task.promise = {
      resolve: resolve,
      reject: reject
    };

    // console.log("Created task: ", task);

    assignOrQueueTask(task);
  })
}

function assignTask(workerId: string, task: any) {
  let worker = cluster.workers[workerId];
  if (task && worker) {
    taskQueue.workers[workerId].status = 'working';
    taskQueue.workers[workerId].task = task;

    // console.log("Assigning task: ", workerId, task);

    worker.send({
      msg: 'task',
      task: task
    });
  }
}

function assignOrQueueTask(task) {
  // console.log("Assigning or queueing task: ", task);
  // If there is an available worker, assign it.
  // Otherwise, queue.
  let worker = findAvailableWorker();

  // console.log("First available worker: ", worker);

  if (worker) {
    assignTask(worker.id, task);
  } else {
    // console.log("Queueing task: ", task);
    taskQueue.available.push(task);
  }
}

function workerAvailable(worker: any) {
  // console.log(`Marking worker ${worker.id} as available.`);
  taskQueue.workers[worker.id] = {
    status: 'available',
    task: null
  };

  if (taskQueue.available.length)
    assignTask(worker.id, taskQueue.available.shift());
}


// Worker online
cluster.on('online', (worker) => {
  console.log(`Worker online: ${worker.id}`);
  workerAvailable(worker);
});

// Worker disconnected
cluster.on('disconnect', (worker) => {
  console.log(`Worker offline: ${worker.id}`);
  // If processExiting, then we are exiting the process.
  // Don't keep re-forking.
  if (!processExiting) {
    // If it was working on a task, requeue.
    if (taskQueue.workers[worker.id]) {
      let task = taskQueue.workers[worker.id].task;
      if (task)
        assignOrQueueTask(task);

      // Remove from list of workers.
      delete taskQueue.workers[worker.id];

      // Start up a new one.
      cluster.fork();
    }
  }
});


// Message received from worker.
cluster.on('message', (worker, message, handle) => {
  if (message.type) {
    if (message.type == 'song-discovered') {
      // A new song is discovered.  Queue loading it.
      queueTask('song-load', {path: message.path})
        .then((song: Song) => {
          // console.log(`Loaded song ${message.path}`);
          win.webContents.send('song-discovered', song);
        })
        .catch((err) => {
          console.error(`Error loading song ${message.path}`, err);
          win.webContents.send('song-error', err);
        });

    } else if (message.type == 'task-success') {
      // A task is completed successfully.
      if (taskQueue.workers[worker.id] &&
          taskQueue.workers[worker.id].task &&
          taskQueue.workers[worker.id].task.promise &&
          taskQueue.workers[worker.id].task.promise.resolve
        ) {
        // console.log("Task successful: ", message)
        taskQueue.workers[worker.id].task.promise.resolve.apply(null, message.response);
        workerAvailable(worker);
      }

    } else if (message.type == 'task-error') {
      // A task has returned an error
      if (taskQueue.workers[worker.id] &&
          taskQueue.workers[worker.id].task &&
          taskQueue.workers[worker.id].task.promise &&
          taskQueue.workers[worker.id].task.promise.reject
        ) {
        // console.log("Task failed: ", message);
        taskQueue.workers[worker.id].task.promise.reject(message.error);
        workerAvailable(worker);
      }      
    }
  }
});



// IPC Calls
ipcMain.on('song-scan', (event, uuid: string, dir: string) => {
  // Parse special directories.
  let actualDir: string = '';
  if (dir.substr(0, 7).toLowerCase() == 'special')
    actualDir = app.getPath(dir.substr(8));
  else
    actualDir = path.resolve(dir);

  // console.log(`Master received song-scan: ${actualDir}`);
  queueTask('song-scan', {path: actualDir})
    .then(() => {
      queueTask('scan-complete', {path: actualDir});
      console.log(`Directory scanned: ${actualDir}`);
    })
    .catch((err) => {
      queueTask('scan-error', {path: actualDir, error: err});
      console.error("Error scanning directory: ", err);
    })
    ;
});

ipcMain.on('song-load', (event, uuid: string, dir: string) => {
  // console.log(`Master received song-load: ${dir}`);
  queueTask('song-load', {path: dir})
    .then((song: Song) => {
      // console.error(`Song loaded: ${dir}`);
      event.reply(`reply-${uuid}`, 'success', song);
    })
    .catch((err) => {
      console.error("Error loading song: ", err);
      event.reply(`reply-${uuid}`, 'error', err);
    })
    ;
});


// Clean up on process exit.
process.on('exit', () => {
  processExiting = true;
});
