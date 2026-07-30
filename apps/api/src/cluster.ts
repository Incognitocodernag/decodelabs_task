import cluster from 'node:cluster';
import os from 'node:os';
import path from 'node:path';

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`[Cluster] Primary ${process.pid} is running`);
  console.log(`[Cluster] Provisioning ${numCPUs} enterprise worker threads...`);

  // Fork workers for each CPU
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.error(`[Cluster] Worker ${worker.process.pid} died (code: ${code}, signal: ${signal}).`);
    console.log('[Cluster] Automatically spawning a replacement worker to maintain High Availability (HA)...');
    cluster.fork();
  });
} else {
  // Workers can share any TCP connection.
  // In this case it is an HTTP server mapped in index.ts
  require('./index.ts');
  console.log(`[Worker] Thread ${process.pid} started successfully.`);
}
