const { exec } = require('child_process');
const process = require('process');

// Run drizzle-kit push and automatically answer 'y'
const child = exec('npm run db:push', {
    cwd: __dirname
});

// Send 'y' after a short delay
setTimeout(() => {
    child.stdin.write('y\n');
    child.stdin.end();
}, 2000);

child.stdout.on('data', (data) => {
    console.log(data.toString());
});

child.stderr.on('data', (data) => {
    console.error(data.toString());
});

child.on('close', (code) => {
    console.log(`Process exited with code ${code}`);
    process.exit(code);
});
