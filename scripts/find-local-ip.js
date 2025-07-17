import { networkInterfaces } from 'os';

function getLocalIPAddress() {
  const nets = networkInterfaces();
  const results = {};

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }

  console.log('Available local IP addresses:');
  console.log('==============================');
  
  for (const interfaceName of Object.keys(results)) {
    const addresses = results[interfaceName];
    console.log(`${interfaceName}:`);
    addresses.forEach(addr => {
      console.log(`  - ${addr}`);
    });
  }
  
  console.log('\nTo use with Flutter app:');
  console.log('1. Copy one of the IP addresses above');
  console.log('2. Update the development baseUrl in lib/config/environment.dart');
  console.log('3. Make sure your phone/emulator is on the same network');
}

getLocalIPAddress(); 