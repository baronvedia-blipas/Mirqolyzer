const en = {
  // Dashboard
  "dashboard.title": "Dashboard",
  "dashboard.totalInvoices": "Total Invoices",
  "dashboard.completed": "Completed",
  "dashboard.processing": "Processing",
  "dashboard.totalValue": "Total Value",
  "dashboard.welcome": "Welcome",
  "dashboard.welcomeSubtitle": "Here is your invoice summary",

  // Upload
  "upload.dragDrop": "Drag & drop your invoice here, or",
  "upload.browse": "browse",
  "upload.fileTypes": "PDF, PNG, JPG, WEBP up to 10MB",
  "upload.singleUpload": "Single Upload",
  "upload.bulkUpload": "Bulk Upload",
  "upload.validating": "Validating file...",
  "upload.uploading": "Uploading...",
  "upload.extracting": "Extracting invoice data...",
  "upload.success": "Invoice processed successfully!",
  "upload.tryAgain": "Try again",
  "upload.viewExisting": "View existing invoice",
  "upload.fileTypeError": "Only PDF, PNG, JPG, WEBP files are allowed",

  // Invoice detail
  "invoice.originalDocument": "Original Document",
  "invoice.extractedData": "Extracted Data",
  "invoice.extractedFields": "Extracted Fields",
  "invoice.notDetected": "Not detected",
  "invoice.category": "Category",
  "invoice.previewNotAvailable": "Document preview not available",

  // Extraction fields
  "field.tax": "TAX",
  "field.date": "DATE",
  "field.total": "TOTAL",
  "field.currency": "CURRENCY",
  "field.subtotal": "SUBTOTAL",
  "field.vendor_name": "VENDOR",
  "field.invoice_number": "INVOICE NUMBER",

  // Filters
  "filters.searchPlaceholder": "Search invoices by vendor or number...",
  "filters.clear": "Clear",
  "filters.status": "Status",
  "filters.category": "Category",
  "filters.from": "From",
  "filters.to": "To",
  "filters.sort": "Sort",
  "filters.all": "All",
  "filters.newest": "Newest",
  "filters.amount": "Amount",
  "filters.vendor": "Vendor",
  "filters.invoiceDate": "Invoice Date",

  // Auth
  "auth.signIn": "Sign In",
  "auth.signingIn": "Signing in...",
  "auth.createAccount": "Create Account",
  "auth.creatingAccount": "Creating account...",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.fullName": "Full Name",
  "auth.signInToAccount": "Sign in to your account",
  "auth.createFreeAccount": "Create your free account",
  "auth.noAccount": "Don't have an account?",
  "auth.hasAccount": "Already have an account?",
  "auth.signUp": "Sign up",
  "auth.orContinueWith": "or continue with",

  // Settings
  "settings.title": "Settings",
  "settings.profile": "Profile",
  "settings.fullName": "Full Name",
  "settings.company": "Company",
  "settings.companyOptional": "Company (optional)",
  "settings.saveChanges": "Save Changes",
  "settings.saving": "Saving...",
  "settings.saved": "Saved!",

  // Billing
  "billing.title": "Billing",
  "billing.currentPlan": "Current Plan",
  "billing.invoicesUsed": "invoices used this month",
  "billing.manageSubscription": "Manage Subscription",
  "billing.upgrade": "Upgrade",
  "billing.loading": "Loading...",

  // Landing / Hero
  "hero.badge": "No AI APIs needed",
  "hero.title": "Analyze invoices",
  "hero.titleAccent": "in seconds",
  "hero.subtitle": "Upload invoices and receipts. Our OCR engine extracts vendor, amounts, dates, and tax data instantly. No AI subscription required.",
  "hero.startFree": "Start Free",
  "hero.viewPricing": "View Pricing",
  "hero.freeInvoices": "5 free invoices/mo",
  "hero.security": "Bank-grade security",
  "hero.noSetup": "No setup required",

  // Features
  "features.title": "Everything you need to process invoices",
  "features.smartOcr": "Smart OCR",
  "features.smartOcrDesc": "Extract text from PDFs and images using advanced OCR technology.",
  "features.editableFields": "Editable Fields",
  "features.editableFieldsDesc": "Review and correct extracted data with confidence indicators.",
  "features.patternLearning": "Pattern Learning",
  "features.patternLearningDesc": "The system learns your vendors' invoice patterns over time.",
  "features.duplicateDetection": "Duplicate Detection",
  "features.duplicateDetectionDesc": "Automatically flags duplicate invoices before they enter your system.",
  "features.export": "CSV & JSON Export",
  "features.exportDesc": "Export your invoice data in the format your accounting software needs.",
  "features.secure": "Secure by Default",
  "features.secureDesc": "Row-level security ensures your data is always private.",

  // Pricing
  "pricing.title": "Simple, transparent pricing",
  "pricing.subtitle": "Start free. Upgrade when you need more.",
  "pricing.mostPopular": "Most Popular",
  "pricing.startFree": "Start Free",
  "pricing.getStarted": "Get Started",
  "pricing.currentPlan": "Current Plan",

  // Navigation
  "nav.dashboard": "Dashboard",
  "nav.settings": "Settings",
  "nav.billing": "Billing",
  "nav.signOut": "Sign out",

  // Common
  "common.delete": "Delete",
  "common.cancel": "Cancel",
  "common.save": "Save",
  "common.loading": "Loading...",
  "common.error": "Error",
  "common.success": "Success",
  "common.invoicesThisMonth": "invoices this month",
  "common.plan": "plan",

  // Status
  "status.completed": "completed",
  "status.processing": "processing",
  "status.failed": "failed",
  "status.uploading": "uploading",

  // Confidence
  "confidence.overall": "Overall confidence",
} as const;

export default en;
