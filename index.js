#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const ignore = require('ignore');

const SEPARATOR = '//||'

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
    description: 'Remove files instead of creating them'
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
  .option('save-snapshot', {
    alias: 'S',
    type: 'boolean',
    description: 'Apply changes and save a snapshot of the resulting system'
  })
  .help()
  .alias('help', 'h')
  .argv;

function log(message) {
  if (argv.verbose) {
    console.log(message);
  }
}

function detectModifier(header) {
  if (header.startsWith('^')) {
    return { modifier: 'prepend', filename: header.slice(1).trim() };
  } else if (header.startsWith('$')) {
    return { modifier: 'append', filename: header.slice(1).trim() };
  } else {
    return { modifier: 'none', filename: header.trim() };
  }
}

function prependToFile(filePath, content) {
  const existingContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  fs.writeFileSync(filePath, content + existingContent);
  log(`Prepended to file: ${filePath}`);
}

function appendToFile(filePath, content) {
  const existingContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  fs.writeFileSync(filePath, existingContent + content);
  log(`Appended to file: ${filePath}`);
}

function applyChangesAndSaveSnapshot(inputFilePath) {
  const archiveDir = path.join(process.cwd(), '.symplecticarchive');
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir);
  }

  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
  const snapshotPath = path.join(archiveDir, `${timestamp}.txt`);

  const content = fs.readFileSync(inputFilePath, 'utf8');
  const sections = content.split(`\n${SEPARATOR} `);

  let snapshotContent = '';

  sections.forEach((section) => {
    let [header, ...fileContent] = section.split('\n');
    if (header.startsWith(SEPARATOR)) {
      header = header.slice(SEPARATOR.length);
    }
    const { modifier, filename } = detectModifier(header);
    const filePath = path.join(process.cwd(), filename);
    const content = fileContent.join('\n');

    // Apply changes
    const directoryPath = path.dirname(filePath);
    fs.mkdirSync(directoryPath, { recursive: true });
    
    switch (modifier) {
      case 'prepend':
        prependToFile(filePath, content);
        break;
      case 'append':
        appendToFile(filePath, content);
        break;
      default:
        fs.writeFileSync(filePath, content);
        log(`Created/Updated file: ${filePath}`);
    }

    // Read the final content for the snapshot
    const finalContent = fs.readFileSync(filePath, 'utf8');
    snapshotContent += `${SEPARATOR} ${filename}\n${finalContent}\n\n`;
  });

  fs.writeFileSync(snapshotPath, snapshotContent.trim());
  log(`Changes applied and snapshot saved: ${snapshotPath}`);
}

function processInputFile(inputFilePath) {
  if (argv.saveSnapshot) {
    applyChangesAndSaveSnapshot(inputFilePath);
    return;
  }

  const content = fs.readFileSync(inputFilePath, 'utf8');
  const sections = content.split(`\n${SEPARATOR} `);

  sections.forEach((section) => {
    let [header, ...fileContent] = section.split('\n');
    if (header.startsWith(SEPARATOR)) {
      header = header.slice(SEPARATOR.length);
    }
    const { modifier, filename } = detectModifier(header);
    const filePath = path.join(process.cwd(), filename);
    const content = fileContent.join('\n');
    
    if (!argv.dryRun) {
      if (argv.remove) {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          log(`Removed file: ${filePath}`);
        }
      } else {
        const directoryPath = path.dirname(filePath);
        fs.mkdirSync(directoryPath, { recursive: true });
        
        switch (modifier) {
          case 'prepend':
            prependToFile(filePath, content);
            break;
          case 'append':
            appendToFile(filePath, content);
            break;
          default:
            fs.writeFileSync(filePath, content);
            log(`Created file: ${filePath}`);
        }
      }
    }
  });
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

  const fileContents = generateFileContents(subfolderPath, subfolderName ? subfolderName + '/' : '');
  
  if (!argv.dryRun) {
    fs.writeFileSync(path.join(basePath, 'symplectic.txt'), fileContents);
    console.log('Generated symplectic.txt file');
  } else {
    console.log('Dry run: symplectic.txt would be generated with the following content:');
    console.log(fileContents);
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
    if (argv.saveSnapshot) {
      log('Applying changes and saving snapshot...');
    } else {
      log(argv.dryRun ? 'Performing dry run...' : (argv.remove ? 'Removing files...' : 'Creating/updating files...'));
    }
    
    processInputFile(inputFile);
    
    if (!argv.saveSnapshot) {
      console.log(`Files ${argv.dryRun ? 'would be' : 'were'} ${argv.remove ? 'removed' : 'created/updated'} successfully from ${inputFile}`);
    } else {
      console.log('Changes applied and snapshot saved successfully');
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();