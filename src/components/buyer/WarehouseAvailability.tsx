import React from 'react';
import { Warehouse } from 'lucide-react';

export interface WarehouseAvailabilityItem {
  warehouseId: string;
  warehouseName: string;
  city: string;
  available: number;
  reserved?: number;
}

interface WarehouseAvailabilityProps {
  availability: WarehouseAvailabilityItem[];
  unit?: string;
  compact?: boolean;
}

export const WarehouseAvailability: React.FC<WarehouseAvailabilityProps> = ({
  availability,
  unit = 'units',
  compact = false
}) => {
  const totalAvailable = availability.reduce((sum, item) => sum + item.available, 0);

  return (
    <div className={`rounded-xl border border-slate-200 bg-slate-50 ${compact ? 'p-3' : 'p-4'}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <Warehouse className="w-4 h-4 text-blue-600" />
          Warehouse Availability
        </div>
        <div className="text-xs font-extrabold text-emerald-700">
          {totalAvailable.toLocaleString()} {unit}
        </div>
      </div>

      <div className="space-y-2">
        {availability.map((item) => (
          <div
            key={item.warehouseId}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
          >
            <div className="min-w-0">
              <div className="font-bold text-slate-900 truncate">{item.warehouseName}</div>
              <div className="text-[11px] text-slate-500">{item.city}</div>
            </div>
            <div className="text-right">
              <div className="font-extrabold text-slate-900">{item.available.toLocaleString()}</div>
              <div className="text-[10px] text-slate-500">{unit}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
