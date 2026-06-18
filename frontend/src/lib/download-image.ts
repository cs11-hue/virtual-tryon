export async function downloadImageFromUrl(
  url: string,
  filename: string,
): Promise<void> {
  const response = await fetch(url, { mode: "cors" });

  if (!response.ok) {
    throw new Error("DOWNLOAD_FAILED");
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  try {
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function downloadBlobUrl(
  blobUrl: string,
  filename: string,
): Promise<void> {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  try {
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
