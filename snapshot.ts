#!/usr/bin/env ts-node

declare function require<As>(what: string): As;
declare const __dirname: string;

interface Buffer {
	toString(): string;
}

interface SpawnOptions {
	cwd?: string;
	stdio?: [string, string, string] | 'inherit';
}

const { spawnSync } = require<{
	spawnSync(binary: string, arguments: string[], options?: SpawnOptions): {
		status: number;
		stdout: Buffer;
		stderr: Buffer;
		signal: string;
	}
}>('child_process');
const { join } = require<any>('path');

const git = function(atPath) {
	const options: SpawnOptions = { cwd: atPath };
	const optionsWithInherit: SpawnOptions = {
		cwd: atPath,
		stdio: 'inherit'
	};
	return {
		diffIndex: () => spawnSync('git', ['diff-index', '--quiet', 'HEAD'], options),
		sha: () => spawnSync('git', ['rev-parse', 'HEAD'], options),
		commit: (message: string) => spawnSync('git', ['commit', '-m', message, '-a'], optionsWithInherit),
		push: () => spawnSync('git', ['push'], optionsWithInherit)
	};
}

const mainRepository = git(join(__dirname, '..'));
if (mainRepository.diffIndex().status !== 0) {
	console.error('Main Repository has Changes');
} else {
	const binRepository = git(__dirname);
	binRepository.commit(mainRepository.sha().stdout.toString());
	binRepository.push();
}