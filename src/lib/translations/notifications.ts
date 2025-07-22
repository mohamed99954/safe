import { TranslationSection } from "./types";

export const notifications: TranslationSection = {
  // Existing notification keys
  noNotifications: {
    ar: "لا توجد إشعارات",
    en: "No Notifications",
  },
  viewAllNotifications: {
    ar: "عرض جميع الإشعارات",
    en: "View All Notifications",
  },
  markAllAsRead: {
    ar: "تحديد الكل كمقروء",
    en: "Mark All as Read",
  },
  allNotificationsMarkedAsRead: {
    ar: "تم تحديد جميع الإشعارات كمقروءة",
    en: "All notifications marked as read",
  },
  errorUpdatingNotifications: {
    ar: "حدث خطأ أثناء تحديث الإشعارات",
    en: "Error updating notifications",
  },

  // Driver Notifications Page - New keys needed
  notificationsPageTitle: {
    ar: "الإشعارات",
    en: "Notifications",
  },
  newNotification: {
    ar: "جديد",
    en: "New",
  },
  markAsRead: {
    ar: "تحديد كمقروء",
    en: "Mark as Read",
  },
  deleteNotification: {
    ar: "حذف",
    en: "Delete",
  },
  notificationDeleted: {
    ar: "تم حذف الإشعار",
    en: "Notification deleted",
  },
  errorDeletingNotification: {
    ar: "حدث خطأ في حذف الإشعار",
    en: "Error deleting notification",
  },
  errorLoadingNotifications: {
    ar: "حدث خطأ في تحميل الإشعارات",
    en: "Error loading notifications",
  },
  noNotificationsAvailable: {
    ar: "لا توجد إشعارات",
    en: "No notifications available",
  },
  notificationsWillAppearHere: {
    ar: "ستظهر الإشعارات هنا عند وصولها",
    en: "Notifications will appear here when they arrive",
  },

  // Customer Notifications Page - New keys
  customerNotificationsPageTitle: {
    ar: "الإشعارات",
    en: "Notifications",
  },

  // Driver Dashboard - Authentication and Loading
  loading: {
    ar: "جاري التحميل",
    en: "Loading",
  },
  systemError: {
    ar: "خطأ في النظام",
    en: "System Error",
  },
  errorLoadingAccount: {
    ar: "حدث خطأ عند جلب بيانات الحساب",
    en: "Error loading account data",
  },
  refreshPage: {
    ar: "تحديث الصفحة",
    en: "Refresh Page",
  },

  // Driver Dashboard - Account Status
  accountApproved: {
    ar: "تمت الموافقة على حسابك",
    en: "Your account has been approved",
  },
  accountApprovedDesc: {
    ar: "يمكنك الآن استقبال الطلبات والبدء في العمل",
    en: "You can now receive orders and start working",
  },
  accountPending: {
    ar: "حسابك قيد المراجعة",
    en: "Your account is under review",
  },
  accountPendingDesc: {
    ar: "سيتم مراجعة بياناتك خلال 24-48 ساعة",
    en: "Your data will be reviewed within 24-48 hours",
  },
  accountRejected: {
    ar: "تم رفض حسابك",
    en: "Your account has been rejected",
  },
  accountRejectedDesc: {
    ar: "يرجى مراجعة سبب الرفض وإعادة التقديم",
    en: "Please review the rejection reason and reapply",
  },
  rejectionReason: {
    ar: "سبب الرفض",
    en: "Rejection Reason",
  },
  reapplyNote: {
    ar: "يمكنك تعديل بياناتك وإعادة التقديم",
    en: "You can edit your data and reapply",
  },
  reapply: {
    ar: "إعادة التقديم",
    en: "Reapply",
  },
  accountFrozen: {
    ar: "حسابك مجمد",
    en: "Your account is frozen",
  },
  accountFrozenDesc: {
    ar: "تواصل مع الدعم الفني لمعرفة السبب",
    en: "Contact technical support to know the reason",
  },

  // Driver Dashboard - Main Content
  driverDashboardTitle: {
    ar: "لوحة تحكم السائق",
    en: "Driver Dashboard",
  },

  // Customer Dashboard - Main Content
  customerDashboardTitle: {
    ar: "لوحة تحكم العميل",
    en: "Customer Dashboard",
  },

  // Dashboard sections
  overview: {
    ar: "نظرة عامة",
    en: "Overview",
  },
  newOrder: {
    ar: "طلب جديد",
    en: "New Order",
  },
  totalOrders: {
    ar: "إجمالي الطلبات",
    en: "Total Orders",
  },
  inProgress: {
    ar: "قيد التنفيذ",
    en: "In Progress",
  },
  completed: {
    ar: "مكتمل",
    en: "Completed",
  },

  // Driver Dashboard - Statistics Cards
  completedOrdersCount: {
    ar: "الطلبات المكتملة",
    en: "Completed Orders",
  },
  rating: {
    ar: "التقييم",
    en: "Rating",
  },
  availableBalance: {
    ar: "الرصيد المتاح",
    en: "Available Balance",
  },

  // Driver Dashboard - Notifications Section
  notifications: {
    ar: "الإشعارات",
    en: "Notifications",
  },
  newNotifications: {
    ar: "جديد",
    en: "New",
  },
  noNewNotifications: {
    ar: "لا توجد إشعارات جديدة",
    en: "No new notifications",
  },

  // Driver Dashboard - Earnings Section
  earningsSummary: {
    ar: "ملخص الأرباح",
    en: "Earnings Summary",
  },
  totalEarnings: {
    ar: "إجمالي الأرباح",
    en: "Total Earnings",
  },
  platformFee: {
    ar: "رسوم المنصة",
    en: "Platform Fee",
  },
  paymentDetails: {
    ar: "تفاصيل الدفع",
    en: "Payment Details",
  },
  requestWithdrawal: {
    ar: "طلب سحب",
    en: "Request Withdrawal",
  },
  withdrawalRequestSent: {
    ar: "تم إرسال طلب السحب",
    en: "Withdrawal request sent",
  },

  // Driver Dashboard - Support Section
  supportAndHelp: {
    ar: "الدعم والمساعدة",
    en: "Support and Help",
  },
  contactSupport: {
    ar: "تواصل مع الدعم",
    en: "Contact Support",
  },
  faq: {
    ar: "الأسئلة الشائعة",
    en: "FAQ",
  },
  havingProblem: {
    ar: "تواجه مشكلة؟",
    en: "Having a problem?",
  },
  reportIssue: {
    ar: "الإبلاغ عن مشكلة",
    en: "Report Issue",
  },

  // Customer specific sections
  recentOrders: {
    ar: "الطلبات الأخيرة",
    en: "Recent Orders",
  },
  viewAllOrders: {
    ar: "عرض جميع الطلبات",
    en: "View All Orders",
  },
  orderNumber: {
    ar: "رقم الطلب",
    en: "Order Number",
  },
  noOrdersYet: {
    ar: "لا توجد طلبات بعد",
    en: "No orders yet",
  },
  createFirstOrder: {
    ar: "أنشئ طلبك الأول وابدأ رحلة التوصيل الآمن",
    en: "Create your first order and start your safe delivery journey",
  },
  createOrder: {
    ar: "إنشاء طلب",
    en: "Create Order",
  },

  // Order statuses
  pending: {
    ar: "معلق",
    en: "Pending",
  },
  assigned: {
    ar: "مُسند",
    en: "Assigned",
  },
  in_transit: {
    ar: "في الطريق",
    en: "In Transit",
  },
  cancelled: {
    ar: "ملغي",
    en: "Cancelled",
  },

  // Additional hardcoded strings from the component
  unauthorizedAccess: {
    ar: "غير مصرح بالدخول",
    en: "Unauthorized Access",
  },
  pleaseLoginFirst: {
    ar: "يرجى تسجيل الدخول أولاً",
    en: "Please log in first",
  },
  systemErrorOccurred: {
    ar: "خطأ في النظام",
    en: "System Error",
  },
  errorFetchingAccountData: {
    ar: "حدث خطأ عند جلب بيانات الحساب",
    en: "Error occurred while fetching account data",
  },

  // Error messages
  errorLoadingData: {
    ar: "خطأ في تحميل البيانات",
    en: "Error loading data",
  },
};
