import * as vscode from "vscode";
import { parsePatch, applyPatch, ParsedDiff, structuredPatch } from "diff";

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "paste-diff-patch" is now active!');

    const disposable = vscode.commands.registerCommand(
        "paste-diff-patch.applyDiffPatchFromClipboard",
        async () => {
            const clipboardContent = await vscode.env.clipboard.readText();

            if (!isDiffPatch(clipboardContent)) {
                vscode.window.showInformationMessage(
                    "Clipboard does not contain a valid diff patch."
                );
                return;
            }

            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showInformationMessage("No active editor found.");
                return;
            }

            const document = editor.document;
            const documentContent = document.getText();

            console.log("running applyDiffPatchFromClipboard");

            try {
                const patchedContent = applyDiffPatch(documentContent, clipboardContent);
                const edit = new vscode.WorkspaceEdit();
                const fullRange = new vscode.Range(
                    document.positionAt(0),
                    document.positionAt(documentContent.length)
                );
                edit.replace(document.uri, fullRange, patchedContent);
                await vscode.workspace.applyEdit(edit);
                vscode.window.showInformationMessage("Diff patch applied successfully");
            } catch (error: any) {
                vscode.window.showErrorMessage(`Failed to apply diff patch: ${error.message}`);
                console.error(error);
            }
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}

function isDiffPatch(content: string): boolean {
    return content.includes("@@ -");
}

function applyDiffPatch(documentContent: string, diffPatch: string): string {
    const hunks = diffPatch
        .split(/^@@/gm)
        .slice(1)
        .map((hunk) => `@@${hunk}`);
    let patchedContent = documentContent;
    let lastAppliedLine = 0;

    for (const hunk of hunks) {
        try {
            const fuzzyPatchResult = fuzzyApplyHunk(patchedContent, hunk, lastAppliedLine);
            if (fuzzyPatchResult) {
                patchedContent = fuzzyPatchResult.content;
                lastAppliedLine = fuzzyPatchResult.lastAppliedLine;
            } else {
                throw new Error(`Failed to apply hunk: ${hunk}`);
            }
        } catch (error) {
            console.error(`Error applying hunk: ${hunk}`, error);
            throw error;
        }
    }

    return patchedContent;
}

function fuzzyApplyHunk(
    content: string,
    hunk: string,
    startLine: number
): { content: string; lastAppliedLine: number } | null {
    const [header, ...lines] = hunk.split("\n");
    const [, oldStart, oldLines, newStart, newLines] =
        header.match(/^@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@/) || [];

    const contextLines = lines
        .filter((line) => !line.startsWith("+") && !line.startsWith("-"))
        .map((line) => line.slice(1)); // Remove the first space
    const contentLines = content.split("\n");

    let bestMatch = -1;
    let bestScore = -1;

    // Find the exact match for the first context line
    const firstContextLine = contextLines[0];
    for (let i = startLine; i < contentLines.length; i++) {
        if (contentLines[i] === firstContextLine) {
            const score = calculateMatchScore(
                contentLines.slice(i, i + contextLines.length),
                contextLines
            );
            if (score === contextLines.length) {
                bestMatch = i;
                break;
            }
            if (score > bestScore) {
                bestScore = score;
                bestMatch = i;
            }
        }
    }

    if (bestMatch === -1) {
        return null;
    }

    const beforeLines = contentLines.slice(0, bestMatch);
    const afterLines = contentLines.slice(
        bestMatch + parseInt(oldLines, 10) || contextLines.length
    );
    const patchedLines = lines
        .filter((line) => !line.startsWith("-"))
        .map((line) => {
            if (line.startsWith("+")) {
                return line.slice(1); // Remove the '+' for added lines
            } else {
                return line.slice(1); // Remove the space for context lines
            }
        });

    const newContent = [...beforeLines, ...patchedLines, ...afterLines].join("\n");
    const lastAppliedLine = bestMatch + patchedLines.length;

    return { content: newContent, lastAppliedLine };
}

function calculateMatchScore(contentLines: string[], contextLines: string[]): number {
    return contextLines.reduce((score, line, index) => {
        if (line === contentLines[index]) {
            return score + 1;
        }
        return score;
    }, 0);
}
