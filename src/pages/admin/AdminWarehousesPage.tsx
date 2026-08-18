import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Warehouse, MapPin, Phone, Plus, Eye, Save } from 'lucide-react';
import { Button, Card, Input, Modal, PageHeader, StatusBadge } from '../../components/ui';
import { mockWarehouses } from '../../data/mockData';
import { Warehouse as WarehouseRecord } from '../../types';
import { useApp } from '../../context/AppContext';

export const AdminWarehousesPage: React.FC = () => {
  const { showToast } = useApp();
  const [warehouses, setWarehouses] = useState<WarehouseRecord[]>(mockWarehouses);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [facilityName, setFacilityName] = useState('Kampong Cham Forward Stocking Location');
  const [facilityCode, setFacilityCode] = useState('WH-KPC-01');
  const [facilityCity, setFacilityCity] = useState('Kampong Cham');
  const [facilityAddress, setFacilityAddress] = useState('National Road 7, Prey Chhor District');

  const handleAddWarehouse = (event: React.FormEvent) => {
    event.preventDefault();
    const newWarehouse: WarehouseRecord = {
      id: `wh-${facilityCode.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: facilityName,
      code: facilityCode,
      city: facilityCity,
      address: facilityAddress,
      status: 'Active',
      totalProductsCount: 0,
      stockUnitsTotal: 0,
      reservedUnits: 0,
      lowStockItemsCount: 0,
      capacityUtilization: 0
    };

    setWarehouses((current) => [newWarehouse, ...current]);
    setAddModalOpen(false);
    showToast(`${facilityName} added to warehouse directory.`, 'success');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Distribution Warehouses & Logistics Hubs"
        subtitle="Manage commercial cross-docking facilities, regional fulfillment centers, and warehouse capacity"
        breadcrumbs={[
          { label: 'Inventory & Logistics', href: '/admin/dashboard' },
          { label: 'Warehouses' }
        ]}
        actions={
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setAddModalOpen(true)}>
            Add Warehouse Facility
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {warehouses.map((wh) => (
          <Card key={wh.id} className="p-6 border-slate-200 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Warehouse className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-bold text-slate-900">{wh.name}</h3>
                </div>
                <span className="font-mono text-xs text-blue-600 block mt-0.5">{wh.code}</span>
              </div>
              <StatusBadge status={wh.status} />
            </div>

            <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{wh.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Facility Contact: +855 23 881 900 (Manager: Sokha Veng)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium">Active SKUs:</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">{wh.totalProductsCount || 0} Products</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium">Capacity Utilization:</span>
                <p className="text-base font-bold text-blue-700 mt-0.5">{wh.capacityUtilization || 0}% Pallet Occupancy</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <Link to={`/admin/warehouses/${wh.id}`}>
                <Button variant="outline" size="sm" icon={Eye}>
                  View Warehouse Detail
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add Warehouse Facility">
        <form onSubmit={handleAddWarehouse} className="space-y-4">
          <Input
            label="Facility Name"
            required
            value={facilityName}
            onChange={(event) => setFacilityName(event.target.value)}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Warehouse Code"
              required
              value={facilityCode}
              onChange={(event) => setFacilityCode(event.target.value)}
            />
            <Input
              label="City"
              required
              value={facilityCity}
              onChange={(event) => setFacilityCity(event.target.value)}
            />
          </div>
          <Input
            label="Facility Address"
            required
            value={facilityAddress}
            onChange={(event) => setFacilityAddress(event.target.value)}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Save}>
              Save Facility
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
