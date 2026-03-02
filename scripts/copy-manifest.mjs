import { copyFileSync, mkdirSync } from 'node:fs';

mkdirSync('gas', { recursive: true });
copyFileSync('appsscript.json', 'gas/appsscript.json');
console.log('Copied appsscript.json to gas/appsscript.json');
