import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Minus,
  Package,
  Plus,
  Tag
} from 'lucide-react';
import { Button, Card, PageHeader, StatusBadge, Alert } from '../../components/ui';
import {
  PriceTierTable,
  WarehouseAvailability,
  BuyerProductCard
} from '../../components/buyer';
import { useApp } from '../../context/AppContext';
import { mockBuyerWarehouseAvailability } from '../../data/mockData';
import { formatCurrency, getBuyerPriceEstimate } from '../../utils/pricing';

export const BuyerProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products, currentBuyer, showToast } = useApp();
  const product = products.find((item) => item.id === id);
  const activeProduct = product || products[0];
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(activeProduct.moq);
  const [draftAdded, setDraftAdded] = useState(false);
  const buyerGroup = currentBuyer.buyerGroup;

  useEffect(() => {
    setSelectedImage(0);
    setQuantity(activeProduct.moq);
    setDraftAdded(false);
  }, [activeProduct.id, activeProduct.moq]);

  const estimate = useMemo(
    () => getBuyerPriceEstimate(activeProduct, quantity, buyerGroup),
    [activeProduct, buyerGroup, quantity]
  );

  const availability = mockBuyerWarehouseAvailability[activeProduct.id] || [];
  const relatedProducts = products
    .filter((item) => item.category === activeProduct.category && item.id !== activeProduct.id)
    .slice(0, 3);

  const setSafeQuantity = (value: number) => {
    setQuantity(Math.max(0, Math.min(99999, Math.floor(Number.isFinite(value) ? value : activeProduct.moq))));
  };

  const stepQuantity = (direction: 1 | -1) => {
    const nextQuantity =
      direction === 1
        ? Math.max(activeProduct.moq, quantity + activeProduct.moq)
        : Math.max(0, quantity - activeProduct.moq);

    setSafeQuantity(nextQuantity);
  };

  const handleAddDraft = () => {
    if (estimate.isBelowMOQ) {
      showToast(`Minimum order quantity is ${activeProduct.moq} ${activeProduct.unit}`, 'warning');
      return;
    }

    setDraftAdded(true);
    showToast('Product added to frontend RFQ draft list', 'success');
  };

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 text-center border-slate-200">
          <div className="w-14 h-14 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Buyer product not found</h1>
          <p className="mt-2 text-sm text-slate-500">
            This SKU may have been removed from your buyer catalog or moved into a contract-only list.
          </p>
          <Link to="/buyer/products" className="mt-6 inline-block">
            <Button variant="primary" size="md" icon={ArrowLeft}>
              Back to Buyer Catalog
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={activeProduct.name}
        subtitle={`${activeProduct.brand} | ${activeProduct.sku} | ${activeProduct.category}`}
        breadcrumbs={[
          { label: 'Buyer Portal', href: '/buyer/dashboard' },
          { label: 'Products', href: '/buyer/products' },
          { label: activeProduct.sku }
        ]}
        actions={
          <Link to="/buyer/products">
            <Button variant="outline" size="sm" icon={ArrowLeft}>
              Back to Products
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-slate-200">
            <div className="relative mb-4 h-80 overflow-hidden rounded-xl bg-slate-100 sm:h-96">
              <img
                src={activeProduct.images[selectedImage] || activeProduct.images[0]}
                alt={activeProduct.name}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute left-3 top-3">
                <StatusBadge status={activeProduct.status} />
              </div>
              <div className="absolute right-3 top-3 rounded bg-slate-900/80 px-2.5 py-1 font-mono text-xs font-bold text-white">
                MOQ: {activeProduct.moq} {activeProduct.unit}
              </div>
            </div>

            {activeProduct.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {activeProduct.images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                      selectedImage === index ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200 opacity-70'
                    }`}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img src={image} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </Card>

          <Card title="Description & Specifications" className="border-slate-200">
            <p className="mb-6 text-sm leading-relaxed text-slate-700">{activeProduct.description}</p>
            <div className="overflow-hidden rounded-xl border border-slate-200 text-xs">
              {Object.entries(activeProduct.specifications).map(([key, value]) => (
                <div key={key} className="grid grid-cols-1 gap-1 border-b border-slate-100 px-4 py-3 last:border-b-0 sm:grid-cols-3">
                  <span className="font-bold text-slate-700">{key}</span>
                  <span className="text-slate-600 sm:col-span-2">{value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card title="Buyer Pricing & RFQ Estimate" className="border-blue-200 shadow-sm">
            <div className="space-y-5">
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  {buyerGroup} buyer unit price
                </div>
                <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
                  <div className="text-3xl font-extrabold text-slate-900">
                    {formatCurrency(estimate.unitPrice, activeProduct.currency)}
                    <span className="text-sm font-semibold text-slate-500">/unit</span>
                  </div>
                  <div className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 border border-blue-100">
                    {estimate.priceSource}
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Quantity
                    </label>
                    <div className="text-xs text-slate-500">
                      MOQ {activeProduct.moq} {activeProduct.unit}
                    </div>
                  </div>
                  {estimate.isBelowMOQ && (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                      Below MOQ
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => stepQuantity(-1)}
                    className="h-10 w-10 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 flex items-center justify-center"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min={0}
                    value={quantity}
                    onChange={(event) => setSafeQuantity(Number(event.target.value))}
                    className="h-10 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-center text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Quantity"
                  />
                  <button
                    type="button"
                    onClick={() => stepQuantity(1)}
                    className="h-10 w-10 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 flex items-center justify-center"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <span className="block text-slate-500">Estimated Unit Price</span>
                    <strong className="text-slate-900">{formatCurrency(estimate.unitPrice, activeProduct.currency)}</strong>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <span className="block text-slate-500">Estimated Subtotal</span>
                    <strong className="text-blue-700">{formatCurrency(estimate.subtotal, activeProduct.currency)}</strong>
                  </div>
                </div>
              </div>

              <PriceTierTable
                product={activeProduct}
                buyerGroup={buyerGroup}
                quantity={quantity}
                onSelectQuantity={setSafeQuantity}
              />

              {estimate.isBelowMOQ && (
                <Alert type="warning" title="MOQ required">
                  Increase quantity to at least {activeProduct.moq} {activeProduct.unit} before requesting a quote.
                </Alert>
              )}

              {draftAdded && (
                <Alert type="success" title="Added to RFQ draft">
                  This item is staged locally with the selected quantity and buyer price estimate.
                </Alert>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  variant={estimate.isBelowMOQ ? 'secondary' : 'outline'}
                  size="sm"
                  icon={CheckCircle2}
                  onClick={handleAddDraft}
                  className="w-full"
                >
                  Add to RFQ Draft
                </Button>
                <Link to="/buyer/rfqs" className="block">
                  <Button variant="primary" size="sm" icon={Tag} className="w-full">
                    Request Quote
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          <WarehouseAvailability availability={availability} unit={activeProduct.unit} />
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Related Products</h2>
            <p className="text-xs text-slate-500">Additional SKUs in {activeProduct.category} with buyer-group pricing.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <BuyerProductCard
                key={relatedProduct.id}
                product={relatedProduct}
                buyerGroup={buyerGroup}
                availability={mockBuyerWarehouseAvailability[relatedProduct.id] || []}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
