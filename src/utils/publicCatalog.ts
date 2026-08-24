import { Product, ProductCategory } from '../types';

export const slugifyCategory = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const getCategorySlug = (category: Pick<ProductCategory, 'slug' | 'name'>) =>
  category.slug || slugifyCategory(category.name);

export const getProductCategorySlug = (product: Pick<Product, 'category'>) => slugifyCategory(product.category);

export const getCategoryProductCount = (category: ProductCategory, products: Product[]) =>
  products.filter((product) => product.category === category.name).length;

export const getCategoryHeroImage = (category: ProductCategory, products: Product[]) =>
  products.find((product) => product.category === category.name)?.images[0] || products[0]?.images[0] || '';

export const getCategorySummaries = (categories: ProductCategory[], products: Product[]) =>
  categories.map((category) => {
    const categoryProducts = products.filter((product) => product.category === category.name);

    return {
      ...category,
      slug: getCategorySlug(category),
      itemCount: categoryProducts.length,
      heroImage: getCategoryHeroImage(category, products),
      featuredProducts: categoryProducts.filter((product) => product.featured).slice(0, 3),
      products: categoryProducts
    };
  });

export const findCategoryBySlug = (categories: ProductCategory[], slug?: string) =>
  categories.find((category) => getCategorySlug(category) === slug);

export const getProductsByCategorySlug = (products: Product[], categories: ProductCategory[], slug?: string) => {
  const category = findCategoryBySlug(categories, slug);
  return category ? products.filter((product) => product.category === category.name) : [];
};

export const getRelatedProducts = (product: Product, products: Product[], limit = 4) =>
  products
    .filter((item) => item.id !== product.id && item.category === product.category)
    .slice(0, limit);

export const getProductSupplier = (product: Product) => product.brand || 'WholesaleHub Verified Supplier';

export const getStockLabel = (product: Product) => {
  if (product.availableStock <= 0) return 'Out of Stock';
  if (product.availableStock <= product.reorderPoint) return 'Low Stock';
  return 'In Stock';
};
