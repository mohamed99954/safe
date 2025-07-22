import { TranslationSection } from "./types";

export const complaints: TranslationSection = {
  // Existing complaint form keys
  reportProblem: {
    ar: "الإبلاغ عن مشكلة",
    en: "Report a Problem",
  },
  issueType: {
    ar: "نوع المشكلة",
    en: "Issue Type",
  },
  issueTypeRequired: {
    ar: "نوع المشكلة مطلوب",
    en: "Issue type is required",
  },
  selectIssueType: {
    ar: "اختر نوع المشكلة",
    en: "Select issue type",
  },
  issueTypeLogin: {
    ar: "تسجيل الدخول",
    en: "Login",
  },
  issueTypeOrder: {
    ar: "الطلب",
    en: "Order",
  },
  issueTypePayment: {
    ar: "الدفع",
    en: "Payment",
  },
  issueTypeDriver: {
    ar: "السائق",
    en: "Driver",
  },
  issueTypeCustomer: {
    ar: "العميل",
    en: "Customer",
  },
  issueTypeOther: {
    ar: "أخرى",
    en: "Other",
  },
  orderNumberTitle: {
    ar: "رقم الطلب",
    en: "Order Number",
  },
  enterOrderNumber: {
    ar: "أدخل رقم الطلب إن وُجد",
    en: "Enter order number if available",
  },
  problemDescription: {
    ar: "وصف المشكلة",
    en: "Problem Description",
  },
  problemDescriptionRequired: {
    ar: "وصف المشكلة مطلوب (10 أحرف على الأقل)",
    en: "Problem description is required (at least 10 characters)",
  },
  describeProblemPlaceholder: {
    ar: "اشرح المشكلة بالتفصيل...",
    en: "Describe the problem in detail...",
  },
  attachFile: {
    ar: "إرفاق ملف (اختياري)",
    en: "Attach File (Optional)",
  },
  clickToSelectFile: {
    ar: "اضغط لاختيار ملف أو اسحبه هنا",
    en: "Click to select file or drag it here",
  },
  supportedFileTypes: {
    ar: "أنواع الملفات المدعومة: JPEG, PNG, GIF, PDF, TXT (حد أقصى 5MB)",
    en: "Supported file types: JPEG, PNG, GIF, PDF, TXT (Max 5MB)",
  },
  uploadingFile: {
    ar: "رفع الملف...",
    en: "Uploading file...",
  },
  fileTooLarge: {
    ar: "حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت",
    en: "File size is too large. Maximum 5 MB allowed",
  },
  unsupportedFileType: {
    ar: "نوع الملف غير مدعوم. يُسمح بـ: JPEG, PNG, GIF, PDF, TXT",
    en: "Unsupported file type. Allowed: JPEG, PNG, GIF, PDF, TXT",
  },
  fileUploadError: {
    ar: "حدث خطأ في رفع الملف",
    en: "Error uploading file",
  },
  reviewInfoMessage: {
    ar: "سيتم مراجعة شكواك من قبل فريق الدعم وستحصل على إشعار بالرد خلال 24-48 ساعة.",
    en: "Your complaint will be reviewed by the support team and you will receive a notification with a response within 24-48 hours.",
  },
  cancel: {
    ar: "إلغاء",
    en: "Cancel",
  },
  submitComplaint: {
    ar: "إرسال الشكوى",
    en: "Submit Complaint",
  },
  submitting: {
    ar: "جاري الإرسال...",
    en: "Submitting...",
  },
  complaintSubmittedSuccess: {
    ar: "تم إرسال الشكوى بنجاح. سيتم مراجعتها قريباً.",
    en: "Complaint submitted successfully. It will be reviewed soon.",
  },
  loginRequired: {
    ar: "يجب تسجيل الدخول أولاً",
    en: "You must log in first",
  },
  permissionError: {
    ar: "خطأ في الصلاحيات. يرجى المحاولة مرة أخرى.",
    en: "Permission error. Please try again.",
  },
  dataValidationError: {
    ar: "خطأ في البيانات. يرجى التحقق من المعلومات المدخلة.",
    en: "Data validation error. Please check the entered information.",
  },
  genericSubmissionError: {
    ar: "حدث خطأ في إرسال الشكوى. يرجى المحاولة مرة أخرى.",
    en: "An error occurred while submitting the complaint. Please try again.",
  },
  complaintConfirmationTitle: {
    ar: "تأكيد استلام الشكوى",
    en: "Complaint Receipt Confirmation",
  },
  complaintConfirmationMessage: {
    ar: "تم استلام شكواك بخصوص {issueType}. سيتم مراجعتها خلال 24-48 ساعة.",
    en: "Your complaint regarding {issueType} has been received. It will be reviewed within 24-48 hours.",
  },
  newComplaintTitle: {
    ar: "شكوى جديدة",
    en: "New Complaint",
  },
  newComplaintMessage: {
    ar: "تم تلقي شكوى جديدة من {userName} بخصوص {issueType}",
    en: "A new complaint has been received from {userName} regarding {issueType}",
  },
  defaultUserName: {
    ar: "مستخدم",
    en: "User",
  },
  requiredField: {
    ar: "*",
    en: "*",
  },

  // User Types
  driver: {
    ar: "سائق",
    en: "Driver",
  },
  customer: {
    ar: "عميل",
    en: "Customer",
  },
  userType: {
    ar: "نوع المستخدم",
    en: "User Type",
  },

  // Notification type indicators
  driverNotification: {
    ar: "إشعار السائق",
    en: "Driver Notification",
  },
  customerNotification: {
    ar: "إشعار العميل",
    en: "Customer Notification",
  },

  // General terms
  notSpecified: {
    ar: "غير محدد",
    en: "Not Specified",
  },
  notAvailable: {
    ar: "غير متوفر",
    en: "Not Available",
  },

  // Admin Complaints Management - Page Title and Header
  complaintsManagementTitle: {
    ar: "إدارة الشكاوى والدعم",
    en: "Complaints and Support Management",
  },
  complaintsManagementDescription: {
    ar: "إدارة ومتابعة جميع شكاوى المستخدمين",
    en: "Manage and follow up on all user complaints",
  },

  // Search and Filters
  searchComplaints: {
    ar: "بحث عن شكوى...",
    en: "Search for complaint...",
  },
  allTypes: {
    ar: "جميع الأنواع",
    en: "All Types",
  },
  exportComplaints: {
    ar: "تصدير الشكاوى",
    en: "Export Complaints",
  },
  export: {
    ar: "تصدير",
    en: "Export",
  },

  // Statistics Cards
  totalComplaints: {
    ar: "إجمالي الشكاوى",
    en: "Total Complaints",
  },
  pendingReview: {
    ar: "قيد المراجعة",
    en: "Pending Review",
  },
  resolved: {
    ar: "تم الحل",
    en: "Resolved",
  },
  resolutionRate: {
    ar: "معدل الحل",
    en: "Resolution Rate",
  },

  // Table Headers
  complaintNumber: {
    ar: "رقم الشكوى",
    en: "Complaint Number",
  },
  user: {
    ar: "المستخدم",
    en: "User",
  },
  email: {
    ar: "البريد الإلكتروني",
    en: "Email",
  },
  issueTypeHeader: {
    ar: "نوع المشكلة",
    en: "Issue Type",
  },
  orderNumberHeader: {
    ar: "رقم الطلب",
    en: "Order Number",
  },
  description: {
    ar: "وصف المشكلة",
    en: "Description",
  },
  date: {
    ar: "التاريخ",
    en: "Date",
  },
  status: {
    ar: "الحالة",
    en: "Status",
  },
  actions: {
    ar: "الإجراءات",
    en: "Actions",
  },

  // Compact Table Headers
  complaint: {
    ar: "الشكوى",
    en: "Complaint",
  },
  type: {
    ar: "النوع",
    en: "Type",
  },
  view: {
    ar: "عرض",
    en: "View",
  },

  // Status Values
  statusResolved: {
    ar: "تم الحل",
    en: "Resolved",
  },
  statusPending: {
    ar: "قيد المراجعة",
    en: "Under Review",
  },
  statusResolvedShort: {
    ar: "حُل",
    en: "Solved",
  },
  statusPendingShort: {
    ar: "قيد",
    en: "Pending",
  },

  // Common Values
  notAvailable: {
    ar: "غير متوفر",
    en: "Not Available",
  },
  notSpecified: {
    ar: "غير محدد",
    en: "Not Specified",
  },
  invalidDate: {
    ar: "تاريخ غير صحيح",
    en: "Invalid Date",
  },

  // Tabs
  allComplaints: {
    ar: "جميع الشكاوى",
    en: "All Complaints",
  },
  all: {
    ar: "الكل",
    en: "All",
  },
  pending: {
    ar: "معلقة",
    en: "Pending",
  },
  resolvedTab: {
    ar: "محلولة",
    en: "Resolved",
  },

  // Empty State
  noComplaintsInCategory: {
    ar: "لا توجد شكاوى في هذه الفئة",
    en: "No complaints in this category",
  },

  // Loading and Error States
  loadingComplaints: {
    ar: "جاري تحميل الشكاوى...",
    en: "Loading complaints...",
  },
  errorLoadingData: {
    ar: "حدث خطأ في تحميل البيانات",
    en: "Error loading data",
  },
  errorLoadingComplaints: {
    ar: "حدث خطأ أثناء تحميل الشكاوى. يرجى المحاولة مرة أخرى لاحقاً.",
    en: "An error occurred while loading complaints. Please try again later.",
  },
  retryLoading: {
    ar: "إعادة المحاولة",
    en: "Try Again",
  },

  // Search Results
  searchResults: {
    ar: "نتائج البحث",
    en: "Search Results",
  },
  searchResultsCount: {
    ar: "نتائج البحث ({count} من {total})",
    en: "Search Results ({count} of {total})",
  },

  // Export Success
  exportSuccess: {
    ar: "تم تصدير الشكاوى بنجاح",
    en: "Complaints exported successfully",
  },

  // Mobile Card
  viewFullDetails: {
    ar: "عرض التفاصيل الكاملة",
    en: "View Full Details",
  },

  // Complaint Details Modal
  complaintDetails: {
    ar: "تفاصيل الشكوى",
    en: "Complaint Details",
  },
  userName: {
    ar: "اسم المستخدم",
    en: "User Name",
  },
  emailAddress: {
    ar: "البريد الإلكتروني",
    en: "Email Address",
  },
  submissionDate: {
    ar: "تاريخ الإرسال",
    en: "Submission Date",
  },
  attachment: {
    ar: "المرفق",
    en: "Attachment",
  },
  viewAttachment: {
    ar: "عرض المرفق",
    en: "View Attachment",
  },
  adminResponse: {
    ar: "الرد على الشكوى (اختياري)",
    en: "Admin Response (Optional)",
  },
  writeResponsePlaceholder: {
    ar: "اكتب ردك هنا...",
    en: "Write your response here...",
  },
  responseNotificationNote: {
    ar: "سيتم إرسال إشعار للمستخدم بالرد",
    en: "A notification will be sent to the user with the response",
  },
  markAsResolved: {
    ar: "تم الحل",
    en: "Mark as Resolved",
  },
  updatingComplaint: {
    ar: "جاري التحديث...",
    en: "Updating...",
  },

  // Admin Response Messages
  complaintResolvedTitle: {
    ar: "تم حل الشكوى",
    en: "Complaint Resolved",
  },
  complaintResolvedWithResponse: {
    ar: "تم حل شكواك رقم {complaintNumber} بخصوص {issueType}. الرد: {response}",
    en: "Your complaint #{complaintNumber} regarding {issueType} has been resolved. Response: {response}",
  },
  complaintResolvedWithoutResponse: {
    ar: "تم حل شكواك رقم {complaintNumber} بخصوص {issueType} بنجاح.",
    en: "Your complaint #{complaintNumber} regarding {issueType} has been successfully resolved.",
  },

  // Success/Error Messages
  complaintStatusUpdated: {
    ar: "تم تحديث حالة الشكوى وإرسال إشعار للمستخدم",
    en: "Complaint status updated and notification sent to user",
  },
  errorUpdatingComplaint: {
    ar: "حدث خطأ في تحديث الشكوى",
    en: "Error updating complaint",
  },
};
