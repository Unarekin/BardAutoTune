import * as cluster from 'cluster';

// const numWorkers = require('os').cpus().length - 1;

if (cluster.isMaster) {
  require('./main-master');
} else {
  require('./main-worker');
}