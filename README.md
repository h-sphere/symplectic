# Symplectic

Symplectic is a Node.js utility for managing project structures through a single file. It allows you to generate a `symplectic.txt` file from an existing project structure, create project structures from a `symplectic.txt` file, remove files based on the `symplectic.txt` specification, and now includes a snapshot feature for easy reverting of changes.

## Use Cases

1. **Project Templates**: Create reusable project templates that can be easily shared and instantiated.

2. **LLM Interaction**: Easily communicate project structures to Large Language Models for code generation or analysis.

3. **Quick Project Setup**: Rapidly set up complex project structures with a single command.

4. **Clean Up**: Easily remove generated project structures when they're no longer needed.

5. **File Modification**: Prepend or append content to existing files without overwriting them.

6. **Version Control**: Create snapshots of your project structure for easy reverting of changes.

## Important Disclaimer

**Warning**: The operations performed by Symplectic are destructive by nature. Always archive your changes and use version control. It is strongly recommended to operate in dry-run mode first to verify the intended actions. The author does not take any responsibility for data loss caused by the use of this tool.

## Installation

To install Symplectic globally, run:

```bash
npm install -g symplectic
```

For local installation in your project:

```bash
npm install symplectic
```

## Usage

Before running any command, it's recommended to use the `--dry-run` option to see what changes would be made without actually applying them.

Symplectic can be used in several ways:

### Generate symplectic.txt

To generate a `symplectic.txt` file from your current project structure:

```bash
symplectic --generate --dry-run
```

If the dry run output looks correct, you can run the command without `--dry-run` to actually create the `symplectic.txt` file:

```bash
symplectic --generate
```

This will create a `symplectic.txt` file in the current directory, containing the structure and content of your project.

### Create project structure

To create a project structure from a `symplectic.txt` file:

```bash
symplectic --dry-run
```

If the dry run output looks correct, you can run the command without `--dry-run` to actually create the file structure:

```bash
symplectic
```

This command assumes a `symplectic.txt` file is present in the current directory. It will create the file structure and content specified in the file.

### Remove project structure

To remove files specified in the `symplectic.txt`:

```bash
symplectic --remove --dry-run
```

If the dry run output looks correct, you can run the command without `--dry-run` to actually remove the files:

```bash
symplectic --remove
```

This will delete all files and directories specified in the `symplectic.txt` file.

### Prepend or Append to Files

To prepend or append content to existing files, use the following syntax in your `symplectic.txt` file:

- For prepending: `//||^ filename`
- For appending: `//||$ filename`

Example:

```
//||^ existing_file.txt
This content will be prepended to the file.

//||$ another_existing_file.txt
This content will be appended to the file.
```

Then run:

```bash
symplectic --dry-run
```

If the dry run output looks correct, run without `--dry-run` to apply the changes:

```bash
symplectic
```

### Create a Snapshot

To apply changes and create a snapshot of the resulting system state:

```bash
symplectic --save-snapshot
```

This command will:
1. Apply all changes specified in the `symplectic.txt` file.
2. Create a snapshot of the resulting system state after the changes have been applied.
3. Save the snapshot in the `.symplecticarchive` directory with a timestamp in the filename.

The snapshot file will be in the Symplectic format, allowing you to revert to this state later if needed.

## Parameters

Symplectic supports the following command-line parameters:

| Parameter | Short | Description |
|-----------|-------|-------------|
| `--verbose` | `-v` | Run with verbose logging |
| `--dry-run` | `-d` | Perform a dry run without creating or removing files |
| `--remove` | `-r` | Remove files instead of creating them |
| `--generate` | `-g` | Generate symplectic.txt file from existing structure |
| `--subfolder <path>` | `-s <path>` | Generate structure for a specific subfolder |
| `--save-snapshot` | `-S` | Apply changes and save a snapshot of the resulting system |
| `--help` | `-h` | Show help information |

## Examples

1. Generate `symplectic.txt` for a specific subfolder:

   ```bash
   symplectic --generate --subfolder src --dry-run
   ```

2. Perform a dry run to see what files would be created or modified:

   ```bash
   symplectic --dry-run
   ```

3. Remove files with verbose logging:

   ```bash
   symplectic --remove --verbose --dry-run
   ```

4. Prepend content to an existing file:

   ```bash
   echo "//||^ existing_file.txt\nPrepended content" > symplectic.txt
   symplectic --dry-run
   ```

5. Append content to an existing file:

   ```bash
   echo "//||$ existing_file.txt\nAppended content" > symplectic.txt
   symplectic --dry-run
   ```

6. Apply changes and create a snapshot:

   ```bash
   symplectic --save-snapshot
   ```

## .symplecticignore

Symplectic respects `.gitignore` rules and also supports a `.symplecticignore` file for additional exclusions. The `symplectic.txt` file itself is always ignored.

## File Format

The `symplectic.txt` file uses the following format:

```
//|| filename
file content

//|| another/file/path
another file's content

//||^ existing_file.txt
content to prepend

//||$ existing_file.txt
content to append
```

Each file is separated by a line starting with `//||` followed by the file path. Use `//||^` for prepending and `//||$` for appending.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. Here's how you can contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

When submitting a pull request:

- Provide a clear description of the changes
- Include any relevant issue numbers
- Update the README.md with details of changes to the interface, if applicable
- Increase the version numbers in any examples files and the README.md to the new version that this Pull Request would represent

## Support the Project

If you find Symplectic useful, consider supporting its development:

[Buy us a coffee on Ko-fi](https://ko-fi.com/hypersphere)

## License

This project is licensed under the ISC License.