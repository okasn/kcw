export async function getManifest() {
  const response = await fetch('/data/manifest.json', {
    cache: 'force-cache',
  });

  if (!response.ok) {
    throw new Error('Failed to load manifest.json');
  }

  return response.json();
}