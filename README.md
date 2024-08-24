# vscode-clipboard-diff-patch

## Overview

`clipboard-diff-patch` is a Visual Studio Code extension that allows you to apply diff patches directly from your clipboard to the currently open file. This can be particularly useful for developers who frequently work with patches and need a quick way to apply them without leaving the editor.

## Features

- **Apply Diff Patch from Clipboard**: Apply a diff patch from the clipboard to the active file in the editor.
- **Error Handling**: Provides informative messages if the clipboard content is not a valid diff patch or if no active editor is found.

## Usage

1. Copy a diff patch to your clipboard.
2. Open the file you want to apply the patch to in Visual Studio Code.
3. Open the Command Palette by pressing `Ctrl+Shift+P`.
4. Type `Apply Diff Patch from Clipboard` and select the command.

## Example

### Step-by-Step Example

1. **Create a Diff Patch**: Suppose you have the following original file `example.txt`:

    ```txt
    Line 1
    Line 2
    Line 3
    ```

    And you want to change `Line 2` to `Line 2 modified`. You create a diff patch:

    ```diff
    --- example.txt
    +++ example.txt
    @@ -1,3 +1,3 @@
     Line 1
    -Line 2
    +Line 2 modified
     Line 3
    ```

2. **Copy the Diff Patch**: Copy the above diff patch to your clipboard.

3. **Open the File in VSCode**: Open `example.txt` in Visual Studio Code.

4. **Apply the Patch**:
    - Open the Command Palette by pressing `Ctrl+Shift+P`.
    - Type `Apply Diff Patch from Clipboard` and select the command.

5. **Result**: The content of `example.txt` will be updated to:

    ```txt
    Line 1
    Line 2 modified
    Line 3
    ```

## Requirements

- Visual Studio Code version 1.86.0 or higher.

## Extension Settings

This extension does not contribute any settings.

## Known Issues

- The extension may fail to apply patches if the context lines in the patch do not match the content of the file exactly.
- Only supports unified diff format.

## Release Notes

### 1.0.0

- Initial release of `clipboard-diff-patch`.

## Contributing

If you encounter any issues or have feature requests, please feel free to open an issue or submit a pull request on the [GitHub repository](https://github.com/your-repo/clipboard-diff-patch).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
