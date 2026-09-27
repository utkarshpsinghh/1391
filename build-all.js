import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('==============================================');
console.log('Step 1: Building Main Kingdom 1391 Website...');
console.log('==============================================');
execSync('npx tsc -b && npx vite build', { stdio: 'inherit', shell: true });

console.log('\n==============================================');
console.log('Step 2: Building HOT Alliance CRM (/crm)...');
console.log('==============================================');
const crmDir = path.join(process.cwd(), 'crm');
const crmNodeModules = path.join(crmDir, 'node_modules');
if (!fs.existsSync(crmNodeModules)) {
  console.log('Installing CRM dependencies...');
  execSync('npm install', { cwd: crmDir, stdio: 'inherit', shell: true });
}

execSync('npm run build', { cwd: crmDir, stdio: 'inherit', shell: true });

console.log('\n==============================================');
console.log('Step 3: Bundling CRM into dist/crm...');
console.log('==============================================');
const crmDist = path.join(crmDir, 'dist');
const targetCrm = path.join(process.cwd(), 'dist', 'crm');

if (!fs.existsSync(crmDist)) {
  console.error('Error: crm/dist was not generated!');
  process.exit(1);
}

fs.cpSync(crmDist, targetCrm, { recursive: true });
console.log('Done! Main website available at / and CRM portal available at /crm/');
