export const triggerDownload = (
  url: string,
  filename: string,
  showToast?: (msg: string, type: 'success' | 'error' | 'info') => void
) => {
  try {
    const cleanName = filename || 'download.mp4';
    const folder = cleanName.endsWith('.mp4')
      ? 'videos'
      : cleanName.endsWith('.mp3')
      ? 'audio'
      : 'images';
    const downloadEndpoint = `/api/download/${folder}/${cleanName}`;
    const a = document.createElement('a');
    a.href = downloadEndpoint;
    a.download = cleanName;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (showToast) showToast(`Downloading ${cleanName}...`, 'success');
  } catch {
    window.open(url, '_blank');
  }
};
