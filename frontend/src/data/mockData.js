// This file contains all the mock data for the application.
// In a real-world scenario, this data would be fetched from an API.

export const ALL_PAGES = [
  { id: "dashboard", label: "หน้าหลัก" },
  { id: "customer-list", label: "เพิ่มข้อมูลลูกค้า" },
  { id: "site-list", label: "เพิ่มข้อมูลหน่วยงาน" },
  { id: "guard-list", label: "พนักงานรปภ." },
  { id: "staff-list", label: "พนักงานภายใน" },
  { id: "daily-advance", label: "เบิกรายวัน" },
  { id: "equipment-request", label: "เบิกอุปกรณ์" },
  { id: "damage-deposit", label: "เงินประกันความเสียหาย" },
  { id: "social-security", label: "ประกันสังคม" },
  { id: "scheduler", label: "ตารางงาน" },
  { id: "services", label: "บริการ" },
  { id: "product", label: "สินค้า" },
  { id: "settings", label: "ตั้งค่าระบบ" },
];

export const initialRoles = [
  { id: 1, name: "Admin", permissions: ALL_PAGES.map((p) => p.id) },
  {
    id: 2,
    name: "Supervisor",
    permissions: ["dashboard", "site-list", "scheduler", "guard-list"],
  },
  {
    id: 3,
    name: "HR",
    permissions: ["dashboard", "guard-list", "staff-list", "social-security"],
  },
];

export const initialUsers = [
  { id: 1, firstName: 'แอดมิน', lastName: 'ระบบ', email: 'admin@system.com', username: 'admin', roleId: 1, password: 'admin' },
  { id: 2, firstName: 'สมศักดิ์', lastName: 'สายตรวจ', email: 'somsak@system.com', username: 'supervisor1', roleId: 2, password: 'password' },
  { id: 3, firstName: 'สมหญิง', lastName: 'บุคคล', email: 'somyin@system.com', username: 'hr01', roleId: 3, password: 'password' },
  { id: 4, firstName: 'วิชัย', lastName: 'สายตรวจ', email: 'vichai@system.com', username: 'supervisor2', roleId: 2, password: 'password' },
];

export const initialServices = [
  { id: 1, name: "พนักงานรักษาความปลอดภัย" },
  { id: 2, name: "หัวหน้าชุดรักษาความปลอดภัย" },
  { id: 3, name: "พนักงานทำความสะอาด" },
  { id: 4, name: "ผู้จัดการอาคาร" },
];

export const initialProducts = [
  { id: 1, code: 'P-001', name: 'วิทยุสื่อสาร', price: 5000, category: 'อุปกรณ์' },
  { id: 2, code: 'P-002', name: 'เครื่องสแกนจุด', price: 15000, category: 'อุปกรณ์' },
  { id: 3, code: 'P-003', name: 'ชุดยูนิฟอร์ม', price: 1200, category: 'เครื่องแต่งกาย' },
];

export const initialCustomers = [
  {
    id: 1,
    code: "CUS-001",
    name: "บริษัท เซ็นทรัลพัฒนา จำกัด (มหาชน)",
    taxId: "0107537002175",
    address: {
      street: "999/9 ถนนพระราม 1",
      subdistrict: "ปทุมวัน",
      district: "ปทุมวัน",
      province: "กรุงเทพมหานคร",
      zipcode: "10330",
    },
    mapLink: "https://maps.app.goo.gl/abcdef123456",
    contact: {
      primary: {
        name: "คุณสมชาย ใจดี",
        phone: "081-234-5678",
        email: "somchai.j@central.co.th",
      },
      secondary: {
        name: "คุณสุนีย์ มีสุข",
        phone: "082-345-6789",
        email: "sunee.m@central.co.th",
      },
    },
    billing: {
      address: {
        street: "999/9 ถนนพระราม 1 (สำนักงานใหญ่)",
        subdistrict: "ปทุมวัน",
        district: "ปทุมวัน",
        province: "กรุงเทพมหานคร",
        zipcode: "10330",
      },
      paymentTerms: "Credit 30 วัน",
    },
  },
  {
    id: 2,
    code: "CUS-002",
    name: "บริษัท ไอคอนสยาม จำกัด",
    taxId: "0105558054447",
    address: {
      street: "299 ซอยเจริญนคร 5 ถนนเจริญนคร",
      subdistrict: "คลองต้นไทร",
      district: "คลองสาน",
      province: "กรุงเทพมหานคร",
      zipcode: "10600",
    },
    mapLink: "https://maps.app.goo.gl/ghijkl987654",
    contact: {
      primary: {
        name: "คุณวิชัย ชนะศึก",
        phone: "098-765-4321",
        email: "vichai.c@iconsiam.co.th",
      },
      secondary: { name: "", phone: "", email: "" },
    },
    billing: {
      address: {
        street: "299 ซอยเจริญนคร 5 ถนนเจริญนคร",
        subdistrict: "คลองต้นไทร",
        district: "คลองสาน",
        province: "กรุงเทพมหานคร",
        zipcode: "10600",
      },
      paymentTerms: "Credit 45 วัน",
    },
  },
  {
    id: 3,
    code: "CUS-003",
    name: "บริษัท ทดสอบ 3",
    taxId: "0105558054447",
    address: {
      street: "299 ซอยเจริญนคร 5 ถนนเจริญนคร",
      subdistrict: "คลองต้นไทร",
      district: "คลองสาน",
      province: "กรุงเทพมหานคร",
      zipcode: "10600",
    },
    mapLink: "https://maps.app.goo.gl/ghijkl987654",
    contact: {
      primary: {
        name: "คุณวิชัย ชนะศึก",
        phone: "098-765-4321",
        email: "vichai.c@iconsiam.co.th",
      },
      secondary: { name: "", phone: "", email: "" },
    },
    billing: {
      address: {
        street: "299 ซอยเจริญนคร 5 ถนนเจริญนคร",
        subdistrict: "คลองต้นไทร",
        district: "คลองสาน",
        province: "กรุงเทพมหานคร",
        zipcode: "10600",
      },
      paymentTerms: "Credit 45 วัน",
    },
  },
];

export const initialSites = [
  {
    id: 1,
    customerId: 1,
    name: "เซ็นทรัลเวิลด์",
    address: {
      street: "4, 4/5 ถนนราชดำริ",
      subdistrict: "ปทุมวัน",
      district: "ปทุมวัน",
      province: "กรุงเทพมหานคร",
      zipcode: "10330",
    },
    startDate: "2024-01-01",
    endDate: "2025-12-31",
    contractedServices: [
      {
        id: 1,
        serviceId: 1,
        position: "รปภ.",
        quantity: 10,
        hiringRate: 700,
        payoutRate: 600,
        diligenceBonus: 50,
        pointBonus: 0,
        otherBonus: 0,
      },
      {
        id: 2,
        serviceId: 2,
        position: "หัวหน้าชุด",
        quantity: 2,
        hiringRate: 850,
        payoutRate: 720,
        diligenceBonus: 50,
        pointBonus: 30,
        otherBonus: 0,
      },
    ],
  },
  {
    id: 2,
    customerId: 2,
    name: "ไอคอนสยาม",
    address: {
      street: "299 ถนนเจริญนคร",
      subdistrict: "คลองต้นไทร",
      district: "คลองสาน",
      province: "กรุงเทพมหานคร",
      zipcode: "10600",
    },
    startDate: "2023-06-01",
    endDate: "2024-05-31",
    contractedServices: [
      {
        id: 1,
        serviceId: 1,
        position: "รปภ.",
        quantity: 15,
        hiringRate: 720,
        payoutRate: 610,
        diligenceBonus: 40,
        pointBonus: 10,
        otherBonus: 0,
      },
      {
        id: 2,
        serviceId: 2,
        position: "หัวหน้าชุด",
        quantity: 3,
        hiringRate: 900,
        payoutRate: 750,
        diligenceBonus: 50,
        pointBonus: 20,
        otherBonus: 0,
      },
    ],
  },
];

export const initialGuards = [
  {
    id: 101,
    guardId: "G-001",
    title: "นาย",
    name: "สมเกียรติ ใจดี",
    phone: "081-123-4567",
    email: "somkiat.j@example.com",
    nationalId: "1234567890123",
    address: "123 ถ.สุขุมวิท กรุงเทพฯ",
    startDate: "2023-01-15",
    status: "Active",
    paymentInfo: {
      bankName: "ธนาคารกสิกรไทย",
      accountName: "นายสมเกียรติ ใจดี",
      accountNumber: "123-4-56789-0",
    },
  },
  {
    id: 102,
    guardId: "G-002",
    title: "นาย",
    name: "มานะ บากบั่น",
    phone: "082-234-5678",
    email: "mana.b@example.com",
    nationalId: "2345678901234",
    address: "456 ถ.พระราม 4 กรุงเทพฯ",
    startDate: "2023-02-20",
    status: "Active",
    paymentInfo: {
      bankName: "ธนาคารไทยพาณิชย์",
      accountName: "นายมานะ บากบั่น",
      accountNumber: "234-5-67890-1",
    },
  },
  {
    id: 103,
    guardId: "G-003",
    title: "นางสาว",
    name: "อารี เมตตา",
    phone: "083-345-6789",
    email: "aree.m@example.com",
    nationalId: "3456789012345",
    address: "789 ถ.เพชรบุรี กรุงเทพฯ",
    startDate: "2023-03-10",
    status: "Inactive",
    paymentInfo: {
      bankName: "ธนาคารกรุงเทพ",
      accountName: "นางสาวอารี เมตตา",
      accountNumber: "345-6-78901-2",
    },
  },
];

export const initialStaff = [
  {
    id: 201,
    staffId: "S-001",
    title: "นางสาว",
    name: "สมศรี มีสุข",
    position: "ฝ่ายบุคคล",
    phone: "088-111-2222",
    email: "somsri.m@example.com",
    status: "Active",
  },
  {
    id: 202,
    staffId: "S-002",
    title: "นาย",
    name: "วิชัย ชาญชัย",
    position: "ฝ่ายบัญชี",
    phone: "088-222-3333",
    email: "vichai.c@example.com",
    status: "Active",
  },
  {
    id: 203,
    staffId: "S-003",
    title: "นาง",
    name: "มานี ใจงาม",
    position: "ฝ่ายประสานงาน",
    phone: "088-333-4444",
    email: "manee.j@example.com",
    status: "Resigned",
  },
];

export const initialBanks = [
  { id: 1, code: '004', name: 'ธนาคารกสิกรไทย', shortNameEN: 'KBANK' },
  { id: 2, code: '014', name: 'ธนาคารไทยพาณิชย์', shortNameEN: 'SCB' },
  { id: 3, code: '002', name: 'ธนาคารกรุงเทพ', shortNameEN: 'BBL' },
  { id: 4, code: '006', name: 'ธนาคารกรุงไทย', shortNameEN: 'KTB' },
  { id: 5, code: '025', name: 'ธนาคารกรุงศรีอยุธยา', shortNameEN: 'BAY' },
];

export const initialAdvanceDocuments = [
  { id: 1, docNumber: 'ADV-20250826-001', date: '2025-08-26', type: 'advance', status: 'Pending', createdBy: 'supervisor1', items: [{ guardId: 101, amount: 300, reason: 'ค่าเดินทาง' }, { guardId: 102, amount: 250, reason: 'ค่าอาหาร' }] },
  { id: 2, docNumber: 'CASH-20250826-002', date: '2025-08-26', type: 'cash', status: 'Approved', createdBy: 'supervisor2', items: [{ guardId: 103, amount: 600, reason: 'เงินควงพิเศษ' }] },
  { id: 3, docNumber: 'ADV-20250826-003', date: '2025-08-26', type: 'advance', status: 'Draft', createdBy: 'supervisor1', items: [{ guardId: 102, amount: 100, reason: 'ค่ากาแฟ' }] }
];