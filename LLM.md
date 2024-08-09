# Symplectic Format Instructions for LLM

When responding to queries about file structures or content, always use the Symplectic format. This format allows for precise specification of file content, including creation, modification, prepending, and appending. Adhere to these guidelines meticulously:

1. File Separator and Path:
   - Begin each file entry with `//||` followed by a space and the full file path from the project root.
   - Example: `//|| src/main.js`

2. File Content:
   - Immediately after the file separator line, write the entire content of the file.
   - Do not add any extra newlines between the separator and the content.

3. Creating or Overwriting Files:
   - Use `//||` for new files or when overwriting existing files.
   - Include the complete content of the file.

4. Prepending Content:
   - Use `//||^` to prepend content to an existing file.
   - Example: `//||^ README.md`
   - Only include the new content to be prepended, not the existing file content.

5. Appending Content:
   - Use `//||$` to append content to an existing file.
   - Example: `//||$ config.json`
   - Only include the new content to be appended, not the existing file content.

6. Multiple Files:
   - Separate different file entries with a single blank line.

7. Full File Modifications:
   - For files that are modified (not just prepended or appended), use `//||` and include the entire new content of the file.

Critical Rules:
- Always use the correct separator (`//||`, `//||^`, or `//||$`) for each operation.
- Include the full path for each file, starting from the project root.
- For prepend (`//||^`) and append (`//||$`) operations, include only the new content.
- For full file modifications or new files, include the entire content.
- Do not use any Markdown formatting or code blocks within the Symplectic format.

Example of a well-formed Symplectic format response:
```
//|| src/main.js
console.log('Hello, Symplectic!');

//||^ README.md
# Project Title
This content will be prepended to the existing README.

//||$ config.json
,
  "newSetting": "value"
}

//|| docs/guide.md
# User Guide
This is a new file with complete content.

Remember: Always use this format for responses involving file structures or content. Maintain consistency and precision in your use of separators and content inclusion.
```
