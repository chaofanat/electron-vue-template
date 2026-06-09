// Example worker thread for CPU-intensive tasks.
//
// Usage from main process:
//   import { Worker } from 'worker_threads';
//   const worker = new Worker(__dirname + '/example-worker.js');
//   worker.postMessage({ type: 'process', data: [...] });
//   worker.on('message', (result) => { ... });
//
// IMPORTANT: Worker files must be listed as separate entries in
// forge.config.ts VitePlugin build array, with config pointing to
// vite.worker.config.ts. This ensures they are bundled separately.

import { parentPort, workerData } from 'worker_threads';

if (!parentPort) {
  throw new Error('This file must be run as a Worker thread');
}

interface WorkerMessage {
  type: string;
  data: unknown;
}

parentPort.on('message', (message: WorkerMessage) => {
  switch (message.type) {
    case 'process': {
      const result = heavyComputation(message.data);
      parentPort!.postMessage({ type: 'result', data: result });
      break;
    }
    case 'exit': {
      process.exit(0);
      break;
    }
  }
});

parentPort.postMessage({ type: 'ready', data: workerData });

function heavyComputation(data: unknown): unknown {
  return data;
}
