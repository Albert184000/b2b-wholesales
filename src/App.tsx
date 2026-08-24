import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppErrorBoundary } from './components/common/AppErrorBoundary';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { BuyerLayout } from './layouts/BuyerLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { ProductCatalogPage } from './pages/public/ProductCatalogPage';
import { ProductDetailPage } from './pages/public/ProductDetailPage';
import { CategoriesPage } from './pages/public/CategoriesPage';
import { CategoryDetailPage } from './pages/public/CategoryDetailPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { RegistrationSubmittedPage } from './pages/public/RegistrationSubmittedPage';
import { PendingApprovalPage } from './pages/public/PendingApprovalPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { NotFoundPage } from './pages/public/NotFoundPage';
import { PrivacyPolicyPage } from './pages/public/PrivacyPolicyPage';
import { TermsPage } from './pages/public/TermsPage';

// Buyer Pages
import { BuyerDashboardPage } from './pages/buyer/BuyerDashboardPage';
import { BuyerProductCatalogPage } from './pages/buyer/BuyerProductCatalogPage';
import { BuyerProductDetailPage } from './pages/buyer/BuyerProductDetailPage';
import { BuyerRFQsPage } from './pages/buyer/BuyerRFQsPage';
import { BuyerCreateRFQPage } from './pages/buyer/BuyerCreateRFQPage';
import { BuyerRFQDetailPage } from './pages/buyer/BuyerRFQDetailPage';
import { BuyerQuotesPage } from './pages/buyer/BuyerQuotesPage';
import { BuyerQuoteDetailPage } from './pages/buyer/BuyerQuoteDetailPage';
import { BuyerPurchaseOrdersPage } from './pages/buyer/BuyerPurchaseOrdersPage';
import { BuyerCreatePOPage } from './pages/buyer/BuyerCreatePOPage';
import { BuyerPODetailPage } from './pages/buyer/BuyerPODetailPage';
import { BuyerContractsPage } from './pages/buyer/BuyerContractsPage';
import { BuyerContractDetailPage } from './pages/buyer/BuyerContractDetailPage';
import { BuyerInvoicesPage } from './pages/buyer/BuyerInvoicesPage';
import { BuyerInvoiceDetailPage } from './pages/buyer/BuyerInvoiceDetailPage';
import { BuyerShipmentsPage } from './pages/buyer/BuyerShipmentsPage';
import { BuyerShipmentDetailPage } from './pages/buyer/BuyerShipmentDetailPage';
import { BuyerProfilePage } from './pages/buyer/BuyerProfilePage';
import { BuyerDocumentsPage } from './pages/buyer/BuyerDocumentsPage';
import { BuyerNotificationsPage } from './pages/buyer/BuyerNotificationsPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminBuyersPage } from './pages/admin/AdminBuyersPage';
import { AdminBuyerDetailPage } from './pages/admin/AdminBuyerDetailPage';
import { AdminApprovalsPage } from './pages/admin/AdminApprovalsPage';
import { AdminApprovalDetailPage } from './pages/admin/AdminApprovalDetailPage';
import { AdminBuyerGroupsPage } from './pages/admin/AdminBuyerGroupsPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminProductDetailPage } from './pages/admin/AdminProductDetailPage';
import { AdminProductFormPage } from './pages/admin/AdminProductFormPage';
import { AdminRFQsPage } from './pages/admin/AdminRFQsPage';
import { AdminRFQDetailPage } from './pages/admin/AdminRFQDetailPage';
import { AdminQuotesPage } from './pages/admin/AdminQuotesPage';
import { AdminQuoteDetailPage } from './pages/admin/AdminQuoteDetailPage';
import { AdminPurchaseOrdersPage } from './pages/admin/AdminPurchaseOrdersPage';
import { AdminPurchaseOrderDetailPage } from './pages/admin/AdminPurchaseOrderDetailPage';
import { AdminContractsPage } from './pages/admin/AdminContractsPage';
import { AdminContractDetailPage } from './pages/admin/AdminContractDetailPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminWarehousesPage } from './pages/admin/AdminWarehousesPage';
import { AdminWarehouseDetailPage } from './pages/admin/AdminWarehouseDetailPage';
import { AdminInvoicesPage } from './pages/admin/AdminInvoicesPage';
import { AdminInvoiceDetailPage } from './pages/admin/AdminInvoiceDetailPage';
import { AdminCreditPage } from './pages/admin/AdminCreditPage';
import { AdminShipmentsPage } from './pages/admin/AdminShipmentsPage';
import { AdminShipmentDetailPage } from './pages/admin/AdminShipmentDetailPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminRolesPage } from './pages/admin/AdminRolesPage';
import { AdminPermissionsPage } from './pages/admin/AdminPermissionsPage';
import { AdminActivityLogsPage } from './pages/admin/AdminActivityLogsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppErrorBoundary>
          <Routes>
            {/* Public Storefront & Discovery Routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="products" element={<ProductCatalogPage />} />
              <Route path="products/:id" element={<ProductDetailPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="categories/:slug" element={<CategoryDetailPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="registration-submitted" element={<RegistrationSubmittedPage />} />
              <Route path="account-pending" element={<PendingApprovalPage />} />
              <Route path="pending-approval" element={<PendingApprovalPage />} />
              <Route path="how-it-works" element={<HowItWorksPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="privacy" element={<PrivacyPolicyPage />} />
              <Route path="terms" element={<TermsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Authenticated Corporate Buyer Portal Routes */}
            <Route path="/buyer" element={<BuyerLayout />}>
              <Route index element={<Navigate to="/buyer/dashboard" replace />} />
              <Route path="dashboard" element={<BuyerDashboardPage />} />
              <Route path="products" element={<BuyerProductCatalogPage />} />
              <Route path="products/:id" element={<BuyerProductDetailPage />} />
              <Route path="rfqs" element={<BuyerRFQsPage />} />
              <Route path="rfqs/new" element={<BuyerCreateRFQPage />} />
              <Route path="rfqs/:id" element={<BuyerRFQDetailPage />} />
              <Route path="quotes" element={<BuyerQuotesPage />} />
              <Route path="quotes/:id" element={<BuyerQuoteDetailPage />} />
              <Route path="purchase-orders" element={<BuyerPurchaseOrdersPage />} />
              <Route path="purchase-orders/new" element={<BuyerCreatePOPage />} />
              <Route path="purchase-orders/:id" element={<BuyerPODetailPage />} />
              <Route path="contracts" element={<BuyerContractsPage />} />
              <Route path="contracts/:id" element={<BuyerContractDetailPage />} />
              <Route path="invoices" element={<BuyerInvoicesPage />} />
              <Route path="invoices/:id" element={<BuyerInvoiceDetailPage />} />
              <Route path="shipments" element={<BuyerShipmentsPage />} />
              <Route path="shipments/:id" element={<BuyerShipmentDetailPage />} />
              <Route path="profile" element={<BuyerProfilePage />} />
              <Route path="documents" element={<BuyerDocumentsPage />} />
              <Route path="notifications" element={<BuyerNotificationsPage />} />
            </Route>

            {/* Authenticated Enterprise Admin & ERP Operations Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="buyers" element={<AdminBuyersPage />} />
              <Route path="buyers/:id" element={<AdminBuyerDetailPage />} />
              <Route path="approvals" element={<AdminApprovalsPage />} />
              <Route path="approvals/:id" element={<AdminApprovalDetailPage />} />
              <Route path="buyer-groups" element={<AdminBuyerGroupsPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="categories" element={<Navigate to="/admin/products?tab=categories" replace />} />
              <Route path="pricing" element={<Navigate to="/admin/products?tab=pricing" replace />} />
              <Route path="products/new" element={<AdminProductFormPage />} />
              <Route path="products/:id" element={<AdminProductDetailPage />} />
              <Route path="products/:id/edit" element={<AdminProductFormPage />} />
              <Route path="rfqs" element={<AdminRFQsPage />} />
              <Route path="rfqs/:id" element={<AdminRFQDetailPage />} />
              <Route path="quotes" element={<AdminQuotesPage />} />
              <Route path="quotes/:id" element={<AdminQuoteDetailPage />} />
              <Route path="purchase-orders" element={<AdminPurchaseOrdersPage />} />
              <Route path="purchase-orders/:id" element={<AdminPurchaseOrderDetailPage />} />
              <Route path="contracts" element={<AdminContractsPage />} />
              <Route path="contracts/:id" element={<AdminContractDetailPage />} />
              <Route path="inventory" element={<AdminInventoryPage />} />
              <Route path="warehouses" element={<AdminWarehousesPage />} />
              <Route path="warehouses/:id" element={<AdminWarehouseDetailPage />} />
              <Route path="invoices" element={<AdminInvoicesPage />} />
              <Route path="payments" element={<Navigate to="/admin/invoices?tab=payments" replace />} />
              <Route path="credit-notes" element={<Navigate to="/admin/invoices?tab=credit-notes" replace />} />
              <Route path="invoices/:id" element={<AdminInvoiceDetailPage />} />
              <Route path="credit" element={<AdminCreditPage />} />
              <Route path="shipments" element={<AdminShipmentsPage />} />
              <Route path="shipments/:id" element={<AdminShipmentDetailPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="roles" element={<AdminRolesPage />} />
              <Route path="permissions" element={<AdminPermissionsPage />} />
              <Route path="activity-logs" element={<AdminActivityLogsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            {/* Catch-all Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AppErrorBoundary>
      </BrowserRouter>
    </AppProvider>
  );
}
