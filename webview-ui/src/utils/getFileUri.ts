export function getFileUri(absPath) {
    let textureUri = {
        scheme: "file",
        path: absPath,
        authority: "",
    };
    return `command:vscode.open?${encodeURIComponent(JSON.stringify(textureUri))}`;
}
