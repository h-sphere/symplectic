#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const ignore = require('ignore');

const SEPARATOR = '//||'
const STRUCTURE_PREFIX = '//=='

const argv = yargs
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging'
  })
  .option('dry-run', {
    alias: 'd',
    type: 'boolean',
    description: 'Perform a dry run without creating or removing files'
  })
  .option('remove', {
    alias: 'r',
    type: 'boolean',
    description: 'Remove files and directories instead of creating them'
  })
  .option('generate', {
    alias: 'g',
    type: 'boolean',
    description: 'Generate symplectic.txt file from existing structure'
  })
  .option('subfolder', {
    alias: 's',
    type: 'string',
    description: 'Generate structure for a specific subfolder'
  })
  .help()
  .alias('help', 'h')
  .argv;

function log(message) {
  if (argv.verbose) {
    console.log(message);
  }
}

function handleDirectoryStructure(structure, basePath = '.') {
  const lines = structure.split('\n');
  let currentPath = basePath;

  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith(SEPARATOR) || trimmedLine.startsWith(STRUCTURE_PREFIX)) return; // Skip comments and structure prefix

    const depth = line.search(/\S/);
    const name = trimmedLine.trim();

    if (name.endsWith('/')) {
      // It's a directory
      currentPath = path.join(basePath, ...currentPath.split(path.sep).slice(1, depth + 1), name);
      if (!argv.dryRun) {
        if (argv.remove) {
          if (fs.existsSync(currentPath)) {
            fs.rmdirSync(currentPath, { recursive: true });
            log(`Removed directory: ${currentPath}`);
          }
        } else {
          fs.mkdirSync(currentPath, { recursive: true });
          log(`Created directory: ${currentPath}`);
        }
      }
    }
  });
}

function processInputFile(inputFilePath) {
  const content = fs.readFileSync(inputFilePath, 'utf8');
  const sections = content.split(`\n${SEPARATOR} `);

  let projectStructure = '';
  let isFirstFile = true;

  sections.forEach((section, index) => {
    if (index === 0 && section.trim().toLowerCase().startsWith('project structure')) {
      projectStructure = section.split('\n').slice(1).join('\n');
      isFirstFile = false;
      log('Project structure processing to be done');
    } else {
      let [filename, ...fileContent] = section.split('\n');
      if (filename.startsWith(SEPARATOR)) {
        filename = filename.slice(SEPARATOR.length);
      }
      const trimmedFilename = filename.trim();
      const filePath = path.join(process.cwd(), trimmedFilename);
      
      if (!argv.dryRun) {
        if (argv.remove) {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            log(`Removed file: ${filePath}`);
          }
        } else {
          const directoryPath = path.dirname(filePath);
          fs.mkdirSync(directoryPath, { recursive: true });
          fs.writeFileSync(filePath, fileContent.join('\n'));
          log(`Created file: ${filePath}`);
        }
      }

      if (isFirstFile) {
        isFirstFile = false;
        log(`No project structure defined. Starting with file ${argv.remove ? 'removal' : 'creation'}.`);
      }
    }
  });

  if (projectStructure) {
    handleDirectoryStructure(projectStructure);
  }
}

function getIgnoreRules(basePath) {
  let ignoreRules = '';

  // Read .gitignore
  const gitignorePath = path.join(basePath, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    ignoreRules += fs.readFileSync(gitignorePath, 'utf8') + '\n';
  }

  // Read .symplecticignore
  const symplecticignorePath = path.join(basePath, '.symplecticignore');
  if (fs.existsSync(symplecticignorePath)) {
    ignoreRules += fs.readFileSync(symplecticignorePath, 'utf8') + '\n';
  }

  // Always ignore symplectic.txt
  ignoreRules += 'symplectic.txt\n';

  return ignoreRules;
}

function generateSymplecticFile(basePath = '.') {
  const ignoreRules = getIgnoreRules(basePath);
  const ig = ignore().add(ignoreRules);

  function generateStructure(dir, depth = 0, prefix = '') {
    let content = '';
    const files = fs.readdirSync(dir).sort((a, b) => {
      const aIsDir = fs.statSync(path.join(dir, a)).isDirectory();
      const bIsDir = fs.statSync(path.join(dir, b)).isDirectory();
      if (aIsDir && !bIsDir) return -1;
      if (!aIsDir && bIsDir) return 1;
      return a.localeCompare(b);
    });

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const relativePath = path.relative(basePath, filePath);

      if (ig.ignores(relativePath)) {
        return;
      }

      const stats = fs.statSync(filePath);
      content += ' '.repeat(depth * 2) + prefix + file + (stats.isDirectory() ? '/\n' : '\n');
      
      if (stats.isDirectory()) {
        content += generateStructure(filePath, depth + 1, prefix + file + '/');
      }
    });

    return content;
  }

  function generateFileContents(dir, prefix = '') {
    let content = '';
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const relativePath = path.relative(basePath, filePath);

      if (ig.ignores(relativePath)) {
        return;
      }

      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        content += generateFileContents(filePath, prefix + file + '/');
      } else {
        content += `\n${SEPARATOR} ${prefix}${file}\n`;
        content += fs.readFileSync(filePath, 'utf8') + '\n';
      }
    });

    return content;
  }

  const subfolderPath = argv.subfolder ? path.join(basePath, argv.subfolder) : basePath;
  const subfolderName = argv.subfolder ? argv.subfolder : '';

  if (argv.subfolder && !fs.existsSync(subfolderPath)) {
    console.error(`Error: Subfolder '${argv.subfolder}' does not exist.`);
    process.exit(1);
  }

  const structure = `${STRUCTURE_PREFIX} Project Structure${subfolderName ? ` for ${subfolderName}` : ''}\n` + 
                    generateStructure(subfolderPath, 0, subfolderName ? subfolderName + '/' : '');
  const fileContents = generateFileContents(subfolderPath, subfolderName ? subfolderName + '/' : '');
  const fullContent = structure + '\n' + fileContents;
  
  if (!argv.dryRun) {
    fs.writeFileSync(path.join(basePath, 'symplectic.txt'), fullContent);
    console.log('Generated symplectic.txt file');
  } else {
    console.log('Dry run: symplectic.txt would be generated with the following content:');
    console.log(fullContent);
  }
}

function main() {
  if (argv.generate) {
    generateSymplecticFile();
    return;
  }

  const inputFile = argv._[0] || 'symplectic.txt';
  
  try {
    log(`Processing input file: ${inputFile}`);
    log(argv.dryRun ? 'Performing dry run...' : (argv.remove ? 'Removing project structure...' : 'Creating project structure...'));
    
    processInputFile(inputFile);
    
    console.log(`Project structure ${argv.dryRun ? 'would be' : 'was'} ${argv.remove ? 'removed' : 'generated'} successfully from ${inputFile}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();