import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Tag, Warehouse } from 'lucide-react';
import { Product } from '../../types';
import { Button, Card, StatusBadge } from '../ui';
import {
  formatCurrency,
  formatTierRange,
  getBuyerPriceRange,
  getBuyerUnitPriceForTier
} from '../../utils/pricing';
import { WarehouseAvailabilityItem } from './WarehouseAvailability';

interface BuyerProductCardProps {
  product: Product;
  buyerGroup?: string;
  availability: WarehouseAvailabilityItem[];
}

export const BuyerProductCard: React.FC<BuyerProductCardProps> = ({
  product,
  buyerGroup,
  availability
}) => {
  const priceRange = getBuyerPriceRange(product, buyerGroup);
  const totalAvailable = availability.reduce((sum, item) => sum + item.available, 0) || product.availableStock;

  return (
    <Card className="flex h-full flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="relative mb-4 h-44 overflow-hidden rounded-lg bg-slate-100">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute left-2 top-2">
            <StatusBadge status={product.status} size="sm" />
          </div>
          <div className="absolute right-2 top-2 rounded bg-slate-900/80 px-2 py-0.5 font-mono text-[11px] font-bold text-white">
            MOQ: {product.moq}
          </div>
        </div>

        <div className="mb-1 flex items-center justify-between gap-3 text-[11px] font-mono">
          <span className="font-bold text-blue-600">{product.sku}</span>
          <span className="truncate text-slate-500">{product.category}</span>
        </div>
        <h3 className="line-clamp-2 text-sm font-extrabold text-slate-900">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{product.description}</p>

        <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/60 p-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
            {buyerGroup || 'Buyer'} Price
          </div>
          <div className="mt-1 text-lg font-extrabold text-slate-900">
            From {formatCurrency(priceRange.min, product.currency)}
            <span className="text-xs font-semibold text-slate-500">/unit</span>
          </div>
        </div>

        <div className="mt-3 space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
          {product.tierPricing.slice(0, 3).map((tier) => {
            const buyerPrice = getBuyerUnitPriceForTier(product, tier, buyerGroup);

            return (
              <div key={`${product.id}-${tier.minQty}`} className="flex justify-between gap-3 text-slate-600">
                <span>{formatTierRange(tier, product.unit)}</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(buyerPrice.unitPrice, product.currency)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Warehouse className="h-3.5 w-3.5 text-blue-600" />
            Warehouse stock
          </span>
          <span className="font-bold text-slate-900">
            {totalAvailable.toLocaleString()} {product.unit}
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-slate-100 pt-3">
        <Link to={`/buyer/products/${product.id}`} className="block">
          <Button variant="outline" size="sm" className="w-full" icon={Package}>
            View Details
          </Button>
        </Link>
        <Link to="/buyer/rfqs" className="block">
          <Button variant="primary" size="sm" className="w-full" icon={Tag}>
            Request Quote
          </Button>
        </Link>
      </div>
    </Card>
  );
};
