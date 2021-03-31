const readFileAsText = (file: Blob): Promise<string> => {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onerror = () => {
            reader.abort();
            reject(reader.error);
        };
        reader.onload = () => {
            resolve(reader.result as string);
        };
        reader.readAsText(file);
    });
};


export const OpenFileInputName = "LawtextAppPage.OpenFileInput";
export const openFile = (): void => {
    const els = document.getElementsByName(OpenFileInputName);
    if (els) {
        els[0].click();
    }
};

export const readFileInput = async (): Promise<string | null> => {
    const openFileInput = document.getElementsByName(OpenFileInputName).item(0) as HTMLInputElement;
    if (!openFileInput) return null;
    const file = openFileInput.files ? openFileInput.files[0] : null;
    if (!file) return null;
    const text = await readFileAsText(file);
    openFileInput.value = "";
    return text;
};
