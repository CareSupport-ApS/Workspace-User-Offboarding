import { spawnSync } from 'node:child_process';

function runCommand(args) {
  const result = spawnSync('clasp', args, {
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'pipe']
  });

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  return `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
}

function extractDeploymentId(output) {
  const directMatch = output.match(/\bAKf[\w-]+\b/);
  return directMatch?.[0] ?? null;
}

const description = `codex deploy ${new Date().toISOString()}`;

runCommand(['push']);
const deployOutput = runCommand(['deploy', '--description', description]);

const deploymentId = extractDeploymentId(deployOutput);

if (!deploymentId) {
  console.error('Unable to determine the deployment ID from clasp output.');
  process.exit(1);
}

const deploymentUrl = `https://script.google.com/macros/s/${deploymentId}/exec`;

console.log(`\nWeb app URL:\n${deploymentUrl}`);
