import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Calendar, FileText, Plus, Save, Send, Trash2 } from 'lucide-react';
import {
  Alert,
  Button,
  Card,
  FileUpload,
  Input,
  PageHeader,
  Select,
  Textarea
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { mockBuyerWarehouseAvailability } from '../../data/mockData';
import { RFQItem } from '../../types';
import { formatCurrency, formatTierRange, getBuyerPriceEstimate } from '../../utils/pricing';

type RFQFormItem = {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  targetPrice: number;
  notes: string;
};

const getDefaultTargetPrice = (unitPrice: number) => Math.max(1, Math.round(unitPrice * 0.97));

export const BuyerCreateRFQPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentBuyer, products, saveRFQDraft, submitRFQ } = useApp();

  const initialProductId = searchParams.get('product') || products[0]?.id;
  const initialProduct = products.find((product) => product.id === initialProductId) || products[0];
  const initialQty = Math.max(
    initialProduct?.moq || 1,
    parseInt(searchParams.get('qty') || `${initialProduct?.moq || 1}`, 10)
  );
  const initialEstimate = initialProduct
    ? getBuyerPriceEstimate(initialProduct, initialQty, currentBuyer.buyerGroup)
    : undefined;
  const initialTarget =
    parseFloat(searchParams.get('target') || '') ||
    getDefaultTargetPrice(initialEstimate?.unitPrice || initialProduct?.basePrice || 1);

  const [projectTitle, setProjectTitle] = useState('Q4 Enterprise Infrastructure Procurement');
  const [requiredDate, setRequiredDate] = useState('2026-09-30');
  const [shippingAddress, setShippingAddress] = useState(
    `${currentBuyer.address}, ${currentBuyer.city || 'Phnom Penh'}`
  );
  const [paymentTermsPreference, setPaymentTermsPreference] = useState(currentBuyer.paymentTerms);
  const [specialInstructions, setSpecialInstructions] = useState(
    'Please include serial-number list, pallet labels, manufacturer warranty documents, and consolidated freight.'
  );
  const [attachmentNames, setAttachmentNames] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const [items, setItems] = useState<RFQFormItem[]>([
    {
      productId: initialProduct.id,
      productName: initialProduct.name,
      sku: initialProduct.sku,
      quantity: initialQty,
      targetPrice: initialTarget,
      notes: 'Requires sealed cartons and standard manufacturer warranty.'
    }
  ]);

  const productOptions = products.map((product) => ({
    value: product.id,
    label: `${product.sku} - ${product.name} (MOQ ${product.moq})`
  }));

  const enrichedItems = useMemo(() => {
    return items.map((item) => {
      const product = products.find((candidate) => candidate.id === item.productId) || products[0];
      const estimate = getBuyerPriceEstimate(product, item.quantity, currentBuyer.buyerGroup);
      const warehouseRows = mockBuyerWarehouseAvailability[product.id] || [];
      const availableUnits = warehouseRows.reduce((sum, row) => sum + row.available, 0);
      const primaryWarehouse = warehouseRows[0];
      const moqError = item.quantity < product.moq;

      return {
        ...item,
        product,
        estimate,
        availableUnits,
        primaryWarehouse,
        moqError
      };
    });
  }, [currentBuyer.buyerGroup, items, products]);

  const targetBudget = enrichedItems.reduce((sum, item) => sum + item.quantity * item.targetPrice, 0);
  const estimatedWholesale = enrichedItems.reduce((sum, item) => sum + item.estimate.subtotal, 0);
  const totalQuantity = enrichedItems.reduce((sum, item) => sum + item.quantity, 0);
  const deltaToEstimate = targetBudget - estimatedWholesale;

  const validateForm = () => {
    const nextErrors: string[] = [];

    if (!projectTitle.trim()) nextErrors.push('Project title is required.');
    if (!requiredDate) nextErrors.push('Required delivery date is required.');
    if (!shippingAddress.trim()) nextErrors.push('Delivery address is required.');
    enrichedItems.forEach((item, index) => {
      if (item.quantity < item.product.moq) {
        nextErrors.push(`Item ${index + 1} is below MOQ. ${item.product.sku} requires at least ${item.product.moq} units.`);
      }
      if (item.targetPrice <= 0) {
        nextErrors.push(`Item ${index + 1} needs a positive target unit price.`);
      }
    });

    setFormErrors(nextErrors);
    return nextErrors.length === 0;
  };

  const buildPayload = () => ({
    buyerId: currentBuyer.id,
    buyerName: currentBuyer.companyName,
    projectTitle,
    requiredDeliveryDate: requiredDate,
    shippingAddress,
    paymentTermsPreference,
    notes: specialInstructions,
    targetBudget,
    attachments: attachmentNames,
    items: enrichedItems.map<RFQItem>((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      sku: item.product.sku,
      moq: item.product.moq,
      quantity: item.quantity,
      targetPrice: item.targetPrice,
      unitPriceEstimate: item.estimate.unitPrice,
      totalEstimate: item.estimate.subtotal,
      unit: item.product.unit,
      notes: item.notes,
      requiredDeliveryDate: requiredDate,
      warehouseSummary: item.primaryWarehouse
        ? `${item.primaryWarehouse.available} available in ${item.primaryWarehouse.warehouseName}`
        : `${item.availableUnits} available across warehouses`,
      currentTierLabel: item.estimate.tier?.label
    }))
  });

  const addItem = () => {
    const product = products[items.length % products.length];
    const estimate = getBuyerPriceEstimate(product, product.moq, currentBuyer.buyerGroup);

    setItems((prev) => [
      ...prev,
      {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: product.moq,
        targetPrice: getDefaultTargetPrice(estimate.unitPrice),
        notes: ''
      }
    ]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, itemIndex) => itemIndex !== index)));
  };

  const updateItem = (index: number, field: keyof RFQFormItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        if (field === 'productId') {
          const product = products.find((candidate) => candidate.id === value) || products[0];
          const quantity = Math.max(item.quantity, product.moq);
          const estimate = getBuyerPriceEstimate(product, quantity, currentBuyer.buyerGroup);

          return {
            ...item,
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            quantity,
            targetPrice: getDefaultTargetPrice(estimate.unitPrice)
          };
        }

        return {
          ...item,
          [field]: value
        };
      })
    );
  };

  const handleSaveDraft = () => {
    if (!validateForm()) return;
    const draft = saveRFQDraft(buildPayload());
    navigate(`/buyer/rfqs/${draft.id}`);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;
    const submitted = submitRFQ(buildPayload());
    navigate(`/buyer/rfqs/${submitted.id}`);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Create RFQ"
        subtitle="Build a wholesale request with MOQ-aware quantities, target prices, and delivery requirements."
        breadcrumbs={[
          { label: 'Buyer Portal', href: '/buyer/dashboard' },
          { label: 'My RFQs', href: '/buyer/rfqs' },
          { label: 'Create RFQ' }
        ]}
        actions={
          <Link to="/buyer/rfqs">
            <Button variant="outline" size="sm" icon={ArrowLeft}>
              Back to RFQs
            </Button>
          </Link>
        }
      />

      {formErrors.length > 0 && (
        <Alert type="error" title="RFQ needs attention">
          <ul className="list-disc space-y-1 pl-4">
            {formErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card title="RFQ Overview">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Input
                  label="Procurement project"
                  required
                  value={projectTitle}
                  onChange={(event) => setProjectTitle(event.target.value)}
                  placeholder="e.g. Q4 server fleet refresh"
                />
              </div>
              <Input
                label="Required delivery date"
                type="date"
                required
                icon={Calendar}
                value={requiredDate}
                onChange={(event) => setRequiredDate(event.target.value)}
              />
              <Select
                label="Payment terms preference"
                value={paymentTermsPreference}
                onChange={(event) => setPaymentTermsPreference(event.target.value)}
                options={[
                  { label: currentBuyer.paymentTerms, value: currentBuyer.paymentTerms },
                  { label: 'Net 60 Days Credit', value: 'Net 60 Days Credit' },
                  { label: 'Advance Wire Transfer', value: 'Advance Wire Transfer' }
                ]}
              />
              <div className="md:col-span-2">
                <Textarea
                  label="Delivery address"
                  required
                  rows={2}
                  value={shippingAddress}
                  onChange={(event) => setShippingAddress(event.target.value)}
                />
              </div>
            </div>
          </Card>

          <Card
            title="Requested Products"
            subtitle="Quantity must meet each SKU MOQ before submission."
            action={
              <Button type="button" variant="outline" size="xs" icon={Plus} onClick={addItem}>
                Add Line
              </Button>
            }
          >
            <div className="space-y-4">
              {enrichedItems.map((item, index) => (
                <div key={`${item.productId}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Line {index + 1}
                      </div>
                      <div className="mt-1 font-mono text-xs font-bold text-blue-600">{item.sku}</div>
                    </div>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        icon={Trash2}
                        className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        onClick={() => removeItem(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
                    <div className="lg:col-span-6">
                      <Select
                        label="Catalog SKU"
                        value={item.productId}
                        onChange={(event) => updateItem(index, 'productId', event.target.value)}
                        options={productOptions}
                      />
                    </div>
                    <div className="lg:col-span-3">
                      <Input
                        label={`Quantity (MOQ ${item.product.moq})`}
                        type="number"
                        min={1}
                        value={item.quantity}
                        error={item.moqError ? `Minimum ${item.product.moq}` : undefined}
                        onChange={(event) =>
                          updateItem(index, 'quantity', parseInt(event.target.value, 10) || 1)
                        }
                      />
                    </div>
                    <div className="lg:col-span-3">
                      <Input
                        label="Target unit price"
                        type="number"
                        min={1}
                        step="0.01"
                        prefixText="$"
                        value={item.targetPrice}
                        helperText={`Current estimate ${formatCurrency(item.estimate.unitPrice)}`}
                        onChange={(event) =>
                          updateItem(index, 'targetPrice', parseFloat(event.target.value) || 0)
                        }
                      />
                    </div>
                    <div className="lg:col-span-12">
                      <Input
                        label="Line requirements"
                        value={item.notes}
                        onChange={(event) => updateItem(index, 'notes', event.target.value)}
                        placeholder="Factory sealed cartons, warranty term, asset labels, staging notes..."
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 text-xs md:grid-cols-3">
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <div className="font-semibold text-slate-500">Current tier</div>
                      <div className="mt-1 font-bold text-slate-900">
                        {item.estimate.tier?.label || 'Wholesale'}
                      </div>
                      <div className="text-slate-500">
                        {formatTierRange(item.estimate.tier, item.product.unit)}
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <div className="font-semibold text-slate-500">Warehouse signal</div>
                      <div className="mt-1 font-bold text-slate-900">
                        {item.availableUnits.toLocaleString()} available
                      </div>
                      <div className="truncate text-slate-500">
                        {item.primaryWarehouse?.warehouseName || item.product.warehouseLocation}
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <div className="font-semibold text-slate-500">Line target</div>
                      <div className="mt-1 font-mono text-base font-extrabold text-blue-700">
                        {formatCurrency(item.quantity * item.targetPrice)}
                      </div>
                      <div className="text-slate-500">
                        Estimate {formatCurrency(item.estimate.subtotal)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Instructions & Attachments">
            <div className="space-y-4">
              <Textarea
                label="Commercial notes"
                rows={4}
                value={specialInstructions}
                onChange={(event) => setSpecialInstructions(event.target.value)}
                placeholder="Batch delivery dates, inspection terms, packaging requirements, or target approval notes..."
              />
              <FileUpload
                label="Supporting files"
                multiple
                helperText="Attach BOMs, delivery windows, technical schedules, or approval forms."
                onFilesSelected={(files) => setAttachmentNames(files.map((file) => file.name))}
              />
            </div>
          </Card>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <Card title="RFQ Summary">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Buyer group</span>
                <span className="font-bold text-slate-900">{currentBuyer.buyerGroup}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Requested SKUs</span>
                <span className="font-bold text-slate-900">{items.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Total units</span>
                <span className="font-bold text-slate-900">{totalQuantity.toLocaleString()}</span>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-800">Target budget</div>
                <div className="mt-1 font-mono text-2xl font-extrabold text-blue-700">
                  {formatCurrency(targetBudget)}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">Wholesale estimate</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatCurrency(estimatedWholesale)}
                  </span>
                </div>
                <div
                  className={`mt-1 text-xs font-semibold ${
                    deltaToEstimate <= 0 ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {deltaToEstimate <= 0
                    ? `${formatCurrency(Math.abs(deltaToEstimate))} below estimate`
                    : `${formatCurrency(deltaToEstimate)} above estimate`}
                </div>
              </div>
            </div>
          </Card>

          <Alert type="info" title="MOQ and tier pricing">
            Quantities update buyer-group pricing and tier labels immediately. Lines below MOQ cannot
            be submitted.
          </Alert>

          <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
            <Button type="button" variant="outline" size="md" icon={Save} onClick={handleSaveDraft}>
              Save Draft
            </Button>
            <Button type="submit" variant="primary" size="md" icon={Send}>
              Submit RFQ
            </Button>
            <Link to="/buyer/rfqs" className="block">
              <Button type="button" variant="ghost" size="md" icon={FileText} className="w-full">
                Cancel
              </Button>
            </Link>
          </div>
        </aside>
      </form>
    </div>
  );
};
