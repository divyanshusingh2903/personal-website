const REPOSITORY_URL = "https://github.com/divyanshusingh2903/forge";

export const LATEST_RELEASE_URL = `${REPOSITORY_URL}/releases/latest`;
export const LATEST_RELEASE_API_URL = "https://api.github.com/repos/divyanshusingh2903/forge/releases/latest";

export function parseForgeRelease(data) {
  const versions = /^v(\d+\.\d+\.\d+)-v(\d+\.\d+\.\d+)$/.exec(data?.tag_name);
  if (!versions || data.draft || data.prerelease) return null;

  const url = `${REPOSITORY_URL}/releases/tag/${data.tag_name}`;
  if (data.html_url !== url) return null;

  const assetPrefix = `${REPOSITORY_URL}/releases/download/${data.tag_name}/`;
  const assets = Array.isArray(data.assets) ? data.assets : [];
  return {
    label: `OpenCode ${versions[1]} · Forge ${versions[2]}`,
    url,
    downloads: Object.fromEntries(assets
      .filter((asset) => asset.state === "uploaded" &&
        typeof asset.name === "string" &&
        asset.browser_download_url === `${assetPrefix}${asset.name}`)
      .map((asset) => [asset.name, asset.browser_download_url])),
  };
}
