import {
  Product,
  ProductCategory,
  BuyerCompany,
  RFQ,
  Quote,
  PurchaseOrder,
  Contract,
  Invoice,
  CreditActivity,
  Shipment,
  BuyerApplication,
  BuyerGroupConfig,
  AdminNotification,
  Warehouse,
  InventoryItem,
  UserAccount,
  ActivityLog,
  NotificationItem
} from '../types';

export const mockCategories: ProductCategory[] = [
  {
    id: 'cat-comp',
    name: 'Enterprise IT & Monitors',
    slug: 'enterprise-it-monitors',
    iconName: 'Monitor',
    itemCount: 42,
    description: 'Workstations, commercial monitors, docking stations, and peripherals for enterprise deployment.'
  },
  {
    id: 'cat-server',
    name: 'Servers & Networking',
    slug: 'servers-networking',
    iconName: 'Server',
    itemCount: 28,
    description: 'Rackmount servers, managed switches, enterprise access points, and structured cabling.'
  },
  {
    id: 'cat-office',
    name: 'Commercial Office Equipment',
    slug: 'commercial-office-equipment',
    iconName: 'Printer',
    itemCount: 35,
    description: 'Heavy-duty multi-function printers, thermal barcode scanners, and office automation.'
  },
  {
    id: 'cat-ind',
    name: 'Industrial Power & UPS',
    slug: 'industrial-power-ups',
    iconName: 'Zap',
    itemCount: 19,
    description: 'Rack UPS systems, high-efficiency power distribution units, and backup battery modules.'
  },
  {
    id: 'cat-sec',
    name: 'Security & Surveillance',
    slug: 'security-surveillance',
    iconName: 'ShieldCheck',
    itemCount: 24,
    description: 'IP security cameras, NVR storage units, PoE injectors, and biometrics access controls.'
  },
  {
    id: 'cat-comp-parts',
    name: 'Bulk Components & Storage',
    slug: 'bulk-components-storage',
    iconName: 'Cpu',
    itemCount: 56,
    description: 'Enterprise NVMe SSDs, ECC Server DDR5 memory, and high-density NAS hard drives.'
  }
];

export const mockProducts: Product[] = [
  {
    id: 'prod-001',
    sku: 'MON-001',
    name: 'Dell UltraSharp 24" Commercial IPS Display (U2424H)',
    category: 'Enterprise IT & Monitors',
    brand: 'Dell Technologies',
    description: 'Designed for corporate fleets. Features 120Hz refresh rate, USB-C connectivity with 90W power delivery, daisy chain support, and factory color calibration Delta E < 2.',
    specifications: {
      'Panel Size': '23.8 inches IPS',
      'Resolution': '1920 x 1080 at 120Hz',
      'Color Gamut': '100% sRGB, 85% DCI-P3',
      'Ports': '1x DP 1.4, 1x HDMI 1.4, 1x USB-C (90W PD), 4x USB 3.2 Gen 2',
      'Warranty': '3-Year Advanced Exchange Service',
      'VESA Mount': '100 x 100 mm'
    },
    moq: 20,
    unit: 'Units',
    currency: 'USD',
    costPrice: 82,
    basePrice: 135,
    tierPricing: [
      { minQty: 20, maxQty: 49, unitPrice: 120, label: 'Standard Wholesale' },
      { minQty: 50, maxQty: 99, unitPrice: 110, label: 'Tier 2 Bulk' },
      { minQty: 100, maxQty: 499, unitPrice: 99, label: 'High-Volume Enterprise' },
      { minQty: 500, maxQty: null, unitPrice: 90, label: 'Mega Contract' }
    ],
    buyerGroupPricing: [
      { groupId: 'bg-corp', groupName: 'Corporate', discountPercentage: 5 },
      { groupId: 'bg-vip', groupName: 'VIP', discountPercentage: 8 },
      { groupId: 'bg-dist', groupName: 'Distributor', discountPercentage: 12 }
    ],
    inStock: 1240,
    reservedStock: 320,
    availableStock: 920,
    reorderPoint: 200,
    warehouseLocation: 'Phnom Penh Main Hub (Rack A-12)',
    status: 'Active',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80'
    ],
    featured: true
  },
  {
    id: 'prod-002',
    sku: 'SRV-R750',
    name: 'Dell PowerEdge R750 2U Rackmount Server',
    category: 'Servers & Networking',
    brand: 'Dell Technologies',
    description: 'Dual 3rd Gen Intel Xeon Scalable processors, 16x DDR4 DIMM slots, hot-plug redundant power supplies, iDRAC9 Enterprise remote management.',
    specifications: {
      'Form Factor': '2U Rackmount',
      'Processor': '2x Intel Xeon Silver 4314 (16C/32T, 2.4GHz)',
      'Memory': '64GB (2x 32GB) DDR4-3200 RDIMM ECC',
      'Storage Bays': '8x 2.5" Hot-Plug SAS/SATA/NVMe',
      'Power Supply': 'Dual 800W Platinum Hot-Plug Redundant',
      'Management': 'iDRAC9 Enterprise with OpenManage'
    },
    moq: 2,
    unit: 'Units',
    currency: 'USD',
    costPrice: 2450,
    basePrice: 3890,
    tierPricing: [
      { minQty: 2, maxQty: 5, unitPrice: 3450, label: 'Wholesale Base' },
      { minQty: 6, maxQty: 15, unitPrice: 3200, label: 'Fleet Upgrade' },
      { minQty: 16, maxQty: null, unitPrice: 2980, label: 'Data Center Bulk' }
    ],
    inStock: 48,
    reservedStock: 12,
    availableStock: 36,
    reorderPoint: 10,
    warehouseLocation: 'Siem Reap Logistics Depot (Rack S-04)',
    status: 'Active',
    images: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80'
    ],
    featured: true
  },
  {
    id: 'prod-003',
    sku: 'NET-SW48P',
    name: 'Cisco Catalyst 1000 Series 48-Port PoE+ Managed Switch',
    category: 'Servers & Networking',
    brand: 'Cisco Systems',
    description: '48x Gigabit PoE+ Ethernet ports (370W PoE budget), 4x 10G SFP+ uplinks, Layer 2 enterprise security with 802.1X and storm control.',
    specifications: {
      'Port Count': '48x 10/100/1000 RJ45 + 4x 10G SFP+',
      'PoE Power Budget': '370W PoE+ (802.3at/af)',
      'Forwarding Bandwidth': '104 Gbps',
      'Switching Capacity': '176 Gbps',
      'Operating Temp': '-5°C to 50°C'
    },
    moq: 5,
    unit: 'Units',
    currency: 'USD',
    costPrice: 620,
    basePrice: 980,
    tierPricing: [
      { minQty: 5, maxQty: 19, unitPrice: 890, label: 'Standard Wholesale' },
      { minQty: 20, maxQty: 49, unitPrice: 820, label: 'Project Tier' },
      { minQty: 50, maxQty: null, unitPrice: 760, label: 'Distributor Tier' }
    ],
    inStock: 180,
    reservedStock: 45,
    availableStock: 135,
    reorderPoint: 30,
    warehouseLocation: 'Phnom Penh Main Hub (Rack N-08)',
    status: 'Active',
    images: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80'
    ],
    featured: true
  },
  {
    id: 'prod-004',
    sku: 'PRN-MFP800',
    name: 'HP LaserJet Enterprise Flow MFP M635z Heavy-Duty Monochrome',
    category: 'Commercial Office Equipment',
    brand: 'HP Enterprise',
    description: 'High-speed heavy office printing up to 65 ppm, 150-sheet dual-head single-pass duplex ADF scanner, embedded HP Sure Start hardware security.',
    specifications: {
      'Print Speed': 'Up to 65 ppm black',
      'Duty Cycle': 'Up to 300,000 pages monthly',
      'Paper Input': 'Up to 3,750 sheets with optional feeders',
      'Connectivity': 'Gigabit Ethernet, 2x Hi-Speed USB 2.0 Host',
      'Display': '8.0-inch color touchscreen SVGA'
    },
    moq: 4,
    unit: 'Units',
    currency: 'USD',
    costPrice: 1420,
    basePrice: 2250,
    tierPricing: [
      { minQty: 4, maxQty: 9, unitPrice: 1980, label: 'Corporate Tier' },
      { minQty: 10, maxQty: 29, unitPrice: 1850, label: 'Bulk Office' },
      { minQty: 30, maxQty: null, unitPrice: 1720, label: 'Government/Enterprise' }
    ],
    inStock: 35,
    reservedStock: 8,
    availableStock: 27,
    reorderPoint: 8,
    warehouseLocation: 'Battambang Regional Depot (Bay C-01)',
    status: 'Active',
    images: [
      'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'prod-005',
    sku: 'UPS-3000RT',
    name: 'APC Smart-UPS On-Line 3000VA 2U Rack/Tower 230V',
    category: 'Industrial Power & UPS',
    brand: 'Schneider Electric / APC',
    description: 'Double-conversion on-line topology provides zero transfer time for critical IT infrastructure. Includes Network Management Card 3 (AP9641).',
    specifications: {
      'Output Capacity': '2700 Watts / 3000 VA',
      'Nominal Output Voltage': '230V Pure Sine Wave',
      'Topology': 'Double Conversion Online',
      'Output Connections': '(6) IEC 320 C13, (2) IEC 320 C19',
      'Battery Type': 'Lead-Acid Maintenance-Free Leakproof'
    },
    moq: 3,
    unit: 'Units',
    currency: 'USD',
    costPrice: 1100,
    basePrice: 1750,
    tierPricing: [
      { minQty: 3, maxQty: 9, unitPrice: 1540, label: 'Batch Tier' },
      { minQty: 10, maxQty: 24, unitPrice: 1420, label: 'Rack Build Tier' },
      { minQty: 25, maxQty: null, unitPrice: 1310, label: 'Infrastructure Tier' }
    ],
    inStock: 64,
    reservedStock: 16,
    availableStock: 48,
    reorderPoint: 15,
    warehouseLocation: 'Phnom Penh Main Hub (Rack P-02)',
    status: 'Active',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'prod-006',
    sku: 'SSD-NVME4TB',
    name: 'Samsung PM9A3 3.84TB U.2 PCIe 4.0 NVMe Enterprise SSD',
    category: 'Bulk Components & Storage',
    brand: 'Samsung Semiconductor',
    description: 'Enterprise grade read-intensive NVMe with end-to-end data protection, power loss protection (PLP), and sustained sequential reads up to 6,900 MB/s.',
    specifications: {
      'Capacity': '3.84 TB',
      'Interface': 'PCIe Gen 4 x4, NVMe 1.4',
      'Form Factor': '2.5 inch U.2 (15mm)',
      'Sequential Read/Write': '6,900 / 4,100 MB/s',
      'Endurance': '1.0 DWPD (Drive Writes Per Day)',
      'MTBF': '2,000,000 hours'
    },
    moq: 10,
    unit: 'Units',
    currency: 'USD',
    costPrice: 210,
    basePrice: 340,
    tierPricing: [
      { minQty: 10, maxQty: 49, unitPrice: 295, label: 'Wholesale Tray' },
      { minQty: 50, maxQty: 199, unitPrice: 270, label: 'Master Carton' },
      { minQty: 200, maxQty: null, unitPrice: 245, label: 'Pallet Wholesale' }
    ],
    inStock: 620,
    reservedStock: 140,
    availableStock: 480,
    reorderPoint: 100,
    warehouseLocation: 'Phnom Penh Main Hub (Vault B-05)',
    status: 'Active',
    images: [
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80'
    ],
    featured: true
  },
  {
    id: 'prod-007',
    sku: 'SEC-NVR32POE',
    name: 'Hikvision 32-Channel 4K PoE NVR Surveillance Bundle',
    category: 'Security & Surveillance',
    brand: 'Hikvision Enterprise',
    description: 'Commercial surveillance package with 32-channel 4K network video recorder, integrated PoE switching, RAID-ready storage bays, and remote enterprise monitoring support.',
    specifications: {
      'Channels': '32 IP camera channels',
      'Recording Resolution': 'Up to 12 MP / 4K per channel',
      'PoE Budget': '320W integrated PoE switching',
      'Storage Bays': '4x SATA bays, up to 16TB each',
      'Video Output': 'HDMI 4K + VGA',
      'Security': 'Role-based remote access and encrypted stream support'
    },
    moq: 6,
    unit: 'Sets',
    currency: 'USD',
    costPrice: 720,
    basePrice: 1180,
    tierPricing: [
      { minQty: 6, maxQty: 14, unitPrice: 1040, label: 'Project Wholesale' },
      { minQty: 15, maxQty: 39, unitPrice: 965, label: 'Campus Deployment' },
      { minQty: 40, maxQty: null, unitPrice: 895, label: 'Integrator Contract' }
    ],
    buyerGroupPricing: [
      { groupId: 'bg-corp', groupName: 'Corporate', discountPercentage: 4 },
      { groupId: 'bg-vip', groupName: 'VIP', discountPercentage: 7 },
      { groupId: 'bg-dist', groupName: 'Distributor', discountPercentage: 10 }
    ],
    inStock: 96,
    reservedStock: 18,
    availableStock: 78,
    reorderPoint: 18,
    warehouseLocation: 'Phnom Penh Main Hub (Security Cage S-11)',
    status: 'Active',
    images: [
      'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80'
    ],
    featured: true
  }
];

export const mockBuyers: BuyerCompany[] = [
  {
    id: 'buyer-001',
    companyName: 'ABC Technology Ltd.',
    businessType: 'System Integrator & IT Reseller',
    taxId: 'KHM-TAX-98234102',
    registrationNumber: 'REG-KH-2021-08991',
    contactPerson: 'Sovannarith Keo',
    businessEmail: 'keo.sovannarith@abctech.com.kh',
    phone: '+855 (0) 23 889 112',
    website: 'https://abctech.com.kh',
    industry: 'Enterprise IT Hardware & Managed Services',
    country: 'Cambodia',
    city: 'Phnom Penh',
    address: 'Building 45, St. 289, Boeung Kak 1, Toul Kork',
    postalCode: '12151',
    buyerGroup: 'Corporate',
    status: 'Approved',
    creditLimit: 50000,
    usedCredit: 32000,
    availableCredit: 18000,
    creditReviewDate: '2026-12-15',
    accountStanding: 'Good Standing',
    paymentTerms: 'Net 30 Days Credit',
    assignedRep: {
      id: 'usr-rep-01',
      name: 'David Chen',
      email: 'david.chen@wholesalehub.com',
      title: 'Senior Enterprise Account Executive'
    },
    joinedDate: '2023-03-15',
    totalPurchases: 284500,
    documents: [
      { name: 'Certificate_of_Incorporation_2023.pdf', type: 'PDF', size: '2.4 MB', uploadedDate: '2023-03-15', verified: true },
      { name: 'VAT_Patent_Tax_Certificate_2024.pdf', type: 'PDF', size: '1.8 MB', uploadedDate: '2024-01-10', verified: true },
      { name: 'Audited_Financial_Statement_2023.pdf', type: 'PDF', size: '5.1 MB', uploadedDate: '2024-02-20', verified: true }
    ],
    addresses: [
      {
        id: 'addr-abc-registered',
        type: 'Registered',
        label: 'Registered Office',
        contactName: 'Sovannarith Keo',
        phone: '+855 (0) 23 889 112',
        street: 'Building 45, St. 289, Boeung Kak 1, Toul Kork',
        city: 'Phnom Penh',
        province: 'Phnom Penh',
        country: 'Cambodia',
        postalCode: '12151',
        isDefault: true
      },
      {
        id: 'addr-abc-billing',
        type: 'Billing',
        label: 'Finance Department',
        contactName: 'Chanthou Lim',
        phone: '+855 (0) 23 889 118',
        street: 'Floor 3, Building 45, St. 289, Boeung Kak 1, Toul Kork',
        city: 'Phnom Penh',
        province: 'Phnom Penh',
        country: 'Cambodia',
        postalCode: '12151',
        isDefault: true
      },
      {
        id: 'addr-abc-shipping',
        type: 'Shipping',
        label: 'ABC Technology Logistics Warehouse',
        contactName: 'Dalin Phan',
        phone: '+855 (0) 12 440 221',
        street: 'St. 289 Receiving Gate B, Toul Kork',
        city: 'Phnom Penh',
        province: 'Phnom Penh',
        country: 'Cambodia',
        postalCode: '12151',
        isDefault: true
      }
    ],
    businessDocuments: [
      {
        id: 'bdoc-abc-license',
        document: 'Business License',
        documentNumber: 'BL-KH-2026-77341',
        uploadedDate: '2026-01-08',
        expiry: '2027-01-08',
        verificationStatus: 'Verified',
        fileName: 'ABC_Business_License_2026.pdf',
        fileSize: '2.6 MB'
      },
      {
        id: 'bdoc-abc-tax',
        document: 'Tax Registration',
        documentNumber: 'KHM-TAX-98234102',
        uploadedDate: '2026-01-08',
        expiry: '2027-03-31',
        verificationStatus: 'Verified',
        fileName: 'ABC_Tax_Registration_2026.pdf',
        fileSize: '1.8 MB'
      },
      {
        id: 'bdoc-abc-company',
        document: 'Company Registration',
        documentNumber: 'REG-KH-2021-08991',
        uploadedDate: '2023-03-15',
        expiry: 'Permanent',
        verificationStatus: 'Verified',
        fileName: 'Certificate_of_Incorporation_2023.pdf',
        fileSize: '2.4 MB'
      },
      {
        id: 'bdoc-abc-finance',
        document: 'Audited Financial Statement',
        documentNumber: 'AFS-ABC-2025',
        uploadedDate: '2026-04-12',
        expiry: '2027-04-12',
        verificationStatus: 'Pending',
        fileName: 'ABC_Audited_Financials_2025.pdf',
        fileSize: '5.8 MB'
      }
    ],
    accountTeam: [
      {
        id: 'team-sophea',
        name: 'Sophea Chan',
        role: 'Account Executive',
        email: 'sophea.chan@wholesalehub.com',
        phone: '+855 (0) 12 778 451'
      },
      {
        id: 'team-dara',
        name: 'Dara Sok',
        role: 'Sales Manager',
        email: 'dara.sok@wholesalehub.com',
        phone: '+855 (0) 10 221 902'
      },
      {
        id: 'team-finance',
        name: 'Finance Support',
        role: 'Accounts Receivable',
        email: 'finance@wholesalehub.com',
        phone: '+855 (0) 23 882 100'
      },
      {
        id: 'team-logistics',
        name: 'Logistics Coordinator',
        role: 'Freight & Delivery',
        email: 'logistics@wholesalehub.com',
        phone: '+855 (0) 23 882 188'
      }
    ]
  },
  {
    id: 'buyer-002',
    companyName: 'Mekong Data Systems Co.',
    businessType: 'Telecom Infrastructure Provider',
    taxId: 'KHM-TAX-45129844',
    registrationNumber: 'REG-KH-2022-04123',
    contactPerson: 'Sreymom Vicheth',
    businessEmail: 'sreymom@mekongdata.io',
    phone: '+855 (0) 12 555 789',
    country: 'Cambodia',
    city: 'Phnom Penh',
    address: 'Floor 12, Canadia Tower, Monivong Blvd',
    postalCode: '12202',
    buyerGroup: 'VIP',
    status: 'Approved',
    creditLimit: 150000,
    usedCredit: 82000,
    availableCredit: 68000,
    paymentTerms: 'Net 45 Days Credit',
    assignedRep: {
      id: 'usr-rep-02',
      name: 'Sarah Jenkins',
      email: 'sarah.j@wholesalehub.com',
      title: 'Principal Sales Director'
    },
    joinedDate: '2022-11-01',
    totalPurchases: 620000,
    documents: [
      { name: 'Telecom_Operator_Permit.pdf', type: 'PDF', size: '3.1 MB', uploadedDate: '2022-11-01', verified: true },
      { name: 'Tax_Compliance_Clearance_2024.pdf', type: 'PDF', size: '1.2 MB', uploadedDate: '2024-01-15', verified: true }
    ]
  },
  {
    id: 'buyer-003',
    companyName: 'Angkor Cloud Solutions Inc.',
    businessType: 'Data Center Operator & MSP',
    taxId: 'KHM-TAX-77218390',
    registrationNumber: 'REG-KH-2024-11029',
    contactPerson: 'Borey Meng',
    businessEmail: 'procurement@angkorcloud.com',
    phone: '+855 (0) 63 963 888',
    country: 'Cambodia',
    city: 'Siem Reap',
    address: 'Highway 6, Svay Dangkum',
    postalCode: '17252',
    buyerGroup: 'Standard',
    status: 'Pending',
    creditLimit: 30000,
    usedCredit: 0,
    availableCredit: 30000,
    paymentTerms: 'Pro-Forma Advance Payment',
    assignedRep: {
      id: 'usr-rep-01',
      name: 'David Chen',
      email: 'david.chen@wholesalehub.com',
      title: 'Senior Enterprise Account Executive'
    },
    joinedDate: '2026-08-10',
    totalPurchases: 0,
    documents: [
      { name: 'Business_License_AngkorCloud.pdf', type: 'PDF', size: '4.2 MB', uploadedDate: '2026-08-10', verified: false },
      { name: 'Bank_Reference_Letter.pdf', type: 'PDF', size: '1.5 MB', uploadedDate: '2026-08-10', verified: false }
    ]
  },
  {
    id: 'buyer-004',
    companyName: 'CityMed Procurement Group',
    businessType: 'Healthcare Equipment Distributor',
    taxId: 'KHM-TAX-66120884',
    registrationNumber: 'REG-KH-2020-07119',
    contactPerson: 'Malis Dara',
    businessEmail: 'procurement@citymed.kh',
    phone: '+855 (0) 23 771 448',
    website: 'https://citymed.kh',
    industry: 'Healthcare Procurement',
    country: 'Cambodia',
    city: 'Phnom Penh',
    address: 'No. 18, St. 516, Boeung Kak 2, Toul Kork',
    postalCode: '12152',
    buyerGroup: 'Corporate',
    status: 'Approved',
    creditLimit: 85000,
    usedCredit: 21400,
    availableCredit: 63600,
    creditReviewDate: '2026-11-30',
    accountStanding: 'Good Standing',
    paymentTerms: 'Net 30 Days Credit',
    assignedRep: {
      id: 'usr-rep-01',
      name: 'David Chen',
      email: 'david.chen@wholesalehub.com',
      title: 'Senior Enterprise Account Executive'
    },
    joinedDate: '2024-05-08',
    totalPurchases: 187600,
    documents: [
      { name: 'CityMed_Business_License.pdf', type: 'PDF', size: '1.9 MB', uploadedDate: '2024-05-08', verified: true },
      { name: 'CityMed_Tax_Registration.pdf', type: 'PDF', size: '1.1 MB', uploadedDate: '2026-01-12', verified: true }
    ]
  },
  {
    id: 'buyer-005',
    companyName: 'TonleSap Retail Holdings',
    businessType: 'Regional Retail Chain',
    taxId: 'KHM-TAX-55201983',
    registrationNumber: 'REG-KH-2019-03451',
    contactPerson: 'Rotha Nhem',
    businessEmail: 'ops@tonlesapretail.com',
    phone: '+855 (0) 63 555 210',
    website: 'https://tonlesapretail.com',
    industry: 'Retail Operations',
    country: 'Cambodia',
    city: 'Battambang',
    address: 'National Road 5, Kamrieng Logistics Park',
    postalCode: '02360',
    buyerGroup: 'Distributor',
    status: 'Suspended',
    creditLimit: 60000,
    usedCredit: 47500,
    availableCredit: 12500,
    creditReviewDate: '2026-09-15',
    accountStanding: 'Credit Hold',
    paymentTerms: 'Net 30 Days Credit',
    assignedRep: {
      id: 'usr-rep-02',
      name: 'Sarah Jenkins',
      email: 'sarah.j@wholesalehub.com',
      title: 'Principal Sales Director'
    },
    joinedDate: '2021-09-19',
    totalPurchases: 402900,
    documents: [
      { name: 'TonleSap_Retail_License.pdf', type: 'PDF', size: '2.2 MB', uploadedDate: '2021-09-19', verified: true },
      { name: 'Tax_Clearance_2025.pdf', type: 'PDF', size: '1.2 MB', uploadedDate: '2025-01-18', verified: false, status: 'Expired' }
    ]
  }
];

export const mockRFQs: RFQ[] = [
  {
    id: 'rfq-2026-089',
    rfqNumber: 'RFQ-2026-089',
    buyerId: 'buyer-001',
    buyerName: 'Sovannarith Keo',
    companyName: 'ABC Technology Ltd.',
    projectTitle: 'Q3 Banking Client Workstation Refresh',
    createdDate: '2026-08-14',
    createdAt: '2026-08-14',
    expiryDate: '2026-08-28',
    requiredDeliveryDate: '2026-09-15',
    shippingAddress: 'ABC Technology Logistics Warehouse, St. 289, Toul Kork, Phnom Penh',
    currency: 'USD',
    items: [
      {
        id: 'rfqi-01',
        productId: 'prod-001',
        productName: 'Dell UltraSharp 24" Commercial IPS Display (U2424H)',
        sku: 'MON-001',
        moq: 20,
        quantity: 120,
        targetPrice: 95,
        unitPriceEstimate: 99,
        totalEstimate: 11880,
        unit: 'Units',
        warehouseSummary: '150 available in Phnom Penh Warehouse',
        currentTierLabel: 'High-Volume Enterprise'
      },
      {
        id: 'rfqi-02',
        productId: 'prod-006',
        productName: 'Samsung PM9A3 3.84TB U.2 PCIe 4.0 NVMe Enterprise SSD',
        sku: 'SSD-NVME4TB',
        moq: 10,
        quantity: 60,
        targetPrice: 260,
        unitPriceEstimate: 270,
        totalEstimate: 16200,
        unit: 'Units',
        warehouseSummary: '240 available in Phnom Penh Warehouse',
        currentTierLabel: 'Master Carton'
      }
    ],
    totalQuantity: 180,
    targetValue: 27000,
    targetBudget: 27000,
    paymentTermsPreference: 'Net 30 Days Credit',
    attachments: ['Banking_Client_Rollout_Schedule.pdf', 'Receiving_Dock_Requirements.xlsx'],
    notes: 'Required for Q3 corporate banking client workstation refresh. Requires delivery directly to Phnom Penh CBD office.',
    assignedRep: {
      id: 'usr-rep-01',
      name: 'David Chen',
      title: 'Senior Enterprise Account Executive'
    },
    status: 'Negotiating',
    timeline: [
      { stage: 'RFQ Submitted', date: '2026-08-14 09:30 AM', actor: 'Sovannarith Keo (Buyer)', note: 'Requested target price $95/unit for Dell Displays' },
      { stage: 'Under Review', date: '2026-08-14 02:15 PM', actor: 'David Chen (Account Executive)', note: 'Stock reserved in Phnom Penh Hub' },
      { stage: 'Official Quote Issued', date: '2026-08-15 10:00 AM', actor: 'David Chen (Account Executive)', note: 'Offered $105/unit with 3-year warranty' },
      { stage: 'Counter Offer Submitted', date: '2026-08-16 11:20 AM', actor: 'Sovannarith Keo (Buyer)', note: 'Countered at $98/unit for bundle purchase' },
      { stage: 'Manager Review Approved', date: '2026-08-17 04:45 PM', actor: 'Marcus Vance (Sales Director)', note: 'Approved final concession at $100/unit' }
    ]
  },
  {
    id: 'rfq-2026-084',
    rfqNumber: 'RFQ-2026-084',
    buyerId: 'buyer-001',
    buyerName: 'Sovannarith Keo',
    companyName: 'ABC Technology Ltd.',
    projectTitle: 'Branch Campus LAN Expansion',
    createdDate: '2026-08-01',
    createdAt: '2026-08-01',
    expiryDate: '2026-08-15',
    requiredDeliveryDate: '2026-08-25',
    shippingAddress: 'ABC Technology Education Project Site, Toul Kork, Phnom Penh',
    currency: 'USD',
    items: [
      {
        id: 'rfqi-03',
        productId: 'prod-003',
        productName: 'Cisco Catalyst 1000 Series 48-Port PoE+ Managed Switch',
        sku: 'NET-SW48P',
        moq: 5,
        quantity: 15,
        targetPrice: 800,
        unitPriceEstimate: 890,
        totalEstimate: 13350,
        unit: 'Units',
        warehouseSummary: '80 available in Phnom Penh Warehouse',
        currentTierLabel: 'Standard Wholesale'
      }
    ],
    totalQuantity: 15,
    targetValue: 12000,
    targetBudget: 12000,
    paymentTermsPreference: 'Net 30 Days Credit',
    attachments: ['Campus_LAN_Switching_BOM.pdf'],
    notes: 'Urgent expansion for branch school campus LAN deployment.',
    assignedRep: {
      id: 'usr-rep-01',
      name: 'David Chen',
      title: 'Senior Enterprise Account Executive'
    },
    status: 'Accepted',
    timeline: [
      { stage: 'RFQ Submitted', date: '2026-08-01 11:00 AM', actor: 'Sovannarith Keo' },
      { stage: 'Quote Issued', date: '2026-08-02 09:15 AM', actor: 'David Chen' },
      { stage: 'Quote Accepted', date: '2026-08-03 03:30 PM', actor: 'Sovannarith Keo' },
      { stage: 'Ready for PO Creation', date: '2026-08-04 10:00 AM', actor: 'System' }
    ]
  },
  {
    id: 'rfq-2026-104',
    rfqNumber: 'RFQ-2026-104',
    buyerId: 'buyer-001',
    buyerName: 'Sovannarith Keo',
    companyName: 'ABC Technology Ltd.',
    projectTitle: 'Data Center Edge Rack Refresh',
    createdDate: '2026-08-17',
    createdAt: '2026-08-17',
    expiryDate: '2026-08-31',
    requiredDeliveryDate: '2026-09-20',
    shippingAddress: 'ABC Technology Data Center, Canadia Tower Annex, Phnom Penh',
    currency: 'USD',
    items: [
      {
        id: 'rfqi-04',
        productId: 'prod-002',
        productName: 'Dell PowerEdge R750 2U Rackmount Server',
        sku: 'SRV-R750',
        moq: 2,
        quantity: 6,
        targetPrice: 3100,
        unitPriceEstimate: 3200,
        totalEstimate: 19200,
        unit: 'Units',
        warehouseSummary: '18 available in Siem Reap Warehouse',
        currentTierLabel: 'Fleet Upgrade'
      },
      {
        id: 'rfqi-05',
        productId: 'prod-005',
        productName: 'APC Smart-UPS On-Line 3000VA 2U Rack/Tower 230V',
        sku: 'UPS-3000RT',
        moq: 3,
        quantity: 8,
        targetPrice: 1460,
        unitPriceEstimate: 1540,
        totalEstimate: 12320,
        unit: 'Units',
        warehouseSummary: '30 available in Phnom Penh Warehouse',
        currentTierLabel: 'Batch Tier'
      }
    ],
    totalQuantity: 14,
    targetValue: 30280,
    targetBudget: 30280,
    paymentTermsPreference: 'Net 30 Days Credit',
    notes: 'Bundle request for edge rack rollout with rack rails, redundant power cords, and consolidated delivery.',
    attachments: ['Edge_Rack_Refresh_BOM.xlsx', 'Data_Center_Delivery_Window.pdf'],
    assignedRep: {
      id: 'usr-rep-01',
      name: 'David Chen',
      title: 'Senior Enterprise Account Executive'
    },
    status: 'Quoted',
    timeline: [
      { stage: 'RFQ Submitted', date: '2026-08-17 08:20 AM', actor: 'Sovannarith Keo', note: 'Submitted two-SKU rack refresh request' },
      { stage: 'Under Review', date: '2026-08-17 10:45 AM', actor: 'David Chen', note: 'Validated MOQ and warehouse split' },
      { stage: 'Quote Sent', date: '2026-08-18 09:10 AM', actor: 'David Chen', note: 'Formal quote QTE-2026-104 issued' }
    ]
  },
  {
    id: 'rfq-2026-103',
    rfqNumber: 'RFQ-2026-103',
    buyerId: 'buyer-001',
    buyerName: 'Sovannarith Keo',
    companyName: 'ABC Technology Ltd.',
    projectTitle: 'Government Office Printer Fleet',
    createdDate: '2026-08-18',
    createdAt: '2026-08-18',
    expiryDate: '2026-09-01',
    requiredDeliveryDate: '2026-09-28',
    shippingAddress: 'ABC Technology Public Sector Fulfillment Center, Phnom Penh',
    currency: 'USD',
    items: [
      {
        id: 'rfqi-06',
        productId: 'prod-004',
        productName: 'HP LaserJet Enterprise Flow MFP M635z Heavy-Duty Monochrome',
        sku: 'PRN-MFP800',
        moq: 4,
        quantity: 12,
        targetPrice: 1780,
        unitPriceEstimate: 1850,
        totalEstimate: 22200,
        unit: 'Units',
        warehouseSummary: '10 available in Battambang Warehouse',
        currentTierLabel: 'Bulk Office'
      }
    ],
    totalQuantity: 12,
    targetValue: 21360,
    targetBudget: 21360,
    paymentTermsPreference: 'Net 30 Days Credit',
    notes: 'Requires invoice split by ministry site and serial-number list before delivery.',
    attachments: ['Printer_Fleet_RFQ_Form.pdf'],
    assignedRep: {
      id: 'usr-rep-01',
      name: 'David Chen',
      title: 'Senior Enterprise Account Executive'
    },
    status: 'Submitted',
    timeline: [
      { stage: 'RFQ Submitted', date: '2026-08-18 10:05 AM', actor: 'Sovannarith Keo', note: 'Awaiting account executive review' }
    ]
  },
  {
    id: 'rfq-2026-101',
    rfqNumber: 'RFQ-2026-101',
    buyerId: 'buyer-001',
    buyerName: 'Sovannarith Keo',
    companyName: 'ABC Technology Ltd.',
    projectTitle: 'PoE Network Expansion for Retail Chain',
    createdDate: '2026-08-16',
    createdAt: '2026-08-16',
    expiryDate: '2026-08-30',
    requiredDeliveryDate: '2026-09-18',
    shippingAddress: 'ABC Technology Staging Warehouse, National Road 4, Phnom Penh',
    currency: 'USD',
    items: [
      {
        id: 'rfqi-07',
        productId: 'prod-003',
        productName: 'Cisco Catalyst 1000 Series 48-Port PoE+ Managed Switch',
        sku: 'NET-SW48P',
        moq: 5,
        quantity: 24,
        targetPrice: 790,
        unitPriceEstimate: 820,
        totalEstimate: 19680,
        unit: 'Units',
        warehouseSummary: '80 available in Phnom Penh Warehouse',
        currentTierLabel: 'Project Tier'
      }
    ],
    totalQuantity: 24,
    targetValue: 18960,
    targetBudget: 18960,
    paymentTermsPreference: 'Net 30 Days Credit',
    notes: 'Requesting consolidated staging labels by store location.',
    attachments: ['Retail_Store_Network_Schedule.xlsx'],
    assignedRep: {
      id: 'usr-rep-01',
      name: 'David Chen',
      title: 'Senior Enterprise Account Executive'
    },
    status: 'Under Review',
    timeline: [
      { stage: 'RFQ Submitted', date: '2026-08-16 03:15 PM', actor: 'Sovannarith Keo' },
      { stage: 'Stock Check Started', date: '2026-08-17 09:25 AM', actor: 'David Chen', note: 'Warehouse team validating project-tier availability' }
    ]
  },
  {
    id: 'rfq-2026-099',
    rfqNumber: 'RFQ-2026-099',
    buyerId: 'buyer-001',
    buyerName: 'Sovannarith Keo',
    companyName: 'ABC Technology Ltd.',
    projectTitle: 'Draft: SSD Spares Reserve',
    createdDate: '2026-08-15',
    createdAt: '2026-08-15',
    expiryDate: '2026-08-29',
    requiredDeliveryDate: '2026-10-05',
    shippingAddress: 'ABC Technology Logistics Warehouse, St. 289, Toul Kork, Phnom Penh',
    currency: 'USD',
    items: [
      {
        id: 'rfqi-08',
        productId: 'prod-006',
        productName: 'Samsung PM9A3 3.84TB U.2 PCIe 4.0 NVMe Enterprise SSD',
        sku: 'SSD-NVME4TB',
        moq: 10,
        quantity: 30,
        targetPrice: 282,
        unitPriceEstimate: 295,
        totalEstimate: 8850,
        unit: 'Units',
        warehouseSummary: '240 available in Phnom Penh Warehouse',
        currentTierLabel: 'Wholesale Tray'
      }
    ],
    totalQuantity: 30,
    targetValue: 8460,
    targetBudget: 8460,
    paymentTermsPreference: 'Net 30 Days Credit',
    notes: 'Draft RFQ saved while final spares quantities are confirmed.',
    attachments: [],
    assignedRep: {
      id: 'usr-rep-01',
      name: 'David Chen',
      title: 'Senior Enterprise Account Executive'
    },
    status: 'Draft',
    timeline: [
      { stage: 'Draft Saved', date: '2026-08-15 05:40 PM', actor: 'Sovannarith Keo', note: 'Not yet submitted to sales' }
    ]
  },
  {
    id: 'rfq-2026-078',
    rfqNumber: 'RFQ-2026-078',
    buyerId: 'buyer-001',
    buyerName: 'Sovannarith Keo',
    companyName: 'ABC Technology Ltd.',
    projectTitle: 'Special-Price Monitor Clearance Request',
    createdDate: '2026-07-23',
    createdAt: '2026-07-23',
    expiryDate: '2026-08-06',
    requiredDeliveryDate: '2026-08-18',
    shippingAddress: 'ABC Technology Logistics Warehouse, St. 289, Toul Kork, Phnom Penh',
    currency: 'USD',
    items: [
      {
        id: 'rfqi-09',
        productId: 'prod-001',
        productName: 'Dell UltraSharp 24" Commercial IPS Display (U2424H)',
        sku: 'MON-001',
        moq: 20,
        quantity: 40,
        targetPrice: 82,
        unitPriceEstimate: 120,
        totalEstimate: 4800,
        unit: 'Units',
        warehouseSummary: '150 available in Phnom Penh Warehouse',
        currentTierLabel: 'Standard Wholesale'
      }
    ],
    totalQuantity: 40,
    targetValue: 3280,
    targetBudget: 3280,
    paymentTermsPreference: 'Advance Wire',
    notes: 'Target price was below approved margin floor for this SKU.',
    attachments: ['Monitor_Clearance_Target.xlsx'],
    assignedRep: {
      id: 'usr-rep-01',
      name: 'David Chen',
      title: 'Senior Enterprise Account Executive'
    },
    status: 'Rejected',
    timeline: [
      { stage: 'RFQ Submitted', date: '2026-07-23 10:30 AM', actor: 'Sovannarith Keo' },
      { stage: 'Pricing Review', date: '2026-07-23 03:20 PM', actor: 'Marcus Vance' },
      { stage: 'RFQ Rejected', date: '2026-07-24 09:15 AM', actor: 'David Chen', note: 'Target below cost-plus threshold' }
    ]
  },
  {
    id: 'rfq-2026-071',
    rfqNumber: 'RFQ-2026-071',
    buyerId: 'buyer-001',
    buyerName: 'Sovannarith Keo',
    companyName: 'ABC Technology Ltd.',
    projectTitle: 'Expired: UPS Emergency Stock Hold',
    createdDate: '2026-07-10',
    createdAt: '2026-07-10',
    expiryDate: '2026-07-24',
    requiredDeliveryDate: '2026-08-08',
    shippingAddress: 'ABC Technology Disaster Recovery Site, Kandal',
    currency: 'USD',
    items: [
      {
        id: 'rfqi-10',
        productId: 'prod-005',
        productName: 'APC Smart-UPS On-Line 3000VA 2U Rack/Tower 230V',
        sku: 'UPS-3000RT',
        moq: 3,
        quantity: 5,
        targetPrice: 1480,
        unitPriceEstimate: 1540,
        totalEstimate: 7700,
        unit: 'Units',
        warehouseSummary: '30 available in Phnom Penh Warehouse',
        currentTierLabel: 'Batch Tier'
      }
    ],
    totalQuantity: 5,
    targetValue: 7400,
    targetBudget: 7400,
    paymentTermsPreference: 'Net 30 Days Credit',
    notes: 'Buyer did not confirm the reserve before expiry.',
    attachments: [],
    assignedRep: {
      id: 'usr-rep-01',
      name: 'David Chen',
      title: 'Senior Enterprise Account Executive'
    },
    status: 'Expired',
    timeline: [
      { stage: 'RFQ Submitted', date: '2026-07-10 01:00 PM', actor: 'Sovannarith Keo' },
      { stage: 'Quote Window Expired', date: '2026-07-24 05:00 PM', actor: 'System', note: 'No buyer decision before validity window closed' }
    ]
  }
];

export const mockQuotes: Quote[] = [
  {
    id: 'qte-2026-089',
    quoteNumber: 'QTE-2026-089',
    rfqId: 'rfq-2026-089',
    rfqNumber: 'RFQ-2026-089',
    buyerId: 'buyer-001',
    buyerName: 'Sovannarith Keo',
    companyName: 'ABC Technology Ltd.',
    salesRep: {
      id: 'usr-rep-01',
      name: 'David Chen',
      email: 'david.chen@wholesalehub.com',
      phone: '+855 23 999 101'
    },
    items: [
      {
        id: 'qi-01',
        productId: 'prod-001',
        productName: 'Dell UltraSharp 24" Commercial IPS Display (U2424H)',
        sku: 'MON-001',
        quantity: 120,
        unitPrice: 100,
        quotedUnitPrice: 100,
        originalTierPrice: 99,
        buyerTargetPrice: 95,
        subtotal: 12000,
        moq: 20,
        estimatedDelivery: '2026-09-13'
      },
      {
        id: 'qi-02',
        productId: 'prod-006',
        productName: 'Samsung PM9A3 3.84TB U.2 PCIe 4.0 NVMe Enterprise SSD',
        sku: 'SSD-NVME4TB',
        quantity: 60,
        unitPrice: 265,
        quotedUnitPrice: 265,
        originalTierPrice: 270,
        buyerTargetPrice: 260,
        subtotal: 15900,
        moq: 10,
        estimatedDelivery: '2026-09-13'
      }
    ],
    subtotal: 27900,
    tax: 2790,
    discount: 500,
    shipping: 150,
    total: 30340,
    totalAmount: 30340,
    currency: 'USD',
    paymentTerms: 'Net 30 Days (from Credit Line)',
    createdDate: '2026-08-15',
    createdAt: '2026-08-15',
    expiryDate: '2026-08-25',
    validUntil: '2026-08-25',
    estimatedDelivery: '2026-09-13',
    managerApprovalStatus: 'Approved',
    notes: 'Door-to-door freight and priority pallet wrapping included for the combined bundle.',
    status: 'Negotiating',
    negotiationHistory: [
      {
        id: 'neg-1',
        senderRole: 'BUYER',
        senderName: 'Sovannarith Keo (Buyer)',
        timestamp: '2026-08-14 09:30 AM',
        proposedPrice: 95,
        quantity: 120,
        message: 'We are ordering 120 monitors and 60 NVMe enterprise drives for a premier banking contract. Could you offer $95/unit on the Dell monitors?'
      },
      {
        id: 'neg-2',
        senderRole: 'SALES_REP',
        senderName: 'David Chen (Sales Rep)',
        timestamp: '2026-08-15 10:00 AM',
        proposedPrice: 105,
        quantity: 120,
        message: 'Standard wholesale tier for 120 units is $99 + freight. We can do $105/unit including door-to-door express freight and priority pallet wrapping.'
      },
      {
        id: 'neg-3',
        senderRole: 'BUYER',
        senderName: 'Sovannarith Keo (Buyer)',
        timestamp: '2026-08-16 11:20 AM',
        proposedPrice: 98,
        quantity: 120,
        message: 'Our target budget is strictly capped. If you can meet at $98/unit with free local delivery, we will confirm the Purchase Order immediately.'
      },
      {
        id: 'neg-4',
        senderRole: 'SALES_MANAGER',
        senderName: 'Marcus Vance (Sales Manager)',
        timestamp: '2026-08-17 04:45 PM',
        proposedPrice: 100,
        quantity: 120,
        message: 'Approved Special Concession: We can lock $100/unit for the Dell displays and $265 for NVMe drives, with Net 30 payment terms deducted from your available credit.',
        actionTaken: 'MANAGER_APPROVED'
      }
    ]
  },
  {
    id: 'qte-2026-104',
    quoteNumber: 'QTE-2026-104',
    rfqId: 'rfq-2026-104',
    rfqNumber: 'RFQ-2026-104',
    buyerId: 'buyer-001',
    buyerName: 'Sovannarith Keo',
    companyName: 'ABC Technology Ltd.',
    salesRep: {
      id: 'usr-rep-01',
      name: 'David Chen',
      email: 'david.chen@wholesalehub.com',
      phone: '+855 23 999 101'
    },
    items: [
      {
        id: 'qi-104-01',
        productId: 'prod-002',
        productName: 'Dell PowerEdge R750 2U Rackmount Server',
        sku: 'SRV-R750',
        quantity: 6,
        unitPrice: 3180,
        quotedUnitPrice: 3180,
        originalTierPrice: 3200,
        buyerTargetPrice: 3100,
        subtotal: 19080,
        moq: 2,
        estimatedDelivery: '2026-09-18'
      },
      {
        id: 'qi-104-02',
        productId: 'prod-005',
        productName: 'APC Smart-UPS On-Line 3000VA 2U Rack/Tower 230V',
        sku: 'UPS-3000RT',
        quantity: 8,
        unitPrice: 1495,
        quotedUnitPrice: 1495,
        originalTierPrice: 1540,
        buyerTargetPrice: 1460,
        subtotal: 11960,
        moq: 3,
        estimatedDelivery: '2026-09-18'
      }
    ],
    subtotal: 31040,
    tax: 3104,
    discount: 450,
    shipping: 180,
    total: 33874,
    totalAmount: 33874,
    currency: 'USD',
    paymentTerms: 'Net 30 Days Credit',
    createdDate: '2026-08-18',
    createdAt: '2026-08-18',
    expiryDate: '2026-08-20',
    validUntil: '2026-08-20',
    estimatedDelivery: '2026-09-18',
    status: 'Sent',
    notes: 'Includes rack rails, redundant power cords, and consolidated insured freight.',
    negotiationHistory: [
      {
        id: 'neg-104-1',
        senderRole: 'BUYER',
        senderName: 'Sovannarith Keo (Buyer)',
        timestamp: '2026-08-17 08:20 AM',
        proposedPrice: 30280,
        quantity: 14,
        message: 'Requesting combined server and UPS pricing for an edge rack rollout with one consolidated delivery window.'
      },
      {
        id: 'neg-104-2',
        senderRole: 'SALES_REP',
        senderName: 'David Chen (Sales Rep)',
        timestamp: '2026-08-18 09:10 AM',
        proposedPrice: 33874,
        quantity: 14,
        message: 'Formal quote issued with project bundle discount, insured freight, and Net 30 terms.',
        actionTaken: 'QUOTE_SENT'
      }
    ]
  },
  {
    id: 'qte-2026-101',
    quoteNumber: 'QTE-2026-101',
    rfqId: 'rfq-2026-101',
    rfqNumber: 'RFQ-2026-101',
    buyerId: 'buyer-001',
    buyerName: 'Sovannarith Keo',
    companyName: 'ABC Technology Ltd.',
    salesRep: {
      id: 'usr-rep-01',
      name: 'David Chen',
      email: 'david.chen@wholesalehub.com',
      phone: '+855 23 999 101'
    },
    items: [
      {
        id: 'qi-101-01',
        productId: 'prod-003',
        productName: 'Cisco Catalyst 1000 Series 48-Port PoE+ Managed Switch',
        sku: 'NET-SW48P',
        quantity: 24,
        unitPrice: 805,
        quotedUnitPrice: 805,
        originalTierPrice: 820,
        buyerTargetPrice: 790,
        subtotal: 19320,
        moq: 5,
        estimatedDelivery: '2026-09-18'
      }
    ],
    subtotal: 19320,
    tax: 1932,
    discount: 0,
    shipping: 130,
    total: 21382,
    totalAmount: 21382,
    currency: 'USD',
    paymentTerms: 'Net 30 Days Credit',
    createdDate: '2026-08-17',
    createdAt: '2026-08-17',
    expiryDate: '2026-08-24',
    validUntil: '2026-08-24',
    estimatedDelivery: '2026-09-18',
    status: 'Pending Manager Approval',
    managerApprovalStatus: 'Pending',
    notes: 'Buyer counter is inside project-tier range but requires manager approval for the final concession.',
    negotiationHistory: [
      {
        id: 'neg-101-1',
        senderRole: 'BUYER',
        senderName: 'Sovannarith Keo (Buyer)',
        timestamp: '2026-08-16 03:15 PM',
        proposedPrice: 18960,
        quantity: 24,
        message: 'Requesting $790/unit based on repeat network rollout volume.'
      },
      {
        id: 'neg-101-2',
        senderRole: 'SALES_REP',
        senderName: 'David Chen (Sales Rep)',
        timestamp: '2026-08-17 11:30 AM',
        proposedPrice: 21382,
        quantity: 24,
        message: 'Counter pricing submitted to Sales Manager for approval.',
        actionTaken: 'REQUEST_MANAGER_APPROVAL'
      }
    ]
  },
  {
    id: 'qte-2026-084',
    quoteNumber: 'QTE-2026-084',
    rfqId: 'rfq-2026-084',
    rfqNumber: 'RFQ-2026-084',
    buyerId: 'buyer-001',
    buyerName: 'Sovannarith Keo',
    companyName: 'ABC Technology Ltd.',
    salesRep: {
      id: 'usr-rep-01',
      name: 'David Chen',
      email: 'david.chen@wholesalehub.com',
      phone: '+855 23 999 101'
    },
    items: [
      {
        id: 'qi-084-01',
        productId: 'prod-003',
        productName: 'Cisco Catalyst 1000 Series 48-Port PoE+ Managed Switch',
        sku: 'NET-SW48P',
        quantity: 15,
        unitPrice: 820,
        quotedUnitPrice: 820,
        originalTierPrice: 890,
        buyerTargetPrice: 800,
        subtotal: 12300,
        moq: 5,
        estimatedDelivery: '2026-08-20'
      }
    ],
    subtotal: 12300,
    tax: 1230,
    discount: 300,
    shipping: 120,
    total: 13350,
    totalAmount: 13350,
    currency: 'USD',
    paymentTerms: 'Net 30 Days Credit',
    createdDate: '2026-08-02',
    createdAt: '2026-08-02',
    expiryDate: '2026-08-15',
    validUntil: '2026-08-15',
    estimatedDelivery: '2026-08-20',
    status: 'Accepted',
    managerApprovalStatus: 'Approved',
    notes: 'Accepted quote remains ready for Stage E purchase-order creation.',
    negotiationHistory: [
      {
        id: 'neg-084-1',
        senderRole: 'SALES_REP',
        senderName: 'David Chen (Sales Rep)',
        timestamp: '2026-08-02 09:15 AM',
        proposedPrice: 13350,
        quantity: 15,
        message: 'Formal quote issued with $820/unit project pricing and local delivery.'
      },
      {
        id: 'neg-084-2',
        senderRole: 'BUYER',
        senderName: 'Sovannarith Keo (Buyer)',
        timestamp: '2026-08-03 03:30 PM',
        proposedPrice: 13350,
        quantity: 15,
        message: 'Quote accepted and ready for PO creation.',
        actionTaken: 'ACCEPT_QUOTE'
      }
    ]
  },
  {
    id: 'qte-2026-078',
    quoteNumber: 'QTE-2026-078',
    rfqId: 'rfq-2026-078',
    rfqNumber: 'RFQ-2026-078',
    buyerId: 'buyer-001',
    buyerName: 'Sovannarith Keo',
    companyName: 'ABC Technology Ltd.',
    salesRep: {
      id: 'usr-rep-01',
      name: 'David Chen',
      email: 'david.chen@wholesalehub.com',
      phone: '+855 23 999 101'
    },
    items: [
      {
        id: 'qi-078-01',
        productId: 'prod-001',
        productName: 'Dell UltraSharp 24" Commercial IPS Display (U2424H)',
        sku: 'MON-001',
        quantity: 40,
        unitPrice: 118,
        quotedUnitPrice: 118,
        originalTierPrice: 120,
        buyerTargetPrice: 82,
        subtotal: 4720,
        moq: 20,
        estimatedDelivery: '2026-08-18'
      }
    ],
    subtotal: 4720,
    tax: 472,
    discount: 0,
    shipping: 90,
    total: 5282,
    totalAmount: 5282,
    currency: 'USD',
    paymentTerms: 'Advance Wire Transfer',
    createdDate: '2026-07-23',
    createdAt: '2026-07-23',
    expiryDate: '2026-08-06',
    validUntil: '2026-08-06',
    estimatedDelivery: '2026-08-18',
    status: 'Rejected',
    managerApprovalStatus: 'Rejected',
    notes: 'Declined because the approved price was above project budget.',
    negotiationHistory: [
      {
        id: 'neg-078-1',
        senderRole: 'SALES_REP',
        senderName: 'David Chen (Sales Rep)',
        timestamp: '2026-07-23 04:00 PM',
        proposedPrice: 5282,
        quantity: 40,
        message: 'Best available clearance quote issued after margin review.'
      },
      {
        id: 'neg-078-2',
        senderRole: 'BUYER',
        senderName: 'Sovannarith Keo (Buyer)',
        timestamp: '2026-07-24 09:15 AM',
        proposedPrice: 3280,
        quantity: 40,
        message: 'Quote rejected because approved pricing exceeded the client budget cap.',
        actionTaken: 'REJECT_QUOTE'
      }
    ]
  },
  {
    id: 'qte-2026-071',
    quoteNumber: 'QTE-2026-071',
    rfqId: 'rfq-2026-071',
    rfqNumber: 'RFQ-2026-071',
    buyerId: 'buyer-001',
    buyerName: 'Sovannarith Keo',
    companyName: 'ABC Technology Ltd.',
    salesRep: {
      id: 'usr-rep-01',
      name: 'David Chen',
      email: 'david.chen@wholesalehub.com',
      phone: '+855 23 999 101'
    },
    items: [
      {
        id: 'qi-071-01',
        productId: 'prod-005',
        productName: 'APC Smart-UPS On-Line 3000VA 2U Rack/Tower 230V',
        sku: 'UPS-3000RT',
        quantity: 5,
        unitPrice: 1525,
        quotedUnitPrice: 1525,
        originalTierPrice: 1540,
        buyerTargetPrice: 1480,
        subtotal: 7625,
        moq: 3,
        estimatedDelivery: '2026-08-08'
      }
    ],
    subtotal: 7625,
    tax: 763,
    discount: 0,
    shipping: 85,
    total: 8473,
    totalAmount: 8473,
    currency: 'USD',
    paymentTerms: 'Net 30 Days Credit',
    createdDate: '2026-07-11',
    createdAt: '2026-07-11',
    expiryDate: '2026-07-24',
    validUntil: '2026-07-24',
    estimatedDelivery: '2026-08-08',
    status: 'Expired',
    notes: 'Quote validity elapsed before buyer acceptance.',
    negotiationHistory: [
      {
        id: 'neg-071-1',
        senderRole: 'SALES_REP',
        senderName: 'David Chen (Sales Rep)',
        timestamp: '2026-07-11 02:20 PM',
        proposedPrice: 8473,
        quantity: 5,
        message: 'Emergency UPS stock-hold quote issued with 14-day validity.'
      },
      {
        id: 'neg-071-2',
        senderRole: 'SYSTEM',
        senderName: 'WholesaleHub System',
        timestamp: '2026-07-24 05:00 PM',
        message: 'Quote expired automatically after the validity window closed.',
        actionTaken: 'QUOTE_EXPIRED'
      }
    ]
  },
  {
    id: 'qte-2026-112',
    quoteNumber: 'QTE-2026-112',
    rfqId: 'rfq-2026-112',
    rfqNumber: 'RFQ-2026-112',
    buyerId: 'buyer-001',
    buyerName: 'Sovannarith Keo',
    companyName: 'ABC Technology Ltd.',
    salesRep: {
      id: 'usr-rep-01',
      name: 'David Chen',
      email: 'david.chen@wholesalehub.com',
      phone: '+855 23 999 101'
    },
    items: [
      {
        id: 'qi-112-01',
        productId: 'prod-001',
        productName: 'Dell UltraSharp 24" Commercial IPS Display (U2424H)',
        sku: 'MON-001',
        quantity: 100,
        unitPrice: 112,
        quotedUnitPrice: 112,
        originalTierPrice: 99,
        buyerTargetPrice: 110,
        subtotal: 11200,
        moq: 20,
        estimatedDelivery: '2026-09-12'
      }
    ],
    subtotal: 11200,
    tax: 1120,
    discount: 480,
    shipping: 160,
    total: 12000,
    totalAmount: 12000,
    currency: 'USD',
    paymentTerms: 'Net 30 Days Credit',
    createdDate: '2026-08-18',
    createdAt: '2026-08-18',
    expiryDate: '2026-08-30',
    validUntil: '2026-08-30',
    estimatedDelivery: '2026-09-12',
    status: 'Accepted',
    managerApprovalStatus: 'Approved',
    notes: 'Accepted quote for a municipal office monitor replacement batch.',
    negotiationHistory: [
      {
        id: 'neg-112-1',
        senderRole: 'SALES_REP',
        senderName: 'David Chen (Sales Rep)',
        timestamp: '2026-08-18 09:50 AM',
        proposedPrice: 12000,
        quantity: 100,
        message: 'Final quote issued with buyer-group discount and consolidated Phnom Penh delivery.'
      },
      {
        id: 'neg-112-2',
        senderRole: 'BUYER',
        senderName: 'Sovannarith Keo (Buyer)',
        timestamp: '2026-08-18 10:15 AM',
        proposedPrice: 12000,
        quantity: 100,
        message: 'Quote accepted for PO conversion.',
        actionTaken: 'ACCEPT_QUOTE'
      }
    ]
  },
  {
    id: 'qte-2026-113',
    quoteNumber: 'QTE-2026-113',
    rfqId: 'rfq-2026-113',
    rfqNumber: 'RFQ-2026-113',
    buyerId: 'buyer-001',
    buyerName: 'Sovannarith Keo',
    companyName: 'ABC Technology Ltd.',
    salesRep: {
      id: 'usr-rep-01',
      name: 'David Chen',
      email: 'david.chen@wholesalehub.com',
      phone: '+855 23 999 101'
    },
    items: [
      {
        id: 'qi-113-01',
        productId: 'prod-006',
        productName: 'Samsung PM9A3 3.84TB U.2 PCIe 4.0 NVMe Enterprise SSD',
        sku: 'SSD-NVME4TB',
        quantity: 90,
        unitPrice: 268,
        quotedUnitPrice: 268,
        originalTierPrice: 270,
        buyerTargetPrice: 260,
        subtotal: 24120,
        moq: 10,
        estimatedDelivery: '2026-09-20'
      }
    ],
    subtotal: 24120,
    tax: 2412,
    discount: 900,
    shipping: 250,
    total: 25882,
    totalAmount: 25882,
    currency: 'USD',
    paymentTerms: 'Net 30 Days Credit',
    createdDate: '2026-08-18',
    createdAt: '2026-08-18',
    expiryDate: '2026-08-30',
    validUntil: '2026-08-30',
    estimatedDelivery: '2026-09-20',
    status: 'Accepted',
    managerApprovalStatus: 'Approved',
    notes: 'Accepted high-value spares reserve quote; credit approval may be required at PO creation.',
    negotiationHistory: [
      {
        id: 'neg-113-1',
        senderRole: 'SALES_MANAGER',
        senderName: 'Marcus Vance (Sales Manager)',
        timestamp: '2026-08-18 11:05 AM',
        proposedPrice: 25882,
        quantity: 90,
        message: 'Approved final SSD spares reserve quote at corporate buyer pricing.',
        actionTaken: 'MANAGER_APPROVED'
      },
      {
        id: 'neg-113-2',
        senderRole: 'BUYER',
        senderName: 'Sovannarith Keo (Buyer)',
        timestamp: '2026-08-18 11:20 AM',
        proposedPrice: 25882,
        quantity: 90,
        message: 'Quote accepted; buyer will submit PO for finance review.',
        actionTaken: 'ACCEPT_QUOTE'
      }
    ]
  }
];

export const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-2026-0041',
    poNumber: 'PO-2026-0041',
    quoteId: 'qte-2026-084',
    quoteNumber: 'QTE-2026-084',
    rfqNumber: 'RFQ-2026-084',
    buyerId: 'buyer-001',
    companyName: 'ABC Technology Ltd.',
    contactPerson: 'Sovannarith Keo',
    orderDate: '2026-08-04',
    expectedDeliveryDate: '2026-08-20',
    currency: 'USD',
    items: [
      {
        id: 'poi-01',
        productId: 'prod-003',
        productName: 'Cisco Catalyst 1000 Series 48-Port PoE+ Managed Switch',
        sku: 'NET-SW48P',
        quantity: 15,
        unitPrice: 820,
        subtotal: 12300
      }
    ],
    subtotal: 12300,
    tax: 1230,
    discount: 300,
    shippingFee: 120,
    grandTotal: 13350,
    totalAmount: 13350,
    paymentTerms: 'Net 30 Days Credit',
    shippingAddress: 'ABC Tech Logistics Center, St. 289, Toul Kork, Phnom Penh',
    billingAddress: 'ABC Technology Ltd., St. 289, Toul Kork, Phnom Penh',
    status: 'Processing',
    stockStatus: 'Allocated',
    shipmentStatus: 'Preparing',
    invoiceId: 'inv-2026-0112',
    contractId: 'ctr-2026-0018',
    timeline: [
      { stage: 'PO Created', date: '2026-08-04 10:00 AM', description: 'Purchase order signed and generated from Quote QTE-2026-084', completed: true },
      { stage: 'Credit Approved', date: '2026-08-04 11:30 AM', description: 'Charged $13,350 to ABC Tech Net 30 Credit Facility', completed: true },
      { stage: 'Stock Allocated', date: '2026-08-05 09:00 AM', description: '15 units reserved in Phnom Penh Central Hub', completed: true },
      { stage: 'Invoice Generated', date: '2026-08-05 02:00 PM', description: 'Invoice INV-2026-0112 issued with due date Sep 04, 2026', completed: true },
      { stage: 'Dispatched / In Transit', date: '2026-08-18 (Est.)', description: 'Freight logistics partner pickup scheduled', completed: false },
      { stage: 'Delivered & Completed', date: '2026-08-20 (Est.)', description: 'Requires physical signature and POD upload', completed: false }
    ]
  },
  {
    id: 'po-2026-0028',
    poNumber: 'PO-2026-0028',
    quoteNumber: 'QTE-2026-042',
    buyerId: 'buyer-001',
    companyName: 'ABC Technology Ltd.',
    contactPerson: 'Sovannarith Keo',
    orderDate: '2026-07-12',
    expectedDeliveryDate: '2026-07-22',
    currency: 'USD',
    items: [
      {
        id: 'poi-02',
        productId: 'prod-002',
        productName: 'Dell PowerEdge R750 2U Rackmount Server',
        sku: 'SRV-R750',
        quantity: 4,
        unitPrice: 3200,
        subtotal: 12800
      }
    ],
    subtotal: 12800,
    tax: 1280,
    discount: 0,
    shippingFee: 200,
    grandTotal: 14280,
    totalAmount: 14280,
    paymentTerms: 'Net 30 Days Credit',
    shippingAddress: 'ABC Tech Logistics Center, St. 289, Toul Kork, Phnom Penh',
    billingAddress: 'ABC Technology Ltd., St. 289, Toul Kork, Phnom Penh',
    status: 'Completed',
    stockStatus: 'Allocated',
    shipmentStatus: 'Delivered',
    invoiceId: 'inv-2026-0089',
    timeline: [
      { stage: 'PO Created', date: '2026-07-12', description: 'PO created', completed: true },
      { stage: 'Credit Approved', date: '2026-07-12', description: 'Credit approved', completed: true },
      { stage: 'Stock Allocated', date: '2026-07-13', description: 'Stock reserved', completed: true },
      { stage: 'Invoice Generated', date: '2026-07-13', description: 'Invoice issued', completed: true },
      { stage: 'Dispatched / In Transit', date: '2026-07-16', description: 'Shipped via Express Freight', completed: true },
      { stage: 'Delivered & Completed', date: '2026-07-19', description: 'Delivered and signed by S. Keo', completed: true }
    ]
  },
  {
    id: 'po-2026-0058',
    poNumber: 'PO-2026-0058',
    quoteId: 'qte-2026-113',
    quoteNumber: 'QTE-2026-113',
    rfqNumber: 'RFQ-2026-113',
    buyerId: 'buyer-001',
    buyerName: 'Sovannarith Keo',
    companyName: 'ABC Technology Ltd.',
    contactPerson: 'Sovannarith Keo',
    orderDate: '2026-08-18',
    expectedDeliveryDate: '2026-09-20',
    requestedDeliveryDate: '2026-09-20',
    currency: 'USD',
    items: [
      {
        id: 'poi-58-01',
        productId: 'prod-006',
        productName: 'Samsung PM9A3 3.84TB U.2 PCIe 4.0 NVMe Enterprise SSD',
        sku: 'SSD-NVME4TB',
        quantity: 90,
        unitPrice: 268,
        subtotal: 24120,
        fulfilledQuantity: 0,
        remainingQuantity: 90,
        allocationStatus: 'Fully Available',
        warehouseAllocation: [
          { warehouseId: 'wh-pp-01', warehouseName: 'Phnom Penh Warehouse', city: 'Phnom Penh', available: 240, allocated: 90 }
        ]
      }
    ],
    subtotal: 24120,
    tax: 2412,
    discount: 900,
    shippingFee: 250,
    grandTotal: 25882,
    totalAmount: 25882,
    paymentTerms: 'Net 30 Days Credit',
    shippingAddress: 'ABC Technology Logistics Warehouse, St. 289, Toul Kork, Phnom Penh',
    billingAddress: 'ABC Technology Ltd., St. 289, Toul Kork, Phnom Penh',
    buyerPoReference: 'ABC-SSD-SPARES-2026-09',
    internalBuyerNotes: 'Finance review requested because this order exceeds available credit.',
    attachments: ['ABC_SSD_Spares_PO_Request.pdf'],
    status: 'Pending Approval',
    stockStatus: 'Allocated',
    shipmentStatus: 'Pending',
    assignedRep: {
      id: 'usr-rep-01',
      name: 'David Chen',
      email: 'david.chen@wholesalehub.com',
      title: 'Senior Enterprise Account Executive'
    },
    approval: {
      required: true,
      reason: 'Order exceeds available account credit.',
      status: 'Under Review',
      submittedAt: '2026-08-18 11:45 AM'
    },
    creditCheck: {
      buyerStatus: 'Approved',
      creditLimit: 50000,
      usedCredit: 32000,
      availableCredit: 18000,
      poAmount: 25882,
      remainingCreditAfterPO: -7882,
      shortfall: 7882,
      status: 'Approval Required',
      message: 'Manager approval may be required. Credit shortfall: $7,882.'
    },
    inventoryAllocations: [
      {
        productId: 'prod-006',
        sku: 'SSD-NVME4TB',
        productName: 'Samsung PM9A3 3.84TB U.2 PCIe 4.0 NVMe Enterprise SSD',
        requestedQty: 90,
        totalAvailable: 480,
        allocatedQty: 90,
        backorderQty: 0,
        result: 'Fully Available',
        warehouses: [
          { warehouseId: 'wh-pp-01', warehouseName: 'Phnom Penh Warehouse', city: 'Phnom Penh', available: 240, allocated: 90 },
          { warehouseId: 'wh-sr-01', warehouseName: 'Siem Reap Warehouse', city: 'Siem Reap', available: 160, allocated: 0 },
          { warehouseId: 'wh-btb-01', warehouseName: 'Battambang Warehouse', city: 'Battambang', available: 80, allocated: 0 }
        ]
      }
    ],
    documents: [
      { id: 'pod-58-01', name: 'Buyer_PO_Request_ABC-SSD-SPARES-2026-09.pdf', type: 'Buyer PO', uploadedDate: '2026-08-18', version: 'v1' },
      { id: 'pod-58-02', name: 'Quote_QTE-2026-113.pdf', type: 'Quote', uploadedDate: '2026-08-18', version: 'v1' }
    ],
    timeline: [
      { stage: 'PO Created', date: '2026-08-18 11:45 AM', description: 'Buyer submitted PO from accepted quote QTE-2026-113', completed: true },
      { stage: 'Pending Approval', date: '2026-08-18 11:45 AM', description: 'Credit shortfall requires account approval review', completed: true, active: true },
      { stage: 'Approved', date: 'Pending', description: 'Awaiting approval outcome', completed: false },
      { stage: 'Stock Allocated', date: 'Pending', description: 'Allocation proposal prepared but not committed', completed: false },
      { stage: 'Contract Generated', date: 'Pending', description: 'Available after approval', completed: false }
    ],
    activity: [
      { id: 'po-act-58-1', title: 'PO submitted', timestamp: '2026-08-18 11:45 AM', actor: 'Sovannarith Keo', description: 'Submitted high-value SSD spares PO for approval.' }
    ]
  },
  {
    id: 'po-2026-0057',
    poNumber: 'PO-2026-0057',
    quoteId: 'qte-2026-112',
    quoteNumber: 'QTE-2026-112',
    rfqNumber: 'RFQ-2026-112',
    buyerId: 'buyer-001',
    buyerName: 'Sovannarith Keo',
    companyName: 'ABC Technology Ltd.',
    contactPerson: 'Sovannarith Keo',
    orderDate: '2026-08-18',
    expectedDeliveryDate: '2026-09-12',
    requestedDeliveryDate: '2026-09-12',
    currency: 'USD',
    items: [
      {
        id: 'poi-57-01',
        productId: 'prod-001',
        productName: 'Dell UltraSharp 24" Commercial IPS Display (U2424H)',
        sku: 'MON-001',
        quantity: 100,
        unitPrice: 112,
        subtotal: 11200,
        fulfilledQuantity: 0,
        remainingQuantity: 100,
        allocationStatus: 'Fully Available',
        warehouseAllocation: [
          { warehouseId: 'wh-pp-01', warehouseName: 'Phnom Penh Warehouse', city: 'Phnom Penh', available: 150, allocated: 100 }
        ]
      }
    ],
    subtotal: 11200,
    tax: 1120,
    discount: 480,
    shippingFee: 160,
    grandTotal: 12000,
    totalAmount: 12000,
    paymentTerms: 'Net 30 Days Credit',
    shippingAddress: 'ABC Technology Logistics Warehouse, St. 289, Toul Kork, Phnom Penh',
    billingAddress: 'ABC Technology Ltd., St. 289, Toul Kork, Phnom Penh',
    buyerPoReference: 'ABC-MON-ROLL-2026-08',
    internalBuyerNotes: 'Deliver during morning receiving window.',
    attachments: ['ABC_Monitor_PO_Reference.pdf'],
    status: 'Stock Allocated',
    stockStatus: 'Allocated',
    shipmentStatus: 'Preparing',
    invoiceId: 'inv-2026-0116',
    contractId: 'ctr-2026-0057',
    assignedRep: {
      id: 'usr-rep-01',
      name: 'David Chen',
      email: 'david.chen@wholesalehub.com',
      title: 'Senior Enterprise Account Executive'
    },
    approval: {
      required: false,
      status: 'Approved',
      submittedAt: '2026-08-18 10:35 AM',
      reviewedAt: '2026-08-18 10:36 AM'
    },
    creditCheck: {
      buyerStatus: 'Approved',
      creditLimit: 50000,
      usedCredit: 32000,
      availableCredit: 18000,
      poAmount: 12000,
      remainingCreditAfterPO: 6000,
      shortfall: 0,
      status: 'Passed',
      message: 'Credit check passed.'
    },
    inventoryAllocations: [
      {
        productId: 'prod-001',
        sku: 'MON-001',
        productName: 'Dell UltraSharp 24" Commercial IPS Display (U2424H)',
        requestedQty: 100,
        totalAvailable: 240,
        allocatedQty: 100,
        backorderQty: 0,
        result: 'Fully Available',
        warehouses: [
          { warehouseId: 'wh-pp-01', warehouseName: 'Phnom Penh Warehouse', city: 'Phnom Penh', available: 150, allocated: 100 },
          { warehouseId: 'wh-sr-01', warehouseName: 'Siem Reap Warehouse', city: 'Siem Reap', available: 70, allocated: 0 },
          { warehouseId: 'wh-btb-01', warehouseName: 'Battambang Warehouse', city: 'Battambang', available: 20, allocated: 0 }
        ]
      }
    ],
    documents: [
      { id: 'pod-57-01', name: 'PO-2026-0057.pdf', type: 'Purchase Order', uploadedDate: '2026-08-18', version: 'v1' },
      { id: 'pod-57-02', name: 'Quote_QTE-2026-112.pdf', type: 'Quote', uploadedDate: '2026-08-18', version: 'v1' },
      { id: 'pod-57-03', name: 'Contract_CTR-2026-0057.pdf', type: 'Contract', uploadedDate: '2026-08-18', version: 'v1' }
    ],
    timeline: [
      { stage: 'PO Created', date: '2026-08-18 10:35 AM', description: 'Purchase order submitted from accepted quote QTE-2026-112', completed: true },
      { stage: 'Approved', date: '2026-08-18 10:36 AM', description: 'Credit check passed automatically', completed: true },
      { stage: 'Credit Confirmed', date: '2026-08-18 10:36 AM', description: '$12,000 fits within available credit', completed: true },
      { stage: 'Stock Allocated', date: '2026-08-18 10:45 AM', description: '100 monitors allocated from Phnom Penh Warehouse', completed: true, active: true },
      { stage: 'Contract Generated', date: '2026-08-18 11:00 AM', description: 'Contract CTR-2026-0057 available for buyer review', completed: true },
      { stage: 'Invoice Issued', date: '2026-08-18 03:20 PM', description: 'Invoice INV-2026-0116 issued for buyer review', completed: true },
      { stage: 'Completed', date: 'Pending', description: 'Awaiting fulfillment completion', completed: false }
    ],
    activity: [
      { id: 'po-act-57-1', title: 'Credit passed', timestamp: '2026-08-18 10:36 AM', actor: 'WholesaleHub System', description: 'Available credit remained positive after PO amount.' },
      { id: 'po-act-57-2', title: 'Stock allocated', timestamp: '2026-08-18 10:45 AM', actor: 'Warehouse Desk', description: 'Allocation proposal prepared for 100 units.' }
    ]
  },
  {
    id: 'po-2026-0052',
    poNumber: 'PO-2026-0052',
    quoteId: 'qte-2026-089',
    quoteNumber: 'QTE-2026-089',
    rfqNumber: 'RFQ-2026-089',
    buyerId: 'buyer-001',
    buyerName: 'Sovannarith Keo',
    companyName: 'ABC Technology Ltd.',
    contactPerson: 'Sovannarith Keo',
    orderDate: '2026-08-12',
    expectedDeliveryDate: '2026-09-15',
    requestedDeliveryDate: '2026-09-15',
    currency: 'USD',
    items: [
      {
        id: 'poi-52-01',
        productId: 'prod-001',
        productName: 'Dell UltraSharp 24" Commercial IPS Display (U2424H)',
        sku: 'MON-001',
        quantity: 120,
        unitPrice: 100,
        subtotal: 12000,
        fulfilledQuantity: 80,
        remainingQuantity: 40,
        allocationStatus: 'Fully Available',
        warehouseAllocation: [
          { warehouseId: 'wh-pp-01', warehouseName: 'Phnom Penh Warehouse', city: 'Phnom Penh', available: 150, allocated: 120 }
        ]
      },
      {
        id: 'poi-52-02',
        productId: 'prod-006',
        productName: 'Samsung PM9A3 3.84TB U.2 PCIe 4.0 NVMe Enterprise SSD',
        sku: 'SSD-NVME4TB',
        quantity: 60,
        unitPrice: 265,
        subtotal: 15900,
        fulfilledQuantity: 30,
        remainingQuantity: 30,
        allocationStatus: 'Fully Available',
        warehouseAllocation: [
          { warehouseId: 'wh-pp-01', warehouseName: 'Phnom Penh Warehouse', city: 'Phnom Penh', available: 240, allocated: 60 }
        ]
      }
    ],
    subtotal: 27900,
    tax: 2790,
    discount: 500,
    shippingFee: 150,
    grandTotal: 30340,
    totalAmount: 30340,
    paymentTerms: 'Net 30 Days Credit',
    shippingAddress: 'ABC Technology Logistics Warehouse, St. 289, Toul Kork, Phnom Penh',
    billingAddress: 'ABC Technology Ltd., St. 289, Toul Kork, Phnom Penh',
    buyerPoReference: 'ABC-BANK-ROLL-2026-Q3',
    internalBuyerNotes: 'Partial shipment accepted because rollout sites are split by week.',
    attachments: ['Banking_Client_PO.pdf'],
    status: 'Partially Shipped',
    stockStatus: 'Allocated',
    shipmentStatus: 'In Transit',
    contractId: 'ctr-2026-0052',
    invoiceId: 'inv-2026-0108',
    assignedRep: {
      id: 'usr-rep-01',
      name: 'David Chen',
      email: 'david.chen@wholesalehub.com',
      title: 'Senior Enterprise Account Executive'
    },
    approval: {
      required: true,
      reason: 'Order exceeded standard approval threshold.',
      status: 'Approved',
      submittedAt: '2026-08-12 02:15 PM',
      reviewedAt: '2026-08-12 04:00 PM'
    },
    inventoryAllocations: [
      {
        productId: 'prod-001',
        sku: 'MON-001',
        productName: 'Dell UltraSharp 24" Commercial IPS Display (U2424H)',
        requestedQty: 120,
        totalAvailable: 240,
        allocatedQty: 120,
        backorderQty: 0,
        result: 'Fully Available',
        warehouses: [
          { warehouseId: 'wh-pp-01', warehouseName: 'Phnom Penh Warehouse', city: 'Phnom Penh', available: 150, allocated: 120 },
          { warehouseId: 'wh-sr-01', warehouseName: 'Siem Reap Warehouse', city: 'Siem Reap', available: 70, allocated: 0 },
          { warehouseId: 'wh-btb-01', warehouseName: 'Battambang Warehouse', city: 'Battambang', available: 20, allocated: 0 }
        ]
      },
      {
        productId: 'prod-006',
        sku: 'SSD-NVME4TB',
        productName: 'Samsung PM9A3 3.84TB U.2 PCIe 4.0 NVMe Enterprise SSD',
        requestedQty: 60,
        totalAvailable: 480,
        allocatedQty: 60,
        backorderQty: 0,
        result: 'Fully Available',
        warehouses: [
          { warehouseId: 'wh-pp-01', warehouseName: 'Phnom Penh Warehouse', city: 'Phnom Penh', available: 240, allocated: 60 },
          { warehouseId: 'wh-sr-01', warehouseName: 'Siem Reap Warehouse', city: 'Siem Reap', available: 160, allocated: 0 },
          { warehouseId: 'wh-btb-01', warehouseName: 'Battambang Warehouse', city: 'Battambang', available: 80, allocated: 0 }
        ]
      }
    ],
    documents: [
      { id: 'pod-52-01', name: 'PO-2026-0052.pdf', type: 'Purchase Order', uploadedDate: '2026-08-12', version: 'v1' },
      { id: 'pod-52-02', name: 'Partial_Shipment_Acknowledgement.pdf', type: 'Fulfillment Note', uploadedDate: '2026-08-17', version: 'v1' }
    ],
    timeline: [
      { stage: 'PO Created', date: '2026-08-12 02:15 PM', description: 'PO created from final negotiated quote', completed: true },
      { stage: 'Approved', date: '2026-08-12 04:00 PM', description: 'Buyer-visible approval completed', completed: true },
      { stage: 'Stock Allocated', date: '2026-08-13 09:00 AM', description: 'All requested stock allocated', completed: true },
      { stage: 'Contract Generated', date: '2026-08-13 11:00 AM', description: 'Contract CTR-2026-0052 generated', completed: true },
      { stage: 'Invoice Issued', date: '2026-08-14 09:30 AM', description: 'Invoice record available for review', completed: true },
      { stage: 'Partially Shipped', date: '2026-08-17 03:40 PM', description: 'First shipment dispatched', completed: true, active: true },
      { stage: 'Completed', date: 'Pending', description: 'Awaiting final delivery', completed: false }
    ],
    activity: [
      { id: 'po-act-52-1', title: 'Partial shipment posted', timestamp: '2026-08-17 03:40 PM', actor: 'Logistics Desk', description: '80 monitors and 30 SSDs marked fulfilled.' }
    ]
  },
  {
    id: 'po-2026-0049',
    poNumber: 'PO-2026-0049',
    quoteId: 'qte-2026-104',
    quoteNumber: 'QTE-2026-104',
    rfqNumber: 'RFQ-2026-104',
    buyerId: 'buyer-001',
    buyerName: 'Sovannarith Keo',
    companyName: 'ABC Technology Ltd.',
    contactPerson: 'Sovannarith Keo',
    orderDate: '2026-08-09',
    expectedDeliveryDate: '2026-09-18',
    requestedDeliveryDate: '2026-09-18',
    currency: 'USD',
    items: [
      {
        id: 'poi-49-01',
        productId: 'prod-002',
        productName: 'Dell PowerEdge R750 2U Rackmount Server',
        sku: 'SRV-R750',
        quantity: 6,
        unitPrice: 3180,
        subtotal: 19080,
        fulfilledQuantity: 0,
        remainingQuantity: 6,
        allocationStatus: 'Fully Available'
      },
      {
        id: 'poi-49-02',
        productId: 'prod-005',
        productName: 'APC Smart-UPS On-Line 3000VA 2U Rack/Tower 230V',
        sku: 'UPS-3000RT',
        quantity: 8,
        unitPrice: 1495,
        subtotal: 11960,
        fulfilledQuantity: 0,
        remainingQuantity: 8,
        allocationStatus: 'Fully Available'
      }
    ],
    subtotal: 31040,
    tax: 3104,
    discount: 450,
    shippingFee: 180,
    grandTotal: 33874,
    totalAmount: 33874,
    paymentTerms: 'Net 30 Days Credit',
    shippingAddress: 'ABC Technology Data Center, Canadia Tower Annex, Phnom Penh',
    billingAddress: 'ABC Technology Ltd., St. 289, Toul Kork, Phnom Penh',
    buyerPoReference: 'ABC-EDGE-RACK-2026',
    internalBuyerNotes: 'Hold for final rack readiness date.',
    attachments: ['Edge_Rack_PO_Draft.pdf'],
    status: 'Draft',
    stockStatus: 'Pending',
    shipmentStatus: 'Pending',
    assignedRep: {
      id: 'usr-rep-01',
      name: 'David Chen',
      email: 'david.chen@wholesalehub.com',
      title: 'Senior Enterprise Account Executive'
    },
    approval: {
      required: false,
      status: 'Not Required'
    },
    timeline: [
      { stage: 'Draft Saved', date: '2026-08-09 05:15 PM', description: 'Buyer saved draft PO from edge rack quote', completed: true, active: true },
      { stage: 'Pending Approval', date: 'Not submitted', description: 'Submit PO to begin approval simulation', completed: false }
    ],
    activity: [
      { id: 'po-act-49-1', title: 'Draft saved', timestamp: '2026-08-09 05:15 PM', actor: 'Sovannarith Keo', description: 'Draft retained for later review.' }
    ]
  }
];

export const mockContracts: Contract[] = [
  {
    id: 'ctr-2026-0018',
    contractNumber: 'CTR-2026-0018',
    title: 'Enterprise IT Hardware Supply Master Agreement',
    buyerId: 'buyer-001',
    companyName: 'ABC Technology Ltd.',
    poNumber: 'PO-2026-0041',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    renewalDate: '2026-11-15',
    contractValue: 120000,
    currency: 'USD',
    paymentTerms: 'Net 30 Days with $75,000 Revolving Credit Facility',
    status: 'Active',
    milestones: [
      { title: 'Q1 Hardware Batch Delivery', dueDate: '2026-03-31', amount: 30000, status: 'Completed' },
      { title: 'Q2 Infrastructure Expansion', dueDate: '2026-06-30', amount: 35000, status: 'Completed' },
      { title: 'Q3 Enterprise Switches & Displays', dueDate: '2026-09-30', amount: 30000, status: 'Pending' },
      { title: 'Q4 Annual Spares Reserve', dueDate: '2026-12-15', amount: 25000, status: 'Pending' }
    ],
    documents: [
      { title: 'Master_Supply_Agreement_Signed.pdf', fileSize: '3.8 MB', uploadedDate: '2026-01-02' },
      { title: 'SLA_Service_Level_Terms_Addendum.pdf', fileSize: '1.4 MB', uploadedDate: '2026-01-02' }
    ]
  },
  {
    id: 'ctr-2026-0057',
    contractNumber: 'CTR-2026-0057',
    title: 'Municipal Monitor Replacement Supply Agreement',
    buyerId: 'buyer-001',
    buyerName: 'Sovannarith Keo',
    companyName: 'ABC Technology Ltd.',
    buyerGroup: 'Corporate',
    poId: 'po-2026-0057',
    poNumber: 'PO-2026-0057',
    quoteId: 'qte-2026-112',
    quoteNumber: 'QTE-2026-112',
    startDate: '2026-08-18',
    endDate: '2026-12-18',
    renewalDate: '2026-11-20',
    contractValue: 12000,
    currency: 'USD',
    terms: 'Corporate monitor rollout fixed-price supply terms',
    paymentTerms: 'Net 30 Days Credit',
    deliveryTerms: 'DDP Phnom Penh receiving dock with morning appointment window',
    productsCovered: ['Dell UltraSharp 24" Commercial IPS Display (U2424H)'],
    buyerResponsibilities: ['Provide delivery appointment window', 'Inspect cartons at receiving dock', 'Submit serial acceptance within 48 hours'],
    supplierResponsibilities: ['Allocate confirmed stock', 'Provide pallet labels and serial list', 'Honor three-year manufacturer warranty'],
    assignedRep: {
      id: 'usr-rep-01',
      name: 'David Chen',
      email: 'david.chen@wholesalehub.com',
      title: 'Senior Enterprise Account Executive'
    },
    status: 'Active',
    renewalStatus: 'Not Due',
    milestones: [
      { id: 'mil-57-1', title: 'Contract Signed', dueDate: '2026-08-18', status: 'Completed', completedDate: '2026-08-18', notes: 'Terms accepted from PO-2026-0057' },
      { id: 'mil-57-2', title: 'Initial Payment Authorization', dueDate: '2026-09-12', amount: 12000, status: 'Pending', notes: 'Due according to Net 30 invoice cycle' },
      { id: 'mil-57-3', title: 'First Delivery Window', dueDate: '2026-09-12', status: 'Pending', notes: '100 displays staged for delivery' },
      { id: 'mil-57-4', title: 'Final Acceptance', dueDate: '2026-09-15', status: 'Pending', notes: 'Buyer acceptance after receiving inspection' }
    ],
    documents: [
      { id: 'doc-57-1', title: 'Master Contract PDF', name: 'CTR-2026-0057_Master_Contract.pdf', type: 'Contract', fileSize: '2.8 MB', uploadedDate: '2026-08-18', version: 'v1' },
      { id: 'doc-57-2', title: 'Purchase Order', name: 'PO-2026-0057.pdf', type: 'PO', fileSize: '940 KB', uploadedDate: '2026-08-18', version: 'v1' },
      { id: 'doc-57-3', title: 'Quotation', name: 'QTE-2026-112.pdf', type: 'Quote', fileSize: '820 KB', uploadedDate: '2026-08-18', version: 'v1' },
      { id: 'doc-57-4', title: 'Business Terms', name: 'Corporate_Monitor_Rollout_Terms.pdf', type: 'Terms', fileSize: '1.1 MB', uploadedDate: '2026-08-18', version: 'v1' }
    ],
    activityTimeline: [
      { stage: 'Contract Generated', date: '2026-08-18 11:00 AM', actor: 'WholesaleHub System', description: 'Generated after PO-2026-0057 approval.' },
      { stage: 'Buyer Accepted Terms', date: '2026-08-18 11:20 AM', actor: 'Sovannarith Keo', description: 'Buyer accepted commercial and delivery terms.' },
      { stage: 'Contract Activated', date: '2026-08-18 11:30 AM', actor: 'David Chen', description: 'Contract marked active for fulfillment.' }
    ]
  },
  {
    id: 'ctr-2026-0052',
    contractNumber: 'CTR-2026-0052',
    title: 'Banking Client Workstation Refresh Contract',
    buyerId: 'buyer-001',
    buyerName: 'Sovannarith Keo',
    companyName: 'ABC Technology Ltd.',
    buyerGroup: 'Corporate',
    poId: 'po-2026-0052',
    poNumber: 'PO-2026-0052',
    quoteId: 'qte-2026-089',
    quoteNumber: 'QTE-2026-089',
    startDate: '2026-08-13',
    endDate: '2026-09-11',
    renewalDate: '2026-08-28',
    contractValue: 30340,
    currency: 'USD',
    terms: 'Fixed-price workstation refresh with split delivery milestones',
    paymentTerms: 'Net 30 Days Credit',
    deliveryTerms: 'DDP Phnom Penh CBD office, split shipment accepted',
    productsCovered: ['Dell UltraSharp 24" Commercial IPS Display', 'Samsung PM9A3 Enterprise SSD'],
    buyerResponsibilities: ['Confirm site access windows', 'Accept partial shipment notes', 'Submit final receiving sign-off'],
    supplierResponsibilities: ['Maintain allocated stock', 'Provide batch serial report', 'Coordinate local freight handoff'],
    assignedRep: {
      id: 'usr-rep-01',
      name: 'David Chen',
      email: 'david.chen@wholesalehub.com',
      title: 'Senior Enterprise Account Executive'
    },
    status: 'Near Expiry',
    renewalStatus: 'Reminder Sent',
    milestones: [
      { id: 'mil-52-1', title: 'Contract Signed', dueDate: '2026-08-13', status: 'Completed', completedDate: '2026-08-13' },
      { id: 'mil-52-2', title: 'First Shipment', dueDate: '2026-08-17', status: 'Completed', completedDate: '2026-08-17', notes: 'Initial monitor and SSD batch dispatched' },
      { id: 'mil-52-3', title: 'Second Shipment', dueDate: '2026-09-05', status: 'In Progress', amount: 15170, notes: 'Remaining quantity staged' },
      { id: 'mil-52-4', title: 'Final Delivery', dueDate: '2026-09-11', status: 'Pending', amount: 15170 },
      { id: 'mil-52-5', title: 'Final Payment', dueDate: '2026-10-11', status: 'Pending', amount: 30340 }
    ],
    documents: [
      { id: 'doc-52-1', title: 'Master Contract PDF', name: 'CTR-2026-0052_Master_Contract.pdf', type: 'Contract', fileSize: '3.1 MB', uploadedDate: '2026-08-13', version: 'v1' },
      { id: 'doc-52-2', title: 'Purchase Order', name: 'PO-2026-0052.pdf', type: 'PO', fileSize: '1 MB', uploadedDate: '2026-08-13', version: 'v1' },
      { id: 'doc-52-3', title: 'Quotation', name: 'QTE-2026-089.pdf', type: 'Quote', fileSize: '900 KB', uploadedDate: '2026-08-13', version: 'v1' },
      { id: 'doc-52-4', title: 'Addendum', name: 'Split_Delivery_Addendum.pdf', type: 'Addendum', fileSize: '640 KB', uploadedDate: '2026-08-17', version: 'v2' }
    ],
    activityTimeline: [
      { stage: 'Contract Generated', date: '2026-08-13 11:00 AM', actor: 'WholesaleHub System', description: 'Generated from approved PO.' },
      { stage: 'Contract Reviewed', date: '2026-08-13 02:10 PM', actor: 'David Chen', description: 'Commercial terms checked against quote.' },
      { stage: 'Milestone Completed', date: '2026-08-17 03:40 PM', actor: 'Logistics Desk', description: 'First shipment milestone completed.' },
      { stage: 'Renewal Reminder Sent', date: '2026-08-18 08:30 AM', actor: 'WholesaleHub System', description: 'Near-expiry renewal reminder sent to buyer.' }
    ]
  },
  {
    id: 'ctr-2026-0041',
    contractNumber: 'CTR-2026-0041',
    title: 'Branch Campus LAN Expansion Agreement',
    buyerId: 'buyer-001',
    buyerName: 'Sovannarith Keo',
    companyName: 'ABC Technology Ltd.',
    buyerGroup: 'Corporate',
    poId: 'po-2026-0041',
    poNumber: 'PO-2026-0041',
    quoteId: 'qte-2026-084',
    quoteNumber: 'QTE-2026-084',
    startDate: '2026-08-04',
    endDate: '2026-11-04',
    renewalDate: '2026-10-10',
    contractValue: 13350,
    currency: 'USD',
    terms: 'Fixed-price network expansion supply terms',
    paymentTerms: 'Net 30 Days Credit',
    deliveryTerms: 'DDP school campus receiving desk',
    productsCovered: ['Cisco Catalyst 1000 Series 48-Port PoE+ Managed Switch'],
    buyerResponsibilities: ['Provide site access and rack labels', 'Confirm receiving signature'],
    supplierResponsibilities: ['Reserve project stock', 'Provide switch serial list and warranty details'],
    assignedRep: {
      id: 'usr-rep-01',
      name: 'David Chen',
      email: 'david.chen@wholesalehub.com',
      title: 'Senior Enterprise Account Executive'
    },
    status: 'Pending Signature',
    renewalStatus: 'Not Due',
    milestones: [
      { id: 'mil-41-1', title: 'Contract Generated', dueDate: '2026-08-04', status: 'Completed', completedDate: '2026-08-04' },
      { id: 'mil-41-2', title: 'Buyer Signature', dueDate: '2026-08-22', status: 'Pending', notes: 'Awaiting buyer signature confirmation' },
      { id: 'mil-41-3', title: 'Shipment Release', dueDate: '2026-08-24', status: 'Pending' }
    ],
    documents: [
      { id: 'doc-41-1', title: 'Master Contract PDF', name: 'CTR-2026-0041_Draft.pdf', type: 'Contract', fileSize: '2.4 MB', uploadedDate: '2026-08-04', version: 'v1' },
      { id: 'doc-41-2', title: 'Purchase Order', name: 'PO-2026-0041.pdf', type: 'PO', fileSize: '780 KB', uploadedDate: '2026-08-04', version: 'v1' }
    ],
    activityTimeline: [
      { stage: 'Contract Generated', date: '2026-08-04 10:20 AM', actor: 'WholesaleHub System', description: 'Contract prepared from PO-2026-0041.' },
      { stage: 'Contract Reviewed', date: '2026-08-05 09:00 AM', actor: 'David Chen', description: 'Contract ready for buyer signature.' }
    ]
  },
  {
    id: 'ctr-2025-0090',
    contractNumber: 'CTR-2025-0090',
    title: 'Annual Enterprise Storage Supply Framework',
    buyerId: 'buyer-001',
    buyerName: 'Sovannarith Keo',
    companyName: 'ABC Technology Ltd.',
    buyerGroup: 'Corporate',
    poNumber: 'PO-2025-0090',
    startDate: '2025-08-01',
    endDate: '2026-07-31',
    renewalDate: '2026-07-01',
    contractValue: 68000,
    currency: 'USD',
    terms: 'Annual enterprise storage reserve framework',
    paymentTerms: 'Net 30 Days Credit',
    deliveryTerms: 'Scheduled monthly replenishment batches',
    productsCovered: ['Samsung PM9A3 Enterprise SSD', 'Bulk Components & Storage'],
    buyerResponsibilities: ['Submit rolling forecast', 'Confirm monthly call-off quantities'],
    supplierResponsibilities: ['Maintain reserve availability', 'Provide monthly price review'],
    assignedRep: {
      id: 'usr-rep-01',
      name: 'David Chen',
      email: 'david.chen@wholesalehub.com',
      title: 'Senior Enterprise Account Executive'
    },
    status: 'Renewed',
    renewalStatus: 'Renewed',
    milestones: [
      { id: 'mil-90-1', title: 'Contract Signed', dueDate: '2025-08-01', status: 'Completed', completedDate: '2025-08-01' },
      { id: 'mil-90-2', title: 'Final Delivery', dueDate: '2026-07-20', status: 'Completed', completedDate: '2026-07-20' },
      { id: 'mil-90-3', title: 'Renewal Completed', dueDate: '2026-07-31', status: 'Completed', completedDate: '2026-07-28' }
    ],
    documents: [
      { id: 'doc-90-1', title: 'Master Contract PDF', name: 'CTR-2025-0090_Master.pdf', type: 'Contract', fileSize: '3.5 MB', uploadedDate: '2025-08-01', version: 'v1' },
      { id: 'doc-90-2', title: 'Renewal Addendum', name: 'CTR-2025-0090_Renewal_Addendum.pdf', type: 'Addendum', fileSize: '1.2 MB', uploadedDate: '2026-07-28', version: 'v2' }
    ],
    activityTimeline: [
      { stage: 'Contract Activated', date: '2025-08-01', actor: 'WholesaleHub System', description: 'Annual storage framework began.' },
      { stage: 'Renewal Requested', date: '2026-07-01', actor: 'Sovannarith Keo', description: 'Buyer requested annual renewal.' },
      { stage: 'Contract Renewed', date: '2026-07-28', actor: 'David Chen', description: 'Renewal addendum completed.' }
    ]
  },
  {
    id: 'ctr-2025-0044',
    contractNumber: 'CTR-2025-0044',
    title: 'Legacy Office Printer Supply Agreement',
    buyerId: 'buyer-001',
    buyerName: 'Sovannarith Keo',
    companyName: 'ABC Technology Ltd.',
    buyerGroup: 'Corporate',
    poNumber: 'PO-2025-0044',
    startDate: '2025-02-01',
    endDate: '2026-01-31',
    renewalDate: '2025-12-31',
    contractValue: 24000,
    currency: 'USD',
    terms: 'Printer fleet supply and replacement terms',
    paymentTerms: 'Net 30 Days Credit',
    deliveryTerms: 'Regional depot delivery by call-off schedule',
    productsCovered: ['HP LaserJet Enterprise Flow MFP M635z'],
    buyerResponsibilities: ['Submit call-off schedule', 'Confirm receiving dock availability'],
    supplierResponsibilities: ['Hold replacement parts', 'Provide service documentation'],
    status: 'Expired',
    renewalStatus: 'Not Due',
    milestones: [
      { id: 'mil-44-1', title: 'Contract Signed', dueDate: '2025-02-01', status: 'Completed', completedDate: '2025-02-01' },
      { id: 'mil-44-2', title: 'Final Payment', dueDate: '2026-01-31', status: 'Completed', completedDate: '2026-01-29' }
    ],
    documents: [
      { id: 'doc-44-1', title: 'Master Contract PDF', name: 'CTR-2025-0044_Master.pdf', type: 'Contract', fileSize: '2.2 MB', uploadedDate: '2025-02-01', version: 'v1' }
    ],
    activityTimeline: [
      { stage: 'Contract Generated', date: '2025-02-01', actor: 'WholesaleHub System', description: 'Legacy printer contract generated.' },
      { stage: 'Contract Expired', date: '2026-01-31', actor: 'WholesaleHub System', description: 'Contract term completed.' }
    ]
  }
];

export const mockInvoices: Invoice[] = [
  {
    id: 'inv-2026-0116',
    invoiceNumber: 'INV-2026-0116',
    poId: 'po-2026-0057',
    poNumber: 'PO-2026-0057',
    quoteId: 'qte-2026-112',
    quoteNumber: 'QTE-2026-112',
    contractId: 'ctr-2026-0057',
    contractNumber: 'CTR-2026-0057',
    shipmentIds: ['shp-2026-0101'],
    buyerId: 'buyer-001',
    companyName: 'ABC Technology Ltd.',
    contactPerson: 'Sovannarith Keo',
    taxId: 'KHM-TAX-98234102',
    billingAddress: 'Floor 3, Building 45, St. 289, Boeung Kak 1, Toul Kork, Phnom Penh',
    issueDate: '2026-08-18',
    dueDate: '2026-09-17',
    paymentTerms: 'Net 30 Days',
    currency: 'USD',
    items: [
      {
        id: 'invi-116-1',
        productId: 'prod-001',
        sku: 'MON-001',
        productName: 'Dell UltraSharp 24" Commercial IPS Display (U2424H)',
        description: 'Municipal monitor rollout batch',
        quantity: 100,
        unitPrice: 112,
        discount: 480,
        tax: 1120,
        subtotal: 11200,
        amount: 11200
      },
      {
        id: 'invi-116-2',
        sku: 'FRT-PNH',
        productName: 'Dedicated Freight and Pallet Handling',
        description: 'Scheduled Phnom Penh receiving dock delivery',
        quantity: 1,
        unitPrice: 160,
        discount: 0,
        tax: 0,
        subtotal: 160,
        amount: 160
      }
    ],
    subtotal: 11360,
    tax: 1120,
    taxAmount: 1120,
    discount: 480,
    shipping: 0,
    total: 12000,
    totalAmount: 12000,
    paidAmount: 0,
    balanceDue: 12000,
    payments: [],
    activity: [
      {
        id: 'inv-act-116-1',
        title: 'Invoice issued',
        timestamp: '2026-08-18 03:20 PM',
        actor: 'WholesaleHub Finance',
        description: 'Invoice generated from approved PO-2026-0057 and active contract CTR-2026-0057.'
      }
    ],
    status: 'Issued'
  },
  {
    id: 'inv-2026-0112',
    invoiceNumber: 'INV-2026-0112',
    poId: 'po-2026-0041',
    poNumber: 'PO-2026-0041',
    quoteId: 'qte-2026-084',
    quoteNumber: 'QTE-2026-084',
    contractId: 'ctr-2026-0041',
    contractNumber: 'CTR-2026-0041',
    shipmentIds: ['shp-2026-0092'],
    buyerId: 'buyer-001',
    companyName: 'ABC Technology Ltd.',
    contactPerson: 'Sovannarith Keo',
    taxId: 'KHM-TAX-98234102',
    billingAddress: 'Building 45, St. 289, Boeung Kak 1, Toul Kork, Phnom Penh',
    issueDate: '2026-08-05',
    dueDate: '2026-09-04',
    paymentTerms: 'Net 30 Days',
    currency: 'USD',
    items: [
      {
        id: 'invi-1',
        productId: 'prod-003',
        sku: 'NET-SW48P',
        productName: 'Cisco Catalyst 1000 Series 48-Port PoE+ Managed Switch',
        description: 'Cisco Catalyst 1000 48-Port PoE+ Managed Switch (NET-SW48P)',
        quantity: 15,
        unitPrice: 820,
        discount: 300,
        tax: 1230,
        subtotal: 12300,
        amount: 12300
      },
      {
        id: 'invi-2',
        sku: 'FRT-EXP',
        productName: 'Enterprise Dedicated Freight Delivery & Pallet Handling',
        description: 'Enterprise Dedicated Freight Delivery & Pallet Handling',
        quantity: 1,
        unitPrice: 120,
        discount: 0,
        tax: 0,
        subtotal: 120,
        amount: 120
      }
    ],
    subtotal: 12420,
    tax: 1230,
    taxAmount: 1230,
    discount: 300,
    shipping: 0,
    total: 13350,
    totalAmount: 13350,
    paidAmount: 0,
    balanceDue: 13350,
    payments: [],
    activity: [
      {
        id: 'inv-act-112-1',
        title: 'Invoice issued',
        timestamp: '2026-08-05 02:00 PM',
        actor: 'WholesaleHub Finance',
        description: 'Invoice generated after credit approval and warehouse allocation.'
      }
    ],
    status: 'Issued'
  },
  {
    id: 'inv-2026-0108',
    invoiceNumber: 'INV-2026-0108',
    poId: 'po-2026-0052',
    poNumber: 'PO-2026-0052',
    quoteId: 'qte-2026-089',
    quoteNumber: 'QTE-2026-089',
    contractId: 'ctr-2026-0052',
    contractNumber: 'CTR-2026-0052',
    shipmentIds: ['shp-2026-0098', 'shp-2026-0099'],
    buyerId: 'buyer-001',
    companyName: 'ABC Technology Ltd.',
    contactPerson: 'Sovannarith Keo',
    taxId: 'KHM-TAX-98234102',
    billingAddress: 'Floor 3, Building 45, St. 289, Boeung Kak 1, Toul Kork, Phnom Penh',
    issueDate: '2026-08-14',
    dueDate: '2026-08-23',
    paymentTerms: 'Net 30 Days',
    currency: 'USD',
    items: [
      {
        id: 'invi-108-1',
        productId: 'prod-001',
        sku: 'MON-001',
        productName: 'Dell UltraSharp 24" Commercial IPS Display (U2424H)',
        description: 'Banking client workstation display rollout',
        quantity: 120,
        unitPrice: 100,
        discount: 300,
        tax: 1200,
        subtotal: 12000,
        amount: 12000
      },
      {
        id: 'invi-108-2',
        productId: 'prod-006',
        sku: 'SSD-NVME4TB',
        productName: 'Samsung PM9A3 3.84TB U.2 PCIe 4.0 NVMe Enterprise SSD',
        description: 'Enterprise NVMe storage expansion',
        quantity: 60,
        unitPrice: 265,
        discount: 200,
        tax: 1590,
        subtotal: 15900,
        amount: 15900
      },
      {
        id: 'invi-108-3',
        sku: 'FRT-SPLIT',
        productName: 'Split Shipment Handling',
        description: 'Two-stage bank branch delivery schedule',
        quantity: 1,
        unitPrice: 150,
        discount: 0,
        tax: 0,
        subtotal: 150,
        amount: 150
      }
    ],
    subtotal: 28050,
    tax: 2790,
    taxAmount: 2790,
    discount: 500,
    shipping: 0,
    total: 30340,
    totalAmount: 30340,
    paidAmount: 8500,
    balanceDue: 21840,
    payments: [
      {
        id: 'pay-2026-041',
        paymentId: 'PAY-2026-041',
        invoiceId: 'inv-2026-0108',
        date: '2026-08-12',
        method: 'Bank Transfer',
        amount: 5000,
        reference: 'ABA-FT-26230918820',
        status: 'Completed'
      },
      {
        id: 'pay-2026-052',
        paymentId: 'PAY-2026-052',
        invoiceId: 'inv-2026-0108',
        date: '2026-08-16',
        method: 'Bank Transfer',
        amount: 3500,
        reference: 'ABA-FT-26231300891',
        status: 'Completed'
      }
    ],
    activity: [
      {
        id: 'inv-act-108-1',
        title: 'Invoice issued',
        timestamp: '2026-08-14 09:30 AM',
        actor: 'WholesaleHub Finance',
        description: 'Invoice generated for split shipment contract CTR-2026-0052.'
      },
      {
        id: 'inv-act-108-2',
        title: 'Partial payment recorded',
        timestamp: '2026-08-16 04:05 PM',
        actor: 'Accounts Receivable',
        description: 'Bank transfer PAY-2026-052 reconciled against open balance.'
      }
    ],
    status: 'Due Soon'
  },
  {
    id: 'inv-2026-0101',
    invoiceNumber: 'INV-2026-0101',
    poId: 'po-2026-0049',
    poNumber: 'PO-2026-0049',
    quoteId: 'qte-2026-104',
    quoteNumber: 'QTE-2026-104',
    buyerId: 'buyer-001',
    companyName: 'ABC Technology Ltd.',
    contactPerson: 'Sovannarith Keo',
    taxId: 'KHM-TAX-98234102',
    billingAddress: 'Floor 3, Building 45, St. 289, Boeung Kak 1, Toul Kork, Phnom Penh',
    issueDate: '2026-07-10',
    dueDate: '2026-08-10',
    paymentTerms: 'Net 30 Days',
    currency: 'USD',
    items: [
      {
        id: 'invi-101-1',
        productId: 'prod-004',
        sku: 'UPS-6KVA',
        productName: 'APC Smart-UPS SRT 6kVA Rack UPS',
        description: 'Emergency UPS replacement reserve',
        quantity: 1,
        unitPrice: 2950,
        discount: 0,
        tax: 300,
        subtotal: 2950,
        amount: 2950
      }
    ],
    subtotal: 2950,
    tax: 300,
    taxAmount: 300,
    discount: 0,
    shipping: 0,
    total: 3250,
    totalAmount: 3250,
    paidAmount: 0,
    balanceDue: 3250,
    payments: [],
    status: 'Overdue'
  },
  {
    id: 'inv-2026-0089',
    invoiceNumber: 'INV-2026-0089',
    poId: 'po-2026-0028',
    poNumber: 'PO-2026-0028',
    buyerId: 'buyer-001',
    companyName: 'ABC Technology Ltd.',
    contactPerson: 'Sovannarith Keo',
    taxId: 'KHM-TAX-98234102',
    billingAddress: 'Building 45, St. 289, Boeung Kak 1, Toul Kork, Phnom Penh',
    issueDate: '2026-07-13',
    dueDate: '2026-08-12',
    paymentTerms: 'Net 30 Days',
    currency: 'USD',
    items: [
      {
        id: 'invi-3',
        productId: 'prod-002',
        sku: 'SRV-R750',
        productName: 'Dell PowerEdge R750 2U Rackmount Server',
        description: 'Dell PowerEdge R750 2U Rackmount Server (SRV-R750)',
        quantity: 4,
        unitPrice: 3200,
        discount: 0,
        tax: 1280,
        subtotal: 12800,
        amount: 12800
      },
      {
        id: 'invi-4',
        sku: 'FRT-INS',
        productName: 'Express Insured Logistics Delivery',
        description: 'Express Insured Logistics Delivery',
        quantity: 1,
        unitPrice: 200,
        discount: 0,
        tax: 0,
        subtotal: 200,
        amount: 200
      }
    ],
    subtotal: 13000,
    tax: 1280,
    taxAmount: 1280,
    discount: 0,
    shipping: 0,
    total: 14280,
    totalAmount: 14280,
    paidAmount: 14280,
    balanceDue: 0,
    payments: [
      {
        id: 'pay-2026-029',
        paymentId: 'PAY-2026-029',
        invoiceId: 'inv-2026-0089',
        date: '2026-08-12',
        method: 'Bank Transfer',
        amount: 14280,
        reference: 'ABA-FT-26227891044',
        status: 'Completed'
      }
    ],
    status: 'Paid'
  },
  {
    id: 'inv-2026-0097',
    invoiceNumber: 'INV-2026-0097',
    poId: 'po-2026-0037',
    poNumber: 'PO-2026-0037',
    buyerId: 'buyer-001',
    companyName: 'ABC Technology Ltd.',
    contactPerson: 'Sovannarith Keo',
    taxId: 'KHM-TAX-98234102',
    billingAddress: 'Floor 3, Building 45, St. 289, Boeung Kak 1, Toul Kork, Phnom Penh',
    issueDate: '2026-07-28',
    dueDate: '2026-08-27',
    paymentTerms: 'Net 30 Days',
    currency: 'USD',
    items: [
      {
        id: 'invi-097-1',
        productId: 'prod-005',
        sku: 'CAM-IP8MP',
        productName: 'Hikvision 8MP PoE Security Camera Bulk Pack',
        description: 'Branch office surveillance refresh',
        quantity: 80,
        unitPrice: 276,
        discount: 500,
        tax: 2240,
        subtotal: 22080,
        amount: 22080
      }
    ],
    subtotal: 22080,
    tax: 2240,
    taxAmount: 2240,
    discount: 0,
    shipping: 0,
    total: 24320,
    totalAmount: 24320,
    paidAmount: 24320,
    balanceDue: 0,
    payments: [
      {
        id: 'pay-2026-050',
        paymentId: 'PAY-2026-050',
        invoiceId: 'inv-2026-0097',
        date: '2026-08-16',
        method: 'Bank Transfer',
        amount: 24320,
        reference: 'ABA-FT-26230945517',
        status: 'Completed'
      }
    ],
    status: 'Paid'
  },
  {
    id: 'inv-2026-0120',
    invoiceNumber: 'INV-2026-0120',
    poId: 'po-2026-0058',
    poNumber: 'PO-2026-0058',
    quoteId: 'qte-2026-113',
    quoteNumber: 'QTE-2026-113',
    buyerId: 'buyer-001',
    companyName: 'ABC Technology Ltd.',
    contactPerson: 'Sovannarith Keo',
    taxId: 'KHM-TAX-98234102',
    billingAddress: 'Floor 3, Building 45, St. 289, Boeung Kak 1, Toul Kork, Phnom Penh',
    issueDate: '2026-08-18',
    dueDate: '2026-09-17',
    paymentTerms: 'Net 30 Days',
    currency: 'USD',
    items: [
      {
        id: 'invi-120-1',
        productId: 'prod-006',
        sku: 'SSD-NVME4TB',
        productName: 'Samsung PM9A3 3.84TB U.2 PCIe 4.0 NVMe Enterprise SSD',
        description: 'Draft invoice pending PO approval release',
        quantity: 90,
        unitPrice: 268,
        discount: 900,
        tax: 2412,
        subtotal: 24120,
        amount: 24120
      }
    ],
    subtotal: 24120,
    tax: 2412,
    taxAmount: 2412,
    discount: 900,
    shipping: 250,
    total: 25882,
    totalAmount: 25882,
    paidAmount: 0,
    balanceDue: 25882,
    payments: [],
    status: 'Draft'
  }
];

export const mockCreditActivity: CreditActivity[] = [
  {
    id: 'cred-act-001',
    buyerId: 'buyer-001',
    date: '2026-08-18 03:20 PM',
    activity: 'Invoice issued',
    reference: 'INV-2026-0116',
    debit: 12000,
    credit: 0,
    balance: 18000
  },
  {
    id: 'cred-act-002',
    buyerId: 'buyer-001',
    date: '2026-08-16 04:05 PM',
    activity: 'Invoice paid',
    reference: 'PAY-2026-052',
    debit: 0,
    credit: 3500,
    balance: 30000
  },
  {
    id: 'cred-act-003',
    buyerId: 'buyer-001',
    date: '2026-08-12 11:20 AM',
    activity: 'Invoice paid',
    reference: 'PAY-2026-041',
    debit: 0,
    credit: 5000,
    balance: 26500
  },
  {
    id: 'cred-act-004',
    buyerId: 'buyer-001',
    date: '2026-08-05 02:00 PM',
    activity: 'PO approved',
    reference: 'PO-2026-0041',
    debit: 13350,
    credit: 0,
    balance: 21500
  },
  {
    id: 'cred-act-005',
    buyerId: 'buyer-001',
    date: '2026-07-28 09:00 AM',
    activity: 'Credit limit adjustment',
    reference: 'CR-LIMIT-2026-007',
    debit: 0,
    credit: 5000,
    balance: 34850
  }
];

export const mockShipments: Shipment[] = [
  {
    id: 'shp-2026-0101',
    shipmentNumber: 'SHP-2026-0101',
    poId: 'po-2026-0057',
    poNumber: 'PO-2026-0057',
    invoiceId: 'inv-2026-0116',
    contractId: 'ctr-2026-0057',
    buyerId: 'buyer-001',
    companyName: 'ABC Technology Ltd.',
    warehouseId: 'wh-pp-01',
    warehouseName: 'Phnom Penh Main Distribution Hub',
    warehouse: 'Phnom Penh Main Distribution Hub',
    originWarehouse: 'Phnom Penh Warehouse',
    originAddress: 'Veng Sreng Blvd, Sangkat Choam Chao, Khan Por Senchey',
    destinationAddress: 'ABC Technology Logistics Warehouse, St. 289 Receiving Gate B, Toul Kork, Phnom Penh',
    deliveryAddress: 'ABC Technology Logistics Warehouse, St. 289 Receiving Gate B, Toul Kork, Phnom Penh',
    contactPerson: 'Dalin Phan',
    carrier: 'DHL Global Forwarding (Cambodia)',
    trackingNumber: 'DHL-KHM-889103512',
    shipDate: '2026-08-19',
    dispatchDate: '2026-08-19',
    estimatedDelivery: '2026-08-21',
    packagesCount: 5,
    serviceLevel: 'Dedicated truckload',
    deliveryWindow: '08:00 AM - 11:00 AM',
    totalOrdered: 100,
    totalShipped: 0,
    totalDelivered: 0,
    status: 'Ready',
    items: [
      {
        id: 'shipi-101-1',
        productId: 'prod-001',
        sku: 'MON-001',
        productName: 'Dell UltraSharp 24" Commercial IPS Display (U2424H)',
        orderedQty: 100,
        shippedQty: 0,
        deliveredQty: 0,
        unit: 'Units'
      }
    ],
    timeline: [
      { id: 'trk-101-1', status: 'Order Confirmed', location: 'WholesaleHub Finance', timestamp: '2026-08-18 03:20 PM', description: 'Invoice issued and fulfillment release confirmed.', completed: true },
      { id: 'trk-101-2', status: 'Stock Allocated', location: 'Phnom Penh Warehouse', timestamp: '2026-08-18 04:10 PM', description: '100 monitors reserved for outbound staging.', completed: true },
      { id: 'trk-101-3', status: 'Preparing Shipment', location: 'Outbound Bay 2', timestamp: '2026-08-18 05:30 PM', description: 'Pallet labels printed and carton count verified.', completed: true },
      { id: 'trk-101-4', status: 'Dispatched', location: 'Carrier Dock', timestamp: 'Scheduled 2026-08-19 09:00 AM', description: 'Awaiting carrier pickup.', completed: false, active: true },
      { id: 'trk-101-5', status: 'In Transit', location: 'Phnom Penh Corridor', timestamp: 'Pending', description: 'Direct route to buyer warehouse.', completed: false },
      { id: 'trk-101-6', status: 'Out for Delivery', location: 'Toul Kork Depot', timestamp: 'Pending', description: 'Delivery appointment to be confirmed.', completed: false },
      { id: 'trk-101-7', status: 'Delivered', location: 'ABC Technology Receiving Dock', timestamp: 'Pending', description: 'Proof of delivery required.', completed: false }
    ]
  },
  {
    id: 'shp-2026-0092',
    shipmentNumber: 'SHP-2026-0092',
    poId: 'po-2026-0041',
    poNumber: 'PO-2026-0041',
    invoiceId: 'inv-2026-0112',
    contractId: 'ctr-2026-0041',
    buyerId: 'buyer-001',
    companyName: 'ABC Technology Ltd.',
    warehouseId: 'wh-pp-01',
    warehouseName: 'Phnom Penh Main Distribution Hub',
    warehouse: 'Phnom Penh Main Distribution Hub',
    originWarehouse: 'Phnom Penh Main Distribution Hub',
    originAddress: 'Veng Sreng Blvd, Sangkat Choam Chao, Khan Por Senchey',
    destinationAddress: 'ABC Technology Logistics Warehouse, St. 289 Receiving Gate B, Toul Kork, Phnom Penh',
    deliveryAddress: 'ABC Technology Logistics Warehouse, St. 289 Receiving Gate B, Toul Kork, Phnom Penh',
    contactPerson: 'Dalin Phan',
    carrier: 'DHL Global Forwarding (Cambodia)',
    trackingNumber: 'DHL-KHM-889102941',
    shipDate: '2026-08-17',
    dispatchDate: '2026-08-17',
    estimatedDelivery: '2026-08-20',
    packagesCount: 2,
    serviceLevel: 'Insured pallet freight',
    deliveryWindow: '02:00 PM - 05:00 PM',
    totalOrdered: 15,
    totalShipped: 0,
    totalDelivered: 0,
    status: 'Preparing',
    items: [
      {
        id: 'shipi-092-1',
        productId: 'prod-003',
        sku: 'NET-SW48P',
        productName: 'Cisco Catalyst 1000 48-Port PoE+ Managed Switch',
        orderedQty: 15,
        shippedQty: 15,
        deliveredQty: 0,
        unit: 'Units'
      }
    ],
    timeline: [
      { id: 'trk-092-1', status: 'Order Confirmed', location: 'Phnom Penh Hub', timestamp: '2026-08-04 10:00 AM', description: 'Purchase order verified against credit line.', completed: true },
      { id: 'trk-092-2', status: 'Stock Allocated', location: 'Warehouse Bay 4', timestamp: '2026-08-05 09:00 AM', description: '15 switches reserved from Phnom Penh stock.', completed: true },
      { id: 'trk-092-3', status: 'Preparing Shipment', location: 'Warehouse Bay 4', timestamp: '2026-08-17 08:30 AM', description: 'Pallet shrink-wrapped and barcode tags applied.', completed: true, active: true },
      { id: 'trk-092-4', status: 'Dispatched', location: 'DHL Hub Phnom Penh', timestamp: 'Pending', description: 'Carrier collection window 2:00 PM - 5:00 PM.', completed: false },
      { id: 'trk-092-5', status: 'In Transit', location: 'Logistics Corridor', timestamp: 'Pending', description: 'Direct freight transit.', completed: false },
      { id: 'trk-092-6', status: 'Out for Delivery', location: 'Local Depot Toul Kork', timestamp: 'Pending', description: 'Courier van dispatched.', completed: false },
      { id: 'trk-092-7', status: 'Delivered', location: 'ABC Tech Receiving Dock', timestamp: 'Pending', description: 'Signature verification required.', completed: false }
    ]
  },
  {
    id: 'shp-2026-0099',
    shipmentNumber: 'SHP-2026-0099',
    poId: 'po-2026-0052',
    poNumber: 'PO-2026-0052',
    invoiceId: 'inv-2026-0108',
    contractId: 'ctr-2026-0052',
    buyerId: 'buyer-001',
    companyName: 'ABC Technology Ltd.',
    warehouseId: 'wh-pp-01',
    warehouseName: 'Phnom Penh Main Distribution Hub',
    warehouse: 'Phnom Penh Main Distribution Hub',
    originWarehouse: 'Phnom Penh Warehouse',
    originAddress: 'Veng Sreng Blvd, Sangkat Choam Chao, Khan Por Senchey',
    destinationAddress: 'ABC Technology Logistics Warehouse, St. 289 Receiving Gate B, Toul Kork, Phnom Penh',
    deliveryAddress: 'ABC Technology Logistics Warehouse, St. 289 Receiving Gate B, Toul Kork, Phnom Penh',
    contactPerson: 'Dalin Phan',
    carrier: 'Kerry Express Logistics',
    trackingNumber: 'KRY-KH-190284812',
    shipDate: '2026-08-18',
    dispatchDate: '2026-08-18',
    estimatedDelivery: '2026-08-22',
    packagesCount: 4,
    serviceLevel: 'Split delivery batch 2',
    deliveryWindow: '10:00 AM - 01:00 PM',
    totalOrdered: 180,
    totalShipped: 70,
    totalDelivered: 0,
    relatedShipmentIds: ['shp-2026-0098'],
    status: 'In Transit',
    items: [
      {
        id: 'shipi-099-1',
        productId: 'prod-001',
        sku: 'MON-001',
        productName: 'Dell UltraSharp 24" Commercial IPS Display (U2424H)',
        orderedQty: 120,
        shippedQty: 40,
        deliveredQty: 0,
        unit: 'Units'
      },
      {
        id: 'shipi-099-2',
        productId: 'prod-006',
        sku: 'SSD-NVME4TB',
        productName: 'Samsung PM9A3 3.84TB U.2 PCIe 4.0 NVMe Enterprise SSD',
        orderedQty: 60,
        shippedQty: 30,
        deliveredQty: 0,
        unit: 'Units'
      }
    ],
    timeline: [
      { id: 'trk-099-1', status: 'Order Confirmed', location: 'WholesaleHub System', timestamp: '2026-08-12 02:15 PM', description: 'PO-2026-0052 confirmed for split fulfillment.', completed: true },
      { id: 'trk-099-2', status: 'Stock Allocated', location: 'Phnom Penh Warehouse', timestamp: '2026-08-13 09:00 AM', description: 'Remaining quantities allocated for second shipment.', completed: true },
      { id: 'trk-099-3', status: 'Preparing Shipment', location: 'Outbound Bay 1', timestamp: '2026-08-18 08:30 AM', description: 'Second batch packed and sealed.', completed: true },
      { id: 'trk-099-4', status: 'Dispatched', location: 'Phnom Penh Distribution Center', timestamp: '2026-08-18 11:15 AM', description: 'Shipment departed distribution center.', completed: true },
      { id: 'trk-099-5', status: 'In Transit', location: 'Phnom Penh Urban Route', timestamp: '2026-08-18 02:20 PM', description: 'Carrier telemetry active.', completed: true, active: true },
      { id: 'trk-099-6', status: 'Out for Delivery', location: 'Toul Kork Depot', timestamp: 'Pending', description: 'Awaiting local delivery assignment.', completed: false },
      { id: 'trk-099-7', status: 'Delivered', location: 'ABC Technology Receiving Dock', timestamp: 'Pending', description: 'Final receiving sign-off pending.', completed: false }
    ]
  },
  {
    id: 'shp-2026-0098',
    shipmentNumber: 'SHP-2026-0098',
    poId: 'po-2026-0052',
    poNumber: 'PO-2026-0052',
    invoiceId: 'inv-2026-0108',
    contractId: 'ctr-2026-0052',
    buyerId: 'buyer-001',
    companyName: 'ABC Technology Ltd.',
    warehouseId: 'wh-pp-01',
    warehouseName: 'Phnom Penh Main Distribution Hub',
    warehouse: 'Phnom Penh Main Distribution Hub',
    originWarehouse: 'Phnom Penh Warehouse',
    originAddress: 'Veng Sreng Blvd, Sangkat Choam Chao, Khan Por Senchey',
    destinationAddress: 'ABC Technology Logistics Warehouse, St. 289 Receiving Gate B, Toul Kork, Phnom Penh',
    deliveryAddress: 'ABC Technology Logistics Warehouse, St. 289 Receiving Gate B, Toul Kork, Phnom Penh',
    contactPerson: 'Dalin Phan',
    carrier: 'Kerry Express Logistics',
    trackingNumber: 'KRY-KH-190284780',
    shipDate: '2026-08-16',
    dispatchDate: '2026-08-16',
    estimatedDelivery: '2026-08-17',
    actualDelivery: '2026-08-17 03:40 PM',
    packagesCount: 6,
    serviceLevel: 'Split delivery batch 1',
    deliveryWindow: '01:00 PM - 04:00 PM',
    totalOrdered: 180,
    totalShipped: 110,
    totalDelivered: 110,
    relatedShipmentIds: ['shp-2026-0099'],
    status: 'Partially Delivered',
    items: [
      {
        id: 'shipi-098-1',
        productId: 'prod-001',
        sku: 'MON-001',
        productName: 'Dell UltraSharp 24" Commercial IPS Display (U2424H)',
        orderedQty: 120,
        shippedQty: 80,
        deliveredQty: 80,
        unit: 'Units'
      },
      {
        id: 'shipi-098-2',
        productId: 'prod-006',
        sku: 'SSD-NVME4TB',
        productName: 'Samsung PM9A3 3.84TB U.2 PCIe 4.0 NVMe Enterprise SSD',
        orderedQty: 60,
        shippedQty: 30,
        deliveredQty: 30,
        unit: 'Units'
      }
    ],
    timeline: [
      { id: 'trk-098-1', status: 'Order Confirmed', location: 'WholesaleHub System', timestamp: '2026-08-12 02:15 PM', description: 'PO approved with split shipment accepted.', completed: true },
      { id: 'trk-098-2', status: 'Stock Allocated', location: 'Phnom Penh Warehouse', timestamp: '2026-08-13 09:00 AM', description: 'Initial batch allocated for branch rollout.', completed: true },
      { id: 'trk-098-3', status: 'Preparing Shipment', location: 'Outbound Bay 1', timestamp: '2026-08-16 08:40 AM', description: '110 units packed for first delivery.', completed: true },
      { id: 'trk-098-4', status: 'Dispatched', location: 'Phnom Penh Distribution Center', timestamp: '2026-08-16 12:15 PM', description: 'Carrier collected first shipment.', completed: true },
      { id: 'trk-098-5', status: 'In Transit', location: 'Phnom Penh Urban Route', timestamp: '2026-08-16 02:20 PM', description: 'Shipment moving to buyer receiving site.', completed: true },
      { id: 'trk-098-6', status: 'Out for Delivery', location: 'Toul Kork Depot', timestamp: '2026-08-17 10:00 AM', description: 'Loaded for buyer dock appointment.', completed: true },
      { id: 'trk-098-7', status: 'Delivered', location: 'ABC Technology Receiving Dock', timestamp: '2026-08-17 03:40 PM', description: 'First shipment delivered; second shipment remains in transit.', completed: true }
    ],
    proofOfDelivery: {
      receivedBy: 'Dalin Phan (Warehouse Supervisor)',
      timestamp: '2026-08-17 03:40 PM',
      notes: '110 units accepted. Remaining 70 units tracked under SHP-2026-0099.',
      status: 'Available'
    }
  },
  {
    id: 'shp-2026-0065',
    shipmentNumber: 'SHP-2026-0065',
    poId: 'po-2026-0028',
    poNumber: 'PO-2026-0028',
    invoiceId: 'inv-2026-0089',
    buyerId: 'buyer-001',
    companyName: 'ABC Technology Ltd.',
    warehouseId: 'wh-sr-01',
    warehouseName: 'Siem Reap Logistics Depot',
    warehouse: 'Siem Reap Logistics Depot',
    originWarehouse: 'Siem Reap Logistics Depot',
    originAddress: 'Highway 6, Kouk Chak, Siem Reap',
    destinationAddress: 'ABC Technology Logistics Warehouse, St. 289 Receiving Gate B, Toul Kork, Phnom Penh',
    deliveryAddress: 'ABC Technology Logistics Warehouse, St. 289 Receiving Gate B, Toul Kork, Phnom Penh',
    contactPerson: 'Dalin Phan',
    carrier: 'Kerry Express Logistics',
    trackingNumber: 'KRY-KH-190284711',
    shipDate: '2026-07-16',
    dispatchDate: '2026-07-16',
    estimatedDelivery: '2026-07-19',
    actualDelivery: '2026-07-19 02:45 PM',
    packagesCount: 4,
    serviceLevel: 'Insured server freight',
    deliveryWindow: '01:00 PM - 04:00 PM',
    totalOrdered: 4,
    totalShipped: 4,
    totalDelivered: 4,
    status: 'Delivered',
    items: [
      {
        id: 'shipi-065-1',
        productId: 'prod-002',
        sku: 'SRV-R750',
        productName: 'Dell PowerEdge R750 2U Rackmount Server',
        orderedQty: 4,
        shippedQty: 4,
        deliveredQty: 4,
        unit: 'Units'
      }
    ],
    timeline: [
      { id: 'trk-065-1', status: 'Order Confirmed', location: 'Siem Reap Depot', timestamp: '2026-07-12 02:00 PM', description: 'PO approved.', completed: true },
      { id: 'trk-065-2', status: 'Stock Allocated', location: 'Siem Reap Depot', timestamp: '2026-07-13 09:00 AM', description: 'Servers reserved and serials recorded.', completed: true },
      { id: 'trk-065-3', status: 'Preparing Shipment', location: 'Siem Reap Depot', timestamp: '2026-07-14 09:00 AM', description: 'Heavy crating secured.', completed: true },
      { id: 'trk-065-4', status: 'Dispatched', location: 'Siem Reap Depot', timestamp: '2026-07-16 11:30 AM', description: 'Carrier picked up.', completed: true },
      { id: 'trk-065-5', status: 'In Transit', location: 'National Road 6', timestamp: '2026-07-17 04:00 PM', description: 'En route to Phnom Penh.', completed: true },
      { id: 'trk-065-6', status: 'Out for Delivery', location: 'Phnom Penh Depot', timestamp: '2026-07-19 09:00 AM', description: 'Loaded on morning truck.', completed: true },
      { id: 'trk-065-7', status: 'Delivered', location: 'ABC Tech Receiving Dock', timestamp: '2026-07-19 02:45 PM', description: 'Signed and confirmed by Sovannarith Keo.', completed: true }
    ],
    proofOfDelivery: {
      receivedBy: 'Sovannarith Keo (IT Logistics Manager)',
      timestamp: '2026-07-19 02:45 PM',
      notes: 'All 4 security seals inspected intact.',
      status: 'Available'
    }
  }
];

export const mockWarehouses: Warehouse[] = [
  {
    id: 'wh-pp-01',
    name: 'Phnom Penh Main Distribution Hub',
    code: 'WH-PNH-01',
    city: 'Phnom Penh',
    address: 'Veng Sreng Blvd, Sangkat Choam Chao, Khan Por Senchey',
    totalProductsCount: 184,
    stockUnitsTotal: 14850,
    reservedUnits: 2420,
    lowStockItemsCount: 6,
    capacityUtilization: 78
  },
  {
    id: 'wh-sr-01',
    name: 'Siem Reap Logistics Depot',
    code: 'WH-REP-01',
    city: 'Siem Reap',
    address: 'National Road 6, Sangkat Slor Kram',
    totalProductsCount: 92,
    stockUnitsTotal: 4620,
    reservedUnits: 680,
    lowStockItemsCount: 3,
    capacityUtilization: 62
  },
  {
    id: 'wh-btb-01',
    name: 'Battambang Regional Depot',
    code: 'WH-BTB-01',
    city: 'Battambang',
    address: 'Street 106, Romchek 4, Sangkat Ratanak',
    totalProductsCount: 64,
    stockUnitsTotal: 2900,
    reservedUnits: 310,
    lowStockItemsCount: 2,
    capacityUtilization: 45
  }
];

export const mockInventory: InventoryItem[] = [
  {
    id: 'inv-item-01',
    productId: 'prod-001',
    productName: 'Dell UltraSharp 24" Commercial IPS Display (U2424H)',
    sku: 'MON-001',
    warehouseId: 'wh-pp-01',
    warehouseName: 'Phnom Penh Main Distribution Hub',
    locationBin: 'A-12-04',
    onHand: 1240,
    reserved: 320,
    available: 920,
    reorderPoint: 200,
    unitCost: 82,
    status: 'Active'
  },
  {
    id: 'inv-item-02',
    productId: 'prod-002',
    productName: 'Dell PowerEdge R750 2U Rackmount Server',
    sku: 'SRV-R750',
    warehouseId: 'wh-sr-01',
    warehouseName: 'Siem Reap Logistics Depot',
    locationBin: 'S-04-01',
    onHand: 48,
    reserved: 12,
    available: 36,
    reorderPoint: 10,
    unitCost: 2450,
    status: 'Active'
  },
  {
    id: 'inv-item-03',
    productId: 'prod-003',
    productName: 'Cisco Catalyst 1000 Series 48-Port PoE+ Managed Switch',
    sku: 'NET-SW48P',
    warehouseId: 'wh-pp-01',
    warehouseName: 'Phnom Penh Main Distribution Hub',
    locationBin: 'N-08-02',
    onHand: 180,
    reserved: 45,
    available: 135,
    reorderPoint: 30,
    unitCost: 620,
    status: 'Active'
  },
  {
    id: 'inv-item-04',
    productId: 'prod-004',
    productName: 'HP LaserJet Enterprise Flow MFP M635z Heavy-Duty Monochrome',
    sku: 'PRN-MFP800',
    warehouseId: 'wh-btb-01',
    warehouseName: 'Battambang Regional Depot',
    locationBin: 'C-01-08',
    onHand: 35,
    reserved: 8,
    available: 27,
    reorderPoint: 8,
    unitCost: 1420,
    status: 'Active'
  },
  {
    id: 'inv-item-05',
    productId: 'prod-005',
    productName: 'APC Smart-UPS On-Line 3000VA 2U Rack/Tower 230V',
    sku: 'UPS-3000RT',
    warehouseId: 'wh-pp-01',
    warehouseName: 'Phnom Penh Main Distribution Hub',
    locationBin: 'P-02-03',
    onHand: 64,
    reserved: 16,
    available: 48,
    reorderPoint: 15,
    unitCost: 1100,
    status: 'Active'
  },
  {
    id: 'inv-item-06',
    productId: 'prod-006',
    productName: 'Samsung PM9A3 3.84TB U.2 PCIe 4.0 NVMe Enterprise SSD',
    sku: 'SSD-NVME4TB',
    warehouseId: 'wh-pp-01',
    warehouseName: 'Phnom Penh Main Distribution Hub',
    locationBin: 'V-05-11',
    onHand: 620,
    reserved: 140,
    available: 480,
    reorderPoint: 100,
    unitCost: 210,
    status: 'Active'
  }
];

export const mockBuyerDashboardStats = {
  openRFQs: 8,
  activeQuotes: 5,
  activePurchaseOrders: 12,
  outstandingInvoice: 24850,
  availableCredit: 18000,
  shipmentsInTransit: 4
};

export const mockBuyerMonthlySpendData = [
  { month: 'Feb', spend: 18500, purchaseOrders: 6 },
  { month: 'Mar', spend: 22400, purchaseOrders: 8 },
  { month: 'Apr', spend: 19850, purchaseOrders: 7 },
  { month: 'May', spend: 28600, purchaseOrders: 10 },
  { month: 'Jun', spend: 34200, purchaseOrders: 12 },
  { month: 'Jul', spend: 31800, purchaseOrders: 11 },
  { month: 'Aug', spend: 39250, purchaseOrders: 14 }
];

export const mockBuyerInvoiceStatusData = [
  { name: 'Paid', value: 9, color: '#059669' },
  { name: 'Due Soon', value: 3, color: '#2563eb' },
  { name: 'Open', value: 2, color: '#f59e0b' }
];

export const mockBuyerRecommendedProductIds = ['prod-001', 'prod-003', 'prod-006', 'prod-005'];

export const mockBuyerWarehouseAvailability: Record<
  string,
  {
    warehouseId: string;
    warehouseName: string;
    city: string;
    available: number;
    reserved: number;
  }[]
> = {
  'prod-001': [
    { warehouseId: 'wh-pp-01', warehouseName: 'Phnom Penh Warehouse', city: 'Phnom Penh', available: 150, reserved: 60 },
    { warehouseId: 'wh-sr-01', warehouseName: 'Siem Reap Warehouse', city: 'Siem Reap', available: 70, reserved: 20 },
    { warehouseId: 'wh-btb-01', warehouseName: 'Battambang Warehouse', city: 'Battambang', available: 20, reserved: 8 }
  ],
  'prod-002': [
    { warehouseId: 'wh-pp-01', warehouseName: 'Phnom Penh Warehouse', city: 'Phnom Penh', available: 12, reserved: 4 },
    { warehouseId: 'wh-sr-01', warehouseName: 'Siem Reap Warehouse', city: 'Siem Reap', available: 18, reserved: 6 },
    { warehouseId: 'wh-btb-01', warehouseName: 'Battambang Warehouse', city: 'Battambang', available: 6, reserved: 2 }
  ],
  'prod-003': [
    { warehouseId: 'wh-pp-01', warehouseName: 'Phnom Penh Warehouse', city: 'Phnom Penh', available: 80, reserved: 18 },
    { warehouseId: 'wh-sr-01', warehouseName: 'Siem Reap Warehouse', city: 'Siem Reap', available: 35, reserved: 12 },
    { warehouseId: 'wh-btb-01', warehouseName: 'Battambang Warehouse', city: 'Battambang', available: 20, reserved: 5 }
  ],
  'prod-004': [
    { warehouseId: 'wh-pp-01', warehouseName: 'Phnom Penh Warehouse', city: 'Phnom Penh', available: 10, reserved: 2 },
    { warehouseId: 'wh-sr-01', warehouseName: 'Siem Reap Warehouse', city: 'Siem Reap', available: 7, reserved: 3 },
    { warehouseId: 'wh-btb-01', warehouseName: 'Battambang Warehouse', city: 'Battambang', available: 10, reserved: 3 }
  ],
  'prod-005': [
    { warehouseId: 'wh-pp-01', warehouseName: 'Phnom Penh Warehouse', city: 'Phnom Penh', available: 30, reserved: 10 },
    { warehouseId: 'wh-sr-01', warehouseName: 'Siem Reap Warehouse', city: 'Siem Reap', available: 12, reserved: 4 },
    { warehouseId: 'wh-btb-01', warehouseName: 'Battambang Warehouse', city: 'Battambang', available: 6, reserved: 2 }
  ],
  'prod-006': [
    { warehouseId: 'wh-pp-01', warehouseName: 'Phnom Penh Warehouse', city: 'Phnom Penh', available: 240, reserved: 75 },
    { warehouseId: 'wh-sr-01', warehouseName: 'Siem Reap Warehouse', city: 'Siem Reap', available: 160, reserved: 42 },
    { warehouseId: 'wh-btb-01', warehouseName: 'Battambang Warehouse', city: 'Battambang', available: 80, reserved: 23 }
  ]
};

export const mockBuyerApplications: BuyerApplication[] = [
  {
    id: 'app-2026-014',
    applicationNumber: 'APP-2026-014',
    buyerId: 'buyer-003',
    companyName: 'Angkor Cloud Solutions Inc.',
    businessType: 'Data Center Operator & MSP',
    industry: 'Cloud Infrastructure',
    registrationNumber: 'REG-KH-2024-11029',
    taxId: 'KHM-TAX-77218390',
    country: 'Cambodia',
    city: 'Siem Reap',
    address: 'Highway 6, Svay Dangkum, Siem Reap',
    website: 'https://angkorcloud.com',
    contactName: 'Borey Meng',
    contactEmail: 'procurement@angkorcloud.com',
    contactPhone: '+855 (0) 63 963 888',
    submittedDate: '2026-08-10',
    documents: [
      {
        id: 'app-doc-014-1',
        document: 'Business License',
        documentNumber: 'BL-SR-2026-00912',
        uploadedDate: '2026-08-10',
        expiry: '2027-08-10',
        verificationStatus: 'Pending',
        fileName: 'Business_License_AngkorCloud.pdf',
        fileSize: '4.2 MB'
      },
      {
        id: 'app-doc-014-2',
        document: 'Company Registration',
        documentNumber: 'REG-KH-2024-11029',
        uploadedDate: '2026-08-10',
        expiry: 'Permanent',
        verificationStatus: 'Verified',
        fileName: 'Company_Registration_AngkorCloud.pdf',
        fileSize: '2.0 MB'
      },
      {
        id: 'app-doc-014-3',
        document: 'Tax Registration',
        documentNumber: 'KHM-TAX-77218390',
        uploadedDate: '2026-08-10',
        expiry: '2027-03-31',
        verificationStatus: 'Pending',
        fileName: 'Tax_Certificate_AngkorCloud.pdf',
        fileSize: '1.4 MB'
      }
    ],
    documentStatus: 'Pending Review',
    riskStatus: 'Verification Pending',
    assignedReviewer: 'Un Somnang',
    assignedAccountExecutive: 'David Chen',
    buyerGroup: 'Corporate',
    creditProfile: {
      creditLimit: 50000,
      usedCredit: 0,
      availableCredit: 50000,
      paymentTerms: 'Net 30',
      accountStanding: 'Good Standing'
    },
    verificationChecklist: [
      { id: 'chk-014-1', label: 'Company registration verified', completed: true },
      { id: 'chk-014-2', label: 'Tax ID verified', completed: true },
      { id: 'chk-014-3', label: 'Business license verified', completed: true },
      { id: 'chk-014-4', label: 'Contact information verified', completed: true },
      { id: 'chk-014-5', label: 'Address verified', completed: true },
      { id: 'chk-014-6', label: 'Documents valid', completed: true },
      { id: 'chk-014-7', label: 'Credit review completed', completed: false },
      { id: 'chk-014-8', label: 'Buyer group selected', completed: false },
      { id: 'chk-014-9', label: 'Account executive assigned', completed: false }
    ],
    internalNotes: ['Bank reference received. Finance review pending for initial credit limit.'],
    approvalHistory: [
      {
        id: 'hist-014-1',
        timestamp: '2026-08-10 09:20 AM',
        actor: 'Buyer Portal',
        action: 'Application submitted',
        note: 'Buyer completed registration form.'
      },
      {
        id: 'hist-014-2',
        timestamp: '2026-08-11 10:45 AM',
        actor: 'Un Somnang',
        action: 'Verification started',
        note: 'Initial compliance review opened.'
      }
    ],
    status: 'Under Review'
  },
  {
    id: 'app-2026-015',
    applicationNumber: 'APP-2026-015',
    companyName: 'Kampuchea Office Systems',
    businessType: 'Office Equipment Reseller',
    industry: 'Commercial Office Equipment',
    registrationNumber: 'REG-KH-2026-01880',
    taxId: 'KHM-TAX-90122831',
    country: 'Cambodia',
    city: 'Phnom Penh',
    address: 'St. 271, Sangkat Boeung Tumpun, Phnom Penh',
    website: 'https://kos-cambodia.example',
    contactName: 'Pisey Lor',
    contactEmail: 'pisey@kos-cambodia.example',
    contactPhone: '+855 (0) 15 228 110',
    submittedDate: '2026-08-17',
    documents: [
      {
        id: 'app-doc-015-1',
        document: 'Business License',
        documentNumber: 'BL-PNH-2026-02102',
        uploadedDate: '2026-08-17',
        expiry: '2027-08-17',
        verificationStatus: 'Pending',
        fileName: 'KOS_Business_License.pdf',
        fileSize: '3.0 MB'
      },
      {
        id: 'app-doc-015-2',
        document: 'Proof of Address',
        documentNumber: 'ADDR-KOS-2026',
        uploadedDate: '2026-08-17',
        expiry: '2026-11-17',
        verificationStatus: 'Pending',
        fileName: 'KOS_Lease_Agreement.pdf',
        fileSize: '1.9 MB'
      }
    ],
    documentStatus: 'Missing',
    riskStatus: 'Medium Risk',
    assignedReviewer: 'Finance Support',
    assignedAccountExecutive: 'Sophea Chan',
    buyerGroup: 'Standard',
    creditProfile: {
      creditLimit: 20000,
      usedCredit: 0,
      availableCredit: 20000,
      paymentTerms: 'Net 30',
      accountStanding: 'Watchlist'
    },
    verificationChecklist: [
      { id: 'chk-015-1', label: 'Company registration verified', completed: true },
      { id: 'chk-015-2', label: 'Tax ID verified', completed: false },
      { id: 'chk-015-3', label: 'Business license verified', completed: true },
      { id: 'chk-015-4', label: 'Contact information verified', completed: true },
      { id: 'chk-015-5', label: 'Address verified', completed: false },
      { id: 'chk-015-6', label: 'Documents valid', completed: false },
      { id: 'chk-015-7', label: 'Credit review completed', completed: false },
      { id: 'chk-015-8', label: 'Buyer group selected', completed: true },
      { id: 'chk-015-9', label: 'Account executive assigned', completed: true }
    ],
    internalNotes: ['Tax certificate not uploaded. Request replacement before approval.'],
    approvalHistory: [
      {
        id: 'hist-015-1',
        timestamp: '2026-08-17 02:15 PM',
        actor: 'Buyer Portal',
        action: 'Application submitted'
      }
    ],
    status: 'Pending'
  },
  {
    id: 'app-2026-011',
    applicationNumber: 'APP-2026-011',
    companyName: 'Mekong Campus Supplies',
    businessType: 'Education Sector Distributor',
    industry: 'Education Procurement',
    registrationNumber: 'REG-KH-2026-01129',
    taxId: 'KHM-TAX-66278192',
    country: 'Cambodia',
    city: 'Kampong Cham',
    address: 'River Road 7, Kampong Cham',
    contactName: 'Sokun Thy',
    contactEmail: 'sokun@mekongcampus.example',
    contactPhone: '+855 (0) 42 778 900',
    submittedDate: '2026-08-13',
    documents: [
      {
        id: 'app-doc-011-1',
        document: 'Business License',
        documentNumber: 'BL-KPC-2026-00411',
        uploadedDate: '2026-08-13',
        expiry: '2027-08-13',
        verificationStatus: 'Rejected',
        fileName: 'MCS_Business_License_Blurry.pdf',
        fileSize: '900 KB'
      }
    ],
    documentStatus: 'Missing',
    riskStatus: 'High Risk',
    assignedReviewer: 'Un Somnang',
    assignedAccountExecutive: 'Dara Sok',
    buyerGroup: 'Standard',
    verificationChecklist: [
      { id: 'chk-011-1', label: 'Company registration verified', completed: false },
      { id: 'chk-011-2', label: 'Tax ID verified', completed: false },
      { id: 'chk-011-3', label: 'Business license verified', completed: false },
      { id: 'chk-011-4', label: 'Contact information verified', completed: true },
      { id: 'chk-011-5', label: 'Address verified', completed: false },
      { id: 'chk-011-6', label: 'Documents valid', completed: false },
      { id: 'chk-011-7', label: 'Credit review completed', completed: false },
      { id: 'chk-011-8', label: 'Buyer group selected', completed: true },
      { id: 'chk-011-9', label: 'Account executive assigned', completed: true }
    ],
    internalNotes: ['Uploaded license image is unreadable.'],
    approvalHistory: [
      {
        id: 'hist-011-1',
        timestamp: '2026-08-13 08:30 AM',
        actor: 'Buyer Portal',
        action: 'Application submitted'
      },
      {
        id: 'hist-011-2',
        timestamp: '2026-08-14 04:50 PM',
        actor: 'Compliance Desk',
        action: 'Documents flagged',
        note: 'Business license image is not readable.'
      }
    ],
    status: 'Additional Documents Required'
  }
];

export const mockBuyerGroups: BuyerGroupConfig[] = [
  {
    id: 'grp-standard',
    name: 'Standard',
    description: 'Default wholesale access for verified small and mid-size buyers.',
    buyersCount: 86,
    defaultDiscount: 0,
    defaultPaymentTerms: 'Net 30',
    defaultCreditLimit: 20000,
    pricingRule: 'Base wholesale tiers only',
    pricingPriority: 4,
    status: 'Active'
  },
  {
    id: 'grp-corporate',
    name: 'Corporate',
    description: 'Contract-backed B2B accounts with negotiated volume pricing.',
    buyersCount: 118,
    defaultDiscount: 5,
    defaultPaymentTerms: 'Net 30',
    defaultCreditLimit: 50000,
    pricingRule: 'Apply corporate discount after tier price',
    pricingPriority: 2,
    status: 'Active'
  },
  {
    id: 'grp-vip',
    name: 'VIP',
    description: 'Strategic accounts with expanded terms and priority allocation.',
    buyersCount: 31,
    defaultDiscount: 8,
    defaultPaymentTerms: 'Net 60',
    defaultCreditLimit: 150000,
    pricingRule: 'VIP discount and priority reservation',
    pricingPriority: 1,
    status: 'Active'
  },
  {
    id: 'grp-distributor',
    name: 'Distributor',
    description: 'Regional resale partners with distributor pricing rules.',
    buyersCount: 13,
    defaultDiscount: 12,
    defaultPaymentTerms: 'Net 60',
    defaultCreditLimit: 120000,
    pricingRule: 'Distributor tier override',
    pricingPriority: 3,
    status: 'Active'
  }
];

export const mockUsers: UserAccount[] = [
  {
    id: 'usr-adm-01',
    name: 'Un Somnang',
    email: 'un.somnang@wholesalehub.com',
    role: 'ADMIN',
    department: 'Super Admin',
    companyName: 'WholesaleHub Global',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    status: 'Active',
    lastActive: 'Just now'
  },
  {
    id: 'usr-mgr-01',
    name: 'Marcus Vance',
    email: 'marcus.v@wholesalehub.com',
    role: 'SALES_MANAGER',
    department: 'Enterprise Sales & Pricing',
    companyName: 'WholesaleHub Global',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    status: 'Active',
    lastActive: '5 mins ago'
  },
  {
    id: 'usr-rep-01',
    name: 'David Chen',
    email: 'david.chen@wholesalehub.com',
    role: 'ACCOUNT_EXECUTIVE',
    department: 'Corporate Accounts',
    companyName: 'WholesaleHub Global',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    status: 'Active',
    lastActive: '12 mins ago'
  },
  {
    id: 'usr-buyer-01',
    name: 'Sovannarith Keo',
    email: 'keo.sovannarith@abctech.com.kh',
    role: 'VERIFIED_BUYER',
    department: 'Procurement & Logistics',
    companyName: 'ABC Technology Ltd.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    status: 'Active',
    lastActive: '2 mins ago'
  }
];

export const mockActivityLogs: ActivityLog[] = [
  {
    id: 'log-001',
    userId: 'usr-mgr-01',
    userName: 'Marcus Vance',
    userRole: 'SALES_MANAGER',
    action: 'APPROVED_SPECIAL_PRICE',
    module: 'QUOTES',
    recordId: 'QTE-2026-089',
    recordType: 'Quote',
    description: 'Approved discounted price $100/unit on Dell U2424H for ABC Technology Ltd.',
    ipAddress: '10.0.12.45',
    timestamp: '2026-08-17 04:45 PM'
  },
  {
    id: 'log-002',
    userId: 'usr-buyer-01',
    userName: 'Sovannarith Keo',
    userRole: 'VERIFIED_BUYER',
    action: 'SUBMITTED_COUNTER_OFFER',
    module: 'RFQS',
    recordId: 'RFQ-2026-089',
    recordType: 'RFQ',
    description: 'Counter offer submitted with revised target $98/unit',
    ipAddress: '119.15.82.10',
    timestamp: '2026-08-16 11:20 AM'
  },
  {
    id: 'log-003',
    userId: 'usr-rep-01',
    userName: 'David Chen',
    userRole: 'ACCOUNT_EXECUTIVE',
    action: 'ISSUED_OFFICIAL_QUOTE',
    module: 'QUOTES',
    recordId: 'QTE-2026-089',
    recordType: 'Quote',
    description: 'Generated formal quotation for 120 displays and 60 NVMe drives',
    ipAddress: '10.0.14.88',
    timestamp: '2026-08-15 10:00 AM'
  },
  {
    id: 'log-004',
    userId: 'usr-adm-01',
    userName: 'Eleanor Vance',
    userRole: 'ADMIN',
    action: 'ALLOCATED_STOCK',
    module: 'INVENTORY',
    recordId: 'PO-2026-0041',
    recordType: 'PurchaseOrder',
    description: 'Allocated 15 units of NET-SW48P from Phnom Penh Hub',
    ipAddress: '10.0.10.2',
    timestamp: '2026-08-05 09:00 AM'
  }
];

export const mockRecentAdminActivity = [
  {
    id: 'admin-act-001',
    title: 'Buyer application submitted',
    actor: 'Kampuchea Office Systems',
    module: 'BUYERS',
    timestamp: '2026-08-17 02:15 PM',
    description: 'New buyer onboarding application is pending compliance review.'
  },
  {
    id: 'admin-act-002',
    title: 'Quote requires manager approval',
    actor: 'Marcus Vance',
    module: 'QUOTES',
    timestamp: '2026-08-18 11:05 AM',
    description: 'QTE-2026-113 received concession pricing approval.'
  },
  {
    id: 'admin-act-003',
    title: 'Credit limit exceeded',
    actor: 'WholesaleHub Finance',
    module: 'FINANCE',
    timestamp: '2026-08-18 11:45 AM',
    description: 'PO-2026-0058 requires credit approval due to a $7,882 shortfall.'
  },
  {
    id: 'admin-act-004',
    title: 'Shipment delayed',
    actor: 'Logistics Desk',
    module: 'LOGISTICS',
    timestamp: '2026-08-17 05:20 PM',
    description: 'Carrier pickup window moved for outbound pallet freight.'
  }
];

export const mockAdminNotifications: AdminNotification[] = [
  {
    id: 'admin-notif-application',
    title: 'New buyer application submitted',
    message: 'Kampuchea Office Systems is waiting in the approval queue.',
    timestamp: '12 mins ago',
    read: false,
    type: 'INFO',
    link: '/admin/approvals/app-2026-015'
  },
  {
    id: 'admin-notif-docs',
    title: 'Replacement documents uploaded',
    message: 'Mekong Campus Supplies uploaded a new proof-of-address packet.',
    timestamp: '38 mins ago',
    read: false,
    type: 'SUCCESS',
    link: '/admin/approvals/app-2026-011'
  },
  {
    id: 'admin-notif-rfq',
    title: 'RFQ requires assignment',
    message: 'RFQ-2026-103 has not been assigned to an account executive.',
    timestamp: '1 hour ago',
    read: false,
    type: 'WARNING',
    link: '/admin/rfqs'
  },
  {
    id: 'admin-notif-quote',
    title: 'Quote requires manager approval',
    message: 'QTE-2026-113 is above buyer available credit and needs review.',
    timestamp: '2 hours ago',
    read: false,
    type: 'WARNING',
    link: '/admin/quotes'
  },
  {
    id: 'admin-notif-credit',
    title: 'Credit limit exceeded',
    message: 'PO-2026-0058 exceeds ABC Technology available credit by $7,882.',
    timestamp: '3 hours ago',
    read: false,
    type: 'ALERT',
    link: '/admin/credit'
  },
  {
    id: 'admin-notif-invoice',
    title: 'Invoice overdue',
    message: 'INV-2026-0101 is overdue and remains unpaid.',
    timestamp: '6 hours ago',
    read: true,
    type: 'ALERT',
    link: '/admin/invoices'
  },
  {
    id: 'admin-notif-stock',
    title: 'Low stock alert',
    message: 'UPS-6KVA is below reorder point in Phnom Penh warehouse.',
    timestamp: '1 day ago',
    read: true,
    type: 'WARNING',
    link: '/admin/inventory'
  },
  {
    id: 'admin-notif-shipment',
    title: 'Shipment delayed',
    message: 'A carrier pickup window moved for SHP-2026-0092.',
    timestamp: '1 day ago',
    read: true,
    type: 'WARNING',
    link: '/admin/shipments'
  }
];

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif-inv-issued',
    title: 'Invoice INV-2026-0116 issued',
    message: 'A new Net 30 invoice is available for PO-2026-0057.',
    timestamp: '8 mins ago',
    read: false,
    type: 'INFO',
    link: '/buyer/invoices/inv-2026-0116'
  },
  {
    id: 'notif-ship-dispatched',
    title: 'Shipment SHP-2026-0099 in transit',
    message: 'The remaining PO-2026-0052 shipment departed the Phnom Penh distribution center.',
    timestamp: '45 mins ago',
    read: false,
    type: 'SUCCESS',
    link: '/buyer/shipments/shp-2026-0099'
  },
  {
    id: 'notif-credit-warning',
    title: 'Credit utilization at 64%',
    message: 'Available credit is $18,000 against a $50,000 credit facility.',
    timestamp: '1 hour ago',
    read: false,
    type: 'WARNING',
    link: '/buyer/profile'
  },
  {
    id: 'notif-inv-due',
    title: 'Invoice INV-2026-0108 due soon',
    message: 'A balance remains due on August 23, 2026.',
    timestamp: '2 hours ago',
    read: false,
    type: 'WARNING',
    link: '/buyer/invoices/inv-2026-0108'
  },
  {
    id: 'notif-overdue',
    title: 'Invoice INV-2026-0101 overdue',
    message: 'Please coordinate settlement with Finance Support to keep account standing clear.',
    timestamp: '6 hours ago',
    read: false,
    type: 'ALERT',
    link: '/buyer/invoices/inv-2026-0101'
  },
  {
    id: 'notif-payment',
    title: 'Payment PAY-2026-052 recorded',
    message: 'A $3,500 bank transfer was reconciled against INV-2026-0108.',
    timestamp: '1 day ago',
    read: true,
    type: 'SUCCESS',
    link: '/buyer/invoices/inv-2026-0108'
  },
  {
    id: 'notif-delivered',
    title: 'Shipment SHP-2026-0098 partially delivered',
    message: '110 units were received; the remaining 70 units are tracked under SHP-2026-0099.',
    timestamp: '1 day ago',
    read: true,
    type: 'SUCCESS',
    link: '/buyer/shipments/shp-2026-0098'
  },
  {
    id: 'notif-contract-expiry',
    title: 'Contract CTR-2026-0052 renewal reminder',
    message: 'The workstation refresh contract is nearing renewal review.',
    timestamp: '1 day ago',
    read: true,
    type: 'WARNING',
    link: '/buyer/contracts/ctr-2026-0052'
  },
  {
    id: 'notif-1',
    title: 'Quote QTE-2026-104 received',
    message: 'Your edge rack refresh quote is ready for review and expires on August 20, 2026.',
    timestamp: '15 mins ago',
    read: false,
    type: 'SUCCESS',
    link: '/buyer/quotes/qte-2026-104'
  },
  {
    id: 'notif-2',
    title: 'RFQ-2026-103 submitted',
    message: 'Your printer fleet RFQ was sent to David Chen for account executive review.',
    timestamp: '2 hours ago',
    read: false,
    type: 'INFO',
    link: '/buyer/rfqs/rfq-2026-103'
  },
  {
    id: 'notif-3',
    title: 'Quote QTE-2026-101 awaiting approval',
    message: 'Your counter price is pending Sales Manager approval before the final quote can be accepted.',
    timestamp: '5 hours ago',
    read: false,
    type: 'WARNING',
    link: '/buyer/quotes/qte-2026-101'
  },
  {
    id: 'notif-4',
    title: 'Counter-offer approved',
    message: 'Marcus Vance approved final concession pricing on RFQ-2026-089.',
    timestamp: '1 day ago',
    read: true,
    type: 'SUCCESS',
    link: '/buyer/quotes/qte-2026-089'
  },
  {
    id: 'notif-5',
    title: 'Quote QTE-2026-071 expired',
    message: 'The emergency UPS stock-hold quote expired before acceptance.',
    timestamp: '2 days ago',
    read: true,
    type: 'ALERT',
    link: '/buyer/quotes/qte-2026-071'
  }
];

export const mockAdminKPIs = {
  totalRevenue: 1284500,
  activeBuyers: 248,
  pendingApprovals: 14,
  openRFQs: 36,
  purchaseOrdersCount: 82,
  outstandingInvoicesTotal: 184200,
  lowStockItemsCount: 17,
  shipmentsInTransitCount: 24,
  revenueMonthlyData: [
    { month: 'Jan', revenue: 112000, target: 100000, rfqCount: 18 },
    { month: 'Feb', revenue: 138000, target: 120000, rfqCount: 22 },
    { month: 'Mar', revenue: 156500, target: 135000, rfqCount: 26 },
    { month: 'Apr', revenue: 182000, target: 160000, rfqCount: 31 },
    { month: 'May', revenue: 198500, target: 180000, rfqCount: 33 },
    { month: 'Jun', revenue: 214000, target: 195000, rfqCount: 39 },
    { month: 'Jul', revenue: 239500, target: 220000, rfqCount: 41 },
    { month: 'Aug', revenue: 244000, target: 230000, rfqCount: 47 }
  ],
  monthlySalesData: [
    { month: 'Jan', sales: 92, quotes: 44 },
    { month: 'Feb', sales: 108, quotes: 52 },
    { month: 'Mar', sales: 119, quotes: 58 },
    { month: 'Apr', sales: 136, quotes: 65 },
    { month: 'May', sales: 149, quotes: 70 },
    { month: 'Jun', sales: 158, quotes: 78 },
    { month: 'Jul', sales: 171, quotes: 84 },
    { month: 'Aug', sales: 182, quotes: 91 }
  ],
  rfqConversionData: [
    { stage: 'Submitted', value: 120 },
    { stage: 'Quoted', value: 88 },
    { stage: 'Negotiated', value: 54 },
    { stage: 'Accepted', value: 39 }
  ],
  poVolumeData: [
    { month: 'Apr', approved: 49, pending: 8 },
    { month: 'May', approved: 55, pending: 11 },
    { month: 'Jun', approved: 62, pending: 10 },
    { month: 'Jul', approved: 68, pending: 13 },
    { month: 'Aug', approved: 74, pending: 8 }
  ],
  buyerGrowthData: [
    { month: 'Q1', standard: 92, corporate: 84, vip: 21, distributor: 8 },
    { month: 'Q2', standard: 101, corporate: 96, vip: 26, distributor: 11 },
    { month: 'Q3', standard: 111, corporate: 118, vip: 31, distributor: 13 }
  ],
  salesByCategoryData: [
    { name: 'Enterprise IT', value: 38, color: '#2563eb' },
    { name: 'Servers & Storage', value: 24, color: '#059669' },
    { name: 'Networking', value: 18, color: '#f59e0b' },
    { name: 'Office Equipment', value: 12, color: '#7c3aed' },
    { name: 'Power & UPS', value: 8, color: '#ef4444' }
  ],
  rfqConversionRate: 74.2,
  averageDealSize: 22400
};

export const mockAdminDashboardStats = mockAdminKPIs;
