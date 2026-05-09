import './server/index.ts';
console.log('Server import completed');
setTimeout(() => {
  console.log('Exiting after 2 seconds');
  process.exit(0);
}, 2000);