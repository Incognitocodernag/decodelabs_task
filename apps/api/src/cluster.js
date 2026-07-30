"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cluster_1 = __importDefault(require("node:cluster"));
const node_os_1 = __importDefault(require("node:os"));
const numCPUs = node_os_1.default.cpus().length;
if (node_cluster_1.default.isPrimary) {
    console.log(`[Cluster] Primary ${process.pid} is running`);
    console.log(`[Cluster] Provisioning ${numCPUs} enterprise worker threads...`);
    // Fork workers for each CPU
    for (let i = 0; i < numCPUs; i++) {
        node_cluster_1.default.fork();
    }
    node_cluster_1.default.on('exit', (worker, code, signal) => {
        console.error(`[Cluster] Worker ${worker.process.pid} died (code: ${code}, signal: ${signal}).`);
        console.log('[Cluster] Automatically spawning a replacement worker to maintain High Availability (HA)...');
        node_cluster_1.default.fork();
    });
}
else {
    // Workers can share any TCP connection.
    // In this case it is an HTTP server mapped in index.ts
    require('./index.ts');
    console.log(`[Worker] Thread ${process.pid} started successfully.`);
}
//# sourceMappingURL=cluster.js.map