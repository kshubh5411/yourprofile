export const godLogos = {
  None: '',
  Om: '/symbols/ganesh-1.jpg',
  Shree: '/symbols/ganesha-2.jpg',
  Ganesha: '/symbols/ganesha-4.jpeg',
};

export const getGodLogoAsset = (logo: string): string => {
  return godLogos[logo as keyof typeof godLogos] || '';
};
