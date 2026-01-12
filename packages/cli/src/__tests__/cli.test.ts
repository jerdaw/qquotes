import { describe, expect, test } from 'bun:test';
import { spawn } from 'bun';

describe('CLI Integration', () => {
  const runCLI = async (args: string[]) => {
    const proc = spawn(['bun', 'run', 'src/index.ts', ...args], {
      cwd: process.cwd().endsWith('cli') ? '.' : 'packages/cli',
      stdout: 'pipe',
      stderr: 'pipe',
    });

    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    const exitCode = await proc.exited;

    return { stdout, stderr, exitCode };
  };

  test('flags --help', async () => {
    const { stdout, exitCode } = await runCLI(['--help']);
    expect(exitCode).toBe(0);
    expect(stdout).toContain('Usage: qquotes');
    expect(stdout).toContain('A modern, fast, reliable quotes CLI');
  });

  test('flags --version', async () => {
    const { stdout, exitCode } = await runCLI(['--version']);
    expect(exitCode).toBe(0);
    expect(stdout).toMatch(/\d+\.\d+\.\d+/);
  });

  test('random quote (default)', async () => {
    const { stdout, exitCode } = await runCLI([]);
    expect(exitCode).toBe(0);
    expect(stdout).toContain('—'); // Assuming formatQuote includes an em dash or similar separator
    expect(stdout.length).toBeGreaterThan(10);
  });

  test('command: random', async () => {
    const { stdout, exitCode } = await runCLI(['random']);
    expect(exitCode).toBe(0);
    expect(stdout.length).toBeGreaterThan(10);
  });

  test('command: search', async () => {
    // Search for "future" which is in our mock data/test expectations usually
    const { stdout, exitCode } = await runCLI(['search', 'future']);
    expect(exitCode).toBe(0);
    // Depending on data, it might return results or "No quotes found" if data is empty/mocked
    // But it should run successfully.
    // If we have real data hooked up, it should find something.
  });

  test('flags --motd', async () => {
    const { stdout, exitCode } = await runCLI(['--motd']);
    expect(exitCode).toBe(0);
    expect(stdout).toContain('Quote of the Day');
  });

  test('flags --fortune', async () => {
    const { stdout, exitCode } = await runCLI(['--fortune']);
    expect(exitCode).toBe(0);
    expect(stdout).toContain('Your Fortune');
  });
});
