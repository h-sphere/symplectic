const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const testDir = path.join(os.tmpdir(), 'symplectic-test-' + Math.random().toString(36).substring(7));
const scriptPath = path.join(__dirname, 'index.js');

function runScript(args = '') {
  return execSync(`node ${scriptPath} ${args}`, { encoding: 'utf8', cwd: testDir });
}

describe('Symplectic File Processing', () => {
  beforeAll(() => {
    fs.mkdirSync(testDir);
  });

  afterAll(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  beforeEach(() => {
    // Clear the test directory before each test
    fs.readdirSync(testDir).forEach(file => {
      fs.unlinkSync(path.join(testDir, file));
    });
  });

  test('should create a new file', () => {
    const symplecticContent = '//|| new_file.txt\nThis is a new file.';
    fs.writeFileSync(path.join(testDir, 'symplectic.txt'), symplecticContent);

    runScript();

    const newFileContent = fs.readFileSync(path.join(testDir, 'new_file.txt'), 'utf8');
    expect(newFileContent).toBe('This is a new file.');
  });

  test('should prepend content to an existing file', () => {
    const existingContent = 'Existing content.';
    fs.writeFileSync(path.join(testDir, 'existing_file.txt'), existingContent);

    const symplecticContent = '//||^ existing_file.txt\nPrepended content.\n';
    fs.writeFileSync(path.join(testDir, 'symplectic.txt'), symplecticContent);

    runScript();

    const updatedContent = fs.readFileSync(path.join(testDir, 'existing_file.txt'), 'utf8');
    expect(updatedContent).toBe('Prepended content.\nExisting content.');
  });

  test('should append content to an existing file', () => {
    const existingContent = 'Existing content.';
    fs.writeFileSync(path.join(testDir, 'existing_file.txt'), existingContent);

    const symplecticContent = '//||$ existing_file.txt\nAppended content.\n';
    fs.writeFileSync(path.join(testDir, 'symplectic.txt'), symplecticContent);

    runScript();

    const updatedContent = fs.readFileSync(path.join(testDir, 'existing_file.txt'), 'utf8');
    expect(updatedContent).toBe('Existing content.Appended content.\n');
  });

  test('should remove files when --remove flag is used', () => {
    const fileToRemove = path.join(testDir, 'file_to_remove.txt');
    fs.writeFileSync(fileToRemove, 'This file will be removed.');

    const symplecticContent = '//|| file_to_remove.txt\nThis file will be removed.';
    fs.writeFileSync(path.join(testDir, 'symplectic.txt'), symplecticContent);

    runScript('--remove');

    expect(fs.existsSync(fileToRemove)).toBe(false);
  });

  test('should not modify files when --dry-run flag is used', () => {
    const symplecticContent = '//|| dry_run_file.txt\nThis file should not be created.';
    fs.writeFileSync(path.join(testDir, 'symplectic.txt'), symplecticContent);

    runScript('--dry-run');

    expect(fs.existsSync(path.join(testDir, 'dry_run_file.txt'))).toBe(false);
  });

  test('should generate symplectic.txt file when --generate flag is used', () => {
    fs.writeFileSync(path.join(testDir, 'file1.txt'), 'Content of file1');
    fs.writeFileSync(path.join(testDir, 'file2.txt'), 'Content of file2');

    runScript('--generate');

    const generatedContent = fs.readFileSync(path.join(testDir, 'symplectic.txt'), 'utf8');
    expect(generatedContent).toContain('//|| file1.txt\nContent of file1');
    expect(generatedContent).toContain('//|| file2.txt\nContent of file2');
  });
});