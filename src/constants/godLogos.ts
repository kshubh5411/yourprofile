const symbolModules = import.meta.glob('../assets/symbols/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const toId = (path: string) =>
  path
    .split('/')
    .pop()
    ?.replace(/\.[^.]+$/, '') || '';

const dynamicSymbols = Object.entries(symbolModules)
  .map(([path, src]) => ({ id: toId(path), src }))
  .filter((item) => item.id)
  .sort((a, b) => a.id.localeCompare(b.id));

export const topIconOptions = dynamicSymbols;

const legacyAliases: Record<string, string> = {
  None: '',
  none: '',
  Om: 'om-1',
  Shree: 'ganesha-2',
  Ganesha: 'ganesha-4',
};

export const getGodLogoAsset = (logo: string): string => {
  if (!logo || logo === 'None' || logo === 'none') return '';
  const byId = dynamicSymbols.find((item) => item.id === logo);
  if (byId) return byId.src;
  const aliasId = legacyAliases[logo];
  if (!aliasId) return '';
  return dynamicSymbols.find((item) => item.id === aliasId)?.src || '';
};
