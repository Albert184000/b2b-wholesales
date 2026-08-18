import React from 'react';
import { PackageCheck, Warehouse } from 'lucide-react';
import { StockAllocation } from '../../types';
import { Card, StatusBadge } from '../ui';

interface InventoryAllocationSummaryProps {
  allocations: StockAllocation[];
  title?: string;
  className?: string;
}

export const InventoryAllocationSummary: React.FC<InventoryAllocationSummaryProps> = ({
  allocations,
  title = 'Inventory Allocation Summary',
  className = ''
}) => {
  return (
    <Card title={title} className={className}>
      <div className="space-y-4">
        {allocations.map((allocation) => (
          <div key={`${allocation.sku}-${allocation.requestedQty}`} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="font-semibold text-slate-900">{allocation.productName}</div>
                <div className="font-mono text-xs font-bold text-blue-600">{allocation.sku}</div>
              </div>
              <StatusBadge status={allocation.result} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="font-semibold text-slate-500">Requested</div>
                <div className="mt-1 font-bold text-slate-900">{allocation.requestedQty.toLocaleString()}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="font-semibold text-slate-500">Available</div>
                <div className="mt-1 font-bold text-slate-900">{allocation.totalAvailable.toLocaleString()}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="font-semibold text-slate-500">Allocated</div>
                <div className="mt-1 font-bold text-emerald-700">{allocation.allocatedQty.toLocaleString()}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="font-semibold text-slate-500">Backorder</div>
                <div className={`mt-1 font-bold ${allocation.backorderQty > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
                  {allocation.backorderQty.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {allocation.warehouses.map((warehouse) => (
                <div
                  key={warehouse.warehouseId}
                  className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Warehouse className="h-4 w-4 text-slate-400" />
                    <div>
                      <div className="font-bold text-slate-900">{warehouse.warehouseName}</div>
                      <div className="text-slate-500">{warehouse.city || 'Regional depot'}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-700">
                      Available {warehouse.available.toLocaleString()}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">
                      <PackageCheck className="h-3.5 w-3.5" />
                      Allocate {warehouse.allocated.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
