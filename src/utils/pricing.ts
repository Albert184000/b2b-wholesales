import { Product, TierPrice } from '../types';

export const formatCurrency = (value: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(value);

export const formatTierRange = (tier: TierPrice, unit = 'units') =>
  tier.maxQty === null ? `${tier.minQty}+ ${unit}` : `${tier.minQty}-${tier.maxQty} ${unit}`;

export const getTierForQuantity = (product: Product, quantity: number) => {
  const normalizedQuantity = Number.isFinite(quantity) ? quantity : product.moq;

  return (
    product.tierPricing.find(
      (tier) =>
        normalizedQuantity >= tier.minQty &&
        (tier.maxQty === null || normalizedQuantity <= tier.maxQty)
    ) || product.tierPricing[0]
  );
};

export const getBestTier = (product: Product) =>
  product.tierPricing[product.tierPricing.length - 1] || product.tierPricing[0];

export const getTierSavingsPercent = (product: Product, tier: TierPrice) =>
  Math.max(0, Math.round(((product.basePrice - tier.unitPrice) / product.basePrice) * 100));

export const getOrderEstimate = (product: Product, quantity: number) => {
  const normalizedQuantity = Math.max(0, Number.isFinite(quantity) ? quantity : product.moq);
  const tier = getTierForQuantity(product, normalizedQuantity);
  const unitPrice = tier?.unitPrice || product.basePrice;

  return {
    tier,
    unitPrice,
    subtotal: unitPrice * normalizedQuantity,
    isBelowMOQ: normalizedQuantity < product.moq
  };
};

export const getRfqLoginPath = (product: Product, quantity: number, targetPrice: number) =>
  `/login?next=${encodeURIComponent(
    `/buyer/rfqs/new?product=${product.id}&qty=${quantity}&target=${targetPrice}`
  )}`;

export const getBuyerGroupDiscount = (product: Product, buyerGroup?: string) =>
  product.buyerGroupPricing?.find(
    (groupPricing) => groupPricing.groupName.toLowerCase() === (buyerGroup || '').toLowerCase()
  );

export const getBuyerUnitPriceForTier = (
  product: Product,
  tier: TierPrice | undefined,
  buyerGroup?: string
) => {
  const wholesaleUnitPrice = tier?.unitPrice || product.basePrice;
  const groupDiscount = getBuyerGroupDiscount(product, buyerGroup);

  if (!groupDiscount) {
    return {
      unitPrice: wholesaleUnitPrice,
      baseUnitPrice: wholesaleUnitPrice,
      discountPercentage: 0,
      priceSource: tier ? 'Tier Price' : 'Base Wholesale Price'
    };
  }

  return {
    unitPrice: Math.round(wholesaleUnitPrice * (1 - groupDiscount.discountPercentage / 100)),
    baseUnitPrice: wholesaleUnitPrice,
    discountPercentage: groupDiscount.discountPercentage,
    priceSource: `${groupDiscount.groupName} Buyer Group Price`
  };
};

export const getBuyerPriceEstimate = (
  product: Product,
  quantity: number,
  buyerGroup?: string
) => {
  const normalizedQuantity = Math.max(0, Number.isFinite(quantity) ? quantity : product.moq);
  const tier = getTierForQuantity(product, normalizedQuantity);
  const buyerPrice = getBuyerUnitPriceForTier(product, tier, buyerGroup);

  return {
    ...buyerPrice,
    tier,
    quantity: normalizedQuantity,
    subtotal: buyerPrice.unitPrice * normalizedQuantity,
    isBelowMOQ: normalizedQuantity < product.moq
  };
};

export const getBuyerPriceRange = (product: Product, buyerGroup?: string) => {
  const tierPrices = product.tierPricing.map(
    (tier) => getBuyerUnitPriceForTier(product, tier, buyerGroup).unitPrice
  );
  const prices = tierPrices.length > 0 ? tierPrices : [product.basePrice];

  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
};
