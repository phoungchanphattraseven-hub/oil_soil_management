// Translations for Bilingual Support (Khmer & English)

export const translations = {
  km: {
    // App Header & Sidebar
    appName: "StationOps Pro",
    appSub: "ប្រព័ន្ធគ្រប់គ្រងស្ថានីយ៍",
    mainNav: "ការរុករកមេ (MAIN NAVIGATION)",
    dashboard: "ផ្ទាំងគ្រប់គ្រង (Dashboard)",
    session1Fuel: "Session 1: ចាក់សាំង (Fuel)",
    session2Soil: "Session 2: ចាក់ដី (Soil)",
    thresholdAlertNav: "កម្រិតស្តុក (Threshold Alert)",
    thresholdAlertDesc: "ស្តុកទាបជាង 4,000 L ត្រូវរាយការណ៍សុំបន្ថែមភ្លាមៗ។ Target: 6,000 L",
    
    // Header
    admin: "Admin",
    phattra: "Phattra",
    adminRole: "អ្នកគ្រប់គ្រង (Admin)",
    phattraRole: "បុគ្គលិកប្រតិបត្តិការ (Phattra)",

    // Alert Banner
    alertTitle: "ការប្រកាសអាសន្ន៖ កម្រិតស្តុកសាំងទាបជាង 4,000 L! (Reorder Threshold Alert)",
    alertDesc: "មាន {count} ស្ថានីយ៍ត្រូវប្រញាប់រាយការណ៍សុំបន្ថែមសាំងចូលស្តុកឲ្យគ្រប់ 6,000 L:",
    reorderBtn: "រាយការណ៍សុំបន្ថែមសាំង",

    // Dashboard Stats
    totalFuelStock: "ស្តុកសាំងសរុប (Total Fuel)",
    totalCapacityOf: "នៃសមត្ថភាពសរុប",
    alertsCount: "ស្ថានីយ៍ត្រូវសុំសាំង (Alerts)",
    belowThreshold: "ស្តុកទាបជាង 4,000 L",
    totalSoilVolume: "មាឌដីចាក់សរុប (Soil m³)",
    totalTripsCount: "សរុប {trips} ជើងដឹក",
    scrapSalesIncome: "ចំណូលលក់សឡាក់ ($)",
    soilAndScrap: "ចាក់ដី & សមារៈសល់",

    // Dashboard Panels
    fuelStationsTitle: "Session 1: ស្ថានីយ៍ចាក់សាំង (Fuel Stations)",
    soilStationsTitle: "Session 2: ស្ថានីយ៍ចាក់ដី (Soil & Earthwork)",
    fuelBadge: "កម្រិតស្តុក 6000L / Threshold 4000L",
    soilBadge: "ការសម្រេចចិត្តរបស់បុគ្គលិក",

    // Fuel Station Card
    reorderNeeded: "ត្រូវសុំបន្ថែម",
    normalStock: "ស្តុកធម្មតា",
    currentStockLevel: "កម្រិតស្តុកបច្ចុប្បន្ន",
    lastRefill: "ចាក់ចុងក្រោយ",
    recordRefill: "កត់ត្រាការចាក់",
    deleteStation: "លុបស្ថានីយ៍",
    confirmDeleteStation: "តើអ្នកពិតជាចង់លុបស្ថានីយ៍សាំងនេះមែនទេ?",

    // Soil Station Card
    tripsCount: "ចំនួនជើងដឹក",
    tripsUnit: "ជើង",
    totalVolumeLabel: "មាឌដីសរុប",
    scrapSalesLabel: "លក់សឡាក់",
    staffDecisionLabel: "ការសម្រេចចិត្តរបស់បុគ្គលិក (Staff Decision):",
    issuesLabel: "បញ្ហាជួបប្រទះ:",

    // SOP Summary Table
    sopTitle: "តារាងសង្ខេបបទដ្ឋានប្រតិបត្តិការ (Standard Operational Summary Table - Section 4)",
    thSection: "ផ្នែក / ប្រធានបទ",
    thIndicator: "សូចនាករ / ព័ត៌មានសំខាន់",
    thStandard: "បទដ្ឋាន និងសកម្មភាពត្រូវអនុវត្ត",
    thStatus: "ស្ថានភាពអនុវត្ត",

    // Fuel Management Page
    fuelPageTitle: "Session 1: ការគ្រប់គ្រងការចាក់សាំង និងស្តុកសាំង (Fuel & Refueling)",
    fuelPageSub: "តាមដានកម្រិតស្តុក 6,000L និងកំណត់រាយការណ៍សុំបន្ថែមភ្លាមៗនៅពេលស្តុកទាបជាង 4,000L",
    fuelFormTitle: "កត់ត្រាការចាក់/បំពេញសាំងចូលស្តុក (Refueling Entry Form)",
    fuelFormSuccess: "បានកត់ត្រាទិន្នន័យចាក់សាំងជោគជ័យ និងធ្វើបច្ចុប្បន្នភាពស្តុក!",
    selectStation: "ជ្រើសរើសស្ថានីយ៍សាំង (Select Station)",
    refillLiters: "បរិមាណសាំងប្រើប្រាស់ថ្ងៃនេះ (Volume Spent Today - L)",
    timeIn: "ម៉ោងចូល (Time In)",
    timeOut: "ម៉ោងចេញ (Time Out)",
    transportType: "មធ្យោបាយដឹកជញ្ជូន / ប្រភេទឡាន (Transport / Vehicle Type)",
    codeAbbr: "ផ្លាកលេខឡាន (License Plate)",
    createCode: "បន្ថែមផ្លាកលេខថ្មី (Add License Plate)",
    selectOrCreateCode: "ជ្រើសរើស ឬ វាយបញ្ចូលផ្លាកលេខ",
    manageCodes: "គ្រប់គ្រងផ្លាកលេខ (Manage License Plates)",
    photoUrl: "រូបថតសកម្មភាព/វិក្កយបត្រ (Upload Photo)",
    signatureUrl: "តំណភ្ជាប់ហត្ថលេខា (Signature URL)",
    saveFuelLog: "រក្សាទុករបាយការណ៍ចាក់សាំង",

    // Fuel Logs Table
    fuelLogsTitle: "ប្រវត្តិប្រតិបត្តិការចាក់សាំង (Refueling Logs History)",
    thStation: "ស្ថានីយ៍ (Station)",
    thVolume: "បរិមាណ (Volume L)",
    thTimeInOut: "ម៉ោងចូល - ម៉ោងចេញ",
    thTransport: "មធ្យោបាយដឹក",
    thCode: "ផ្លាកលេខ",
    thLoggedBy: "អ្នកកត់ត្រា",
    thMedia: "រូបភាព & ហត្ថលេខា",
    thStatusLabel: "ស្ថានភាព",
    noData: "មិនទាន់មានប្រវត្តិទិន្នន័យនៅឡើយទេ",
    photoLink: "រូបភាព",
    signatureLink: "ហត្ថលេខា",

    // Soil Management Page
    soilPageTitle: "Session 2: ការគ្រប់គ្រងស្ថានីយ៍ចាក់ដី និងការសម្រេចចិត្តរបស់បុគ្គលិក (Soil & Earthwork)",
    soilPageSub: "តាមដានចំនួនជើងដឹក, មាឌដី ($m^3$), ការលក់សឡាក់, វិក្កយបត្រ, និង «ការសម្រេចចិត្តរបស់បុគ្គលិក» (Point 3.2 Correction)",
    totalSoilVolumeStat: "មាឌដីចាក់សរុប",
    totalTripsStat: "ចំនួនជើងដឹកសរុប",
    totalScrapStat: "សរុបការលក់សឡាក់",
    soilFormTitle: "កត់ត្រាសកម្មភាពចាក់ដី & ការសម្រេចចិត្តរបស់បុគ្គលិក (Earthwork Log Form)",
    soilFormSuccess: "បានកត់ត្រាទិន្នន័យចាក់ដី និងការសម្រេចចិត្តរបស់បុគ្គលិកជោគជ័យ!",
    stationNameLabel: "ឈ្មោះស្ថានីយ៍ចាក់ដី (Station Name)",
    dateLabel: "កាលបរិច្ឆេទ (Date)",
    tripCountLabel: "ចំនួនជើងដឹក (Number of Trips)",
    m3PerTripLabel: "មាឌដីក្នុងមួយជើង (m³ / Trip)",
    totalVolumeAuto: "មាឌដីសរុបស្វ័យប្រវត្ត (Total m³)",
    timeRangeLabel: "ម៉ោងចាប់ផ្តើម - ម៉ោងបញ្ចប់ (Time Range)",
    scrapSalesInputLabel: "ការលក់សឡាក់ ($ Scrap Sales Amount)",
    staffDecisionInputLabel: "ការសម្រេចចិត្តរបស់បុគ្គលិក (Staff Decision - Point 3.2 Correction)",
    issuesInputLabel: "បញ្ហាជួបប្រទះ (Operational Issues Encountered)",
    receiptPhotoUrlLabel: "រូបភាពវិក្កយបត្រ (Receipt Photo URL - kept the receipt)",
    saveSoilLog: "រក្សាទុករបាយការណ៍ចាក់ដី",

    // Soil Logs Table
    soilLogsTitle: "ប្រវត្តិប្រតិបត្តិការចាក់ដី (Earthwork Station Logs History)",
    thDateRange: "កាលបរិច្ឆេទ & ម៉ោង",
    thTrips: "ចំនួនជើង",
    thTotalM3: "មាឌដីសរុប (m³)",
    thScrapSales: "លក់សឡាក់ ($)",
    thStaffDecision: "ការសម្រេចចិត្តរបស់បុគ្គលិក (Staff Decision)",
    thReceipt: "វិក្កយបត្រ (Receipt)",
    thIssues: "បញ្ហាជួបប្រទះ",
    receiptLink: "វិក្កយបត្រ",
    none: "គ្មាន"
  },
  en: {
    // App Header & Sidebar
    appName: "StationOps Pro",
    appSub: "Station Management System",
    mainNav: "MAIN NAVIGATION",
    dashboard: "Dashboard Overview",
    session1Fuel: "Session 1: Fuel & Refueling",
    session2Soil: "Session 2: Soil & Earthwork",
    thresholdAlertNav: "Stock Threshold Alert",
    thresholdAlertDesc: "Stock below 4,000 L requires immediate reorder report. Target: 6,000 L",
    
    // Header
    admin: "Admin",
    phattra: "Phattra",
    adminRole: "Administrator",
    phattraRole: "Operations Specialist",

    // Alert Banner
    alertTitle: "Alert: Fuel Stock Below 4,000 L! (Reorder Threshold Alert)",
    alertDesc: "There are {count} station(s) needing urgent fuel replenishment to reach 6,000 L target:",
    reorderBtn: "Report Fuel Reorder",

    // Dashboard Stats
    totalFuelStock: "Total Fuel Stock",
    totalCapacityOf: "of total capacity",
    alertsCount: "Stations Alerted",
    belowThreshold: "Stock below 4,000 L",
    totalSoilVolume: "Total Soil Volume",
    totalTripsCount: "Total {trips} trip(s)",
    scrapSalesIncome: "Scrap Sales Revenue ($)",
    soilAndScrap: "Earthwork & Secondary Sales",

    // Dashboard Panels
    fuelStationsTitle: "Session 1: Fuel Stations",
    soilStationsTitle: "Session 2: Soil & Earthwork Stations",
    fuelBadge: "Target: 6,000L / Threshold: 4,000L",
    soilBadge: "Staff Decision Logs",

    // Fuel Station Card
    reorderNeeded: "Reorder Needed",
    normalStock: "Stock Normal",
    currentStockLevel: "Current Stock Level",
    lastRefill: "Last Refill",
    recordRefill: "Log Refill",
    deleteStation: "Delete Station",
    confirmDeleteStation: "Are you sure you want to delete this fuel station?",

    // Soil Station Card
    tripsCount: "Trips Completed",
    tripsUnit: "trips",
    totalVolumeLabel: "Total Volume",
    scrapSalesLabel: "Scrap Sales",
    staffDecisionLabel: "Staff Decision:",
    issuesLabel: "Operational Issues:",

    // SOP Summary Table
    sopTitle: "Operational Summary Table (Section 4 SOP)",
    thSection: "Section / Subject",
    thIndicator: "Indicator / Key Information",
    thStandard: "Standard Operating Procedure",
    thStatus: "Implementation Status",

    // Fuel Management Page
    fuelPageTitle: "Session 1: Fuel & Refueling Management",
    fuelPageSub: "Monitor stock against 6,000L target capacity and generate alert prompts below 4,000L",
    fuelFormTitle: "Daily Oil Consumption Log",
    fuelFormSuccess: "Oil consumption logged and stock updated!",
    selectStation: "Select Fuel Station",
    refillLiters: "Volume Spent Today (Liters - L)",
    timeIn: "Time In",
    timeOut: "Time Out",
    transportType: "Transport / Vehicle Type",
    codeAbbr: "License Plate",
    createCode: "Add New License Plate",
    selectOrCreateCode: "Select or Enter License Plate",
    manageCodes: "Manage License Plates",
    photoUrl: "Upload Photo",
    signatureUrl: "Signature URL",
    saveFuelLog: "Save Fuel Log Entry",

    // Fuel Logs Table
    fuelLogsTitle: "Refueling History Logs",
    thStation: "Station",
    thVolume: "Volume (L)",
    thTimeInOut: "Time In - Time Out",
    thTransport: "Transport Type",
    thCode: "License Plate",
    thLoggedBy: "Logged By",
    thMedia: "Photo & Signature",
    thStatusLabel: "Status",
    noData: "No history records found",
    photoLink: "Photo",
    signatureLink: "Signature",

    // Soil Management Page
    soilPageTitle: "Session 2: Soil & Earthwork Station Management",
    soilPageSub: "Track trip counts, volume (m³), scrap sales, receipts, and Staff Decisions (Point 3.2 Correction)",
    totalSoilVolumeStat: "Total Soil Volume",
    totalTripsStat: "Total Trips Count",
    totalScrapStat: "Total Scrap Sales",
    soilFormTitle: "Earthwork & Staff Decision Entry Form",
    soilFormSuccess: "Soil log and staff decision recorded successfully!",
    stationNameLabel: "Soil Station Name",
    dateLabel: "Date",
    tripCountLabel: "Number of Trips",
    m3PerTripLabel: "Volume per Trip (m³)",
    totalVolumeAuto: "Auto Calculated Total (m³)",
    timeRangeLabel: "Time Range (Start - End)",
    scrapSalesInputLabel: "Scrap Sales Amount ($)",
    staffDecisionInputLabel: "Staff Decision (Point 3.2 Correction)",
    issuesInputLabel: "Operational Issues Encountered",
    receiptPhotoUrlLabel: "Receipt Photo URL (Kept Receipt)",
    saveSoilLog: "Save Soil Log Entry",

    // Soil Logs Table
    soilLogsTitle: "Earthwork Station Logs History",
    thDateRange: "Date & Time",
    thTrips: "Trips",
    thTotalM3: "Total Volume (m³)",
    thScrapSales: "Scrap Sales ($)",
    thStaffDecision: "Staff Decision",
    thReceipt: "Receipt",
    thIssues: "Issues Encountered",
    receiptLink: "Receipt",
    none: "None"
  }
};
