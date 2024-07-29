# Symplectic

Symplectic is a Node.js utility for managing project structures through a single file. It allows you to generate a `symplectic.txt` file from an existing project structure, create project structures from a `symplectic.txt` file, and remove files based on the `symplectic.txt` specification.

## Use Cases

1. **Project Templates**: Create reusable project templates that can be easily shared and instantiated.

2. **LLM Interaction**: Easily communicate project structures to Large Language Models for code generation or analysis.

3. **Quick Project Setup**: Rapidly set up complex project structures with a single command.

4. **Clean Up**: Easily remove generated project structures when they're no longer needed.

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

## Parameters

Symplectic supports the following command-line parameters:

| Parameter | Short | Description |
|-----------|-------|-------------|
| `--verbose` | `-v` | Run with verbose logging |
| `--dry-run` | `-d` | Perform a dry run without creating or removing files |
| `--remove` | `-r` | Remove files instead of creating them |
| `--generate` | `-g` | Generate symplectic.txt file from existing structure |
| `--subfolder <path>` | `-s <path>` | Generate structure for a specific subfolder |
| `--help` | `-h` | Show help information |

## Examples

1. Generate `symplectic.txt` for a specific subfolder:

   ```bash
   symplectic --generate --subfolder src --dry-run
   ```

2. Perform a dry run to see what files would be created:

   ```bash
   symplectic --dry-run
   ```

3. Remove files with verbose logging:

   ```bash
   symplectic --remove --verbose --dry-run
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
```

Each file is separated by a line starting with `//||` followed by the file path.

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