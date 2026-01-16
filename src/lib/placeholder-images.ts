import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const productImages: ImagePlaceholder[] = data.placeholderImages.filter(img => img.id.startsWith('product'));
export const heroImage: ImagePlaceholder = data.placeholderImages.find(img => img.id === 'hero-image')!;
