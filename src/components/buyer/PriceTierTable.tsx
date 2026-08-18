import React from 'react';
import { Product } from '../../types';
import {
  formatCurrency,
  formatTierRange,
  getBuyerPriceEstimate,
  getBuyerUnitPriceForTier,
  getTierSavingsPercent
} from '../../utils/pricing';

interface PriceTierTableProps {
  product: Product;
  buyerGroup?: string;
  quantity?: number;
  onSelectQuantity?: (quantity: number) => void;
}

export const PriceTierTable: React.FC<PriceTierTableProps> = ({
  product,
  buyerGroup,
  quantity = product.moq,
  onSelectQuantity
}) => {
  const estimate = getBuyerPriceEstimate(product, quantity, buyerGroup);

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[520px] text-left text-xs">
        <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-3 py-2.5">Quantity Tier</th>
            <th className="px-3 py-2.5">Wholesale</th>
            <th className="px-3 py-2.5">{buyerGroup || 'Buyer'} Price</th>
            <th className="px-3 py-2.5 text-right">Savings</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {product.tierPricing.map((tier) => {
            const buyerPrice = getBuyerUnitPriceForTier(product, tier, buyerGroup);
            const active = !estimate.isBelowMOQ && estimate.tier === tier;

            return (
              <tr key={`${product.id}-${tier.minQty}`} className={active ? 'bg-blue-50/80' : undefined}>
                <td className="px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => onSelectQuantity?.(tier.minQty)}
                    className="text-left hover:text-blue-700"
                  >
                    <span className="block font-bold text-slate-900">{formatTierRange(tier, product.unit)}</span>
                    {tier.label && <span className="block text-[10px] text-slate-500">{tier.label}</span>}
                  </button>
                </td>
                <td className="px-3 py-2.5 font-semibold text-slate-600">
                  {formatCurrency(buyerPrice.baseUnitPrice, product.currency)}
                </td>
                <td className="px-3 py-2.5">
                  <span className="font-extrabold text-slate-900">
                    {formatCurrency(buyerPrice.unitPrice, product.currency)}
                  </span>
                  {buyerPrice.discountPercentage > 0 && (
                    <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      {buyerPrice.discountPercentage}% group
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-right font-bold text-emerald-700">
                  -{getTierSavingsPercent(product, { ...tier, unitPrice: buyerPrice.unitPrice })}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
