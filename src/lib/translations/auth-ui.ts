import { TranslationSection } from "./types";

export const authUI: TranslationSection = {
  // Authentication & Common UI
  Dashboard: {
    ar: "لوحة التحكم",
    en: "Dashboard",
  },
  "New Order": {
    ar: "طلب جديد",
    en: "New Order",
  },
  "My Orders": {
    ar: "طلباتي",
    en: "My Orders",
  },
  "Billing & Payment": {
    ar: "الفواتير والدفع",
    en: "Billing & Payment",
  },
  Profile: {
    ar: "الملف الشخصي",
    en: "Profile",
  },
  "Technical Support": {
    ar: "الدعم الفني",
    en: "Technical Support",
  },
  "Feedback & Rating": {
    ar: "التقييم والملاحظات",
    en: "Feedback & Rating",
  },
  Settings: {
    ar: "الإعدادات",
    en: "Settings",
  },
  Logout: {
    ar: "تسجيل الخروج",
    en: "Logout",
  },

  // Welcome message for dashboard
  welcomeCustomerDashboard: {
    ar: "مرحبًا بك في لوحة تحكم العميل",
    en: "Welcome to your Customer Dashboard",
  },

  // Admin authentication messages
  adminAuthRequired: {
    ar: "يجب تسجيل الدخول للوصول إلى لوحة التحكم",
    en: "Login required to access admin dashboard",
  },
  adminCheckError: {
    ar: "حدث خطأ أثناء التحقق من صلاحيات المشرف",
    en: "Error checking admin permissions",
  },
  adminLoggedOut: {
    ar: "تم تسجيل خروجك من لوحة التحكم",
    en: "You have been logged out from admin dashboard",
  },
  adminLoginDescription: {
    ar: "أدخل كلمة المرور للوصول إلى لوحة تحكم المشرف",
    en: "Enter password to access admin panel",
  },
  adminLogin: {
    ar: "تسجيل دخول المشرف",
    en: "Admin Login",
  },
  accountCreatedSuccessfully: {
    ar: "تم إنشاء الحساب بنجاح",
    en: "Account created successfully",
  },
  emailVerificationSuccess: {
    ar: "تم التحقق من البريد الإلكتروني بنجاح",
    en: "Email verified successfully",
  },
  emailVerificationSuccessDescription: {
    ar: "يرجى التحقق من بريدك الإلكتروني وتأكيد حسابك",
    en: "Please check your email and confirm your account",
  },

  requiredFirstName: {
    ar: "الاسم الأول مطلوب",
    en: "First name is required",
  },
  requiredLastName: {
    ar: "الاسم الأخير مطلوب",
    en: "Last name is required",
  },
  requiredEmail: {
    ar: "البريد الإلكتروني مطلوب",
    en: "Email is required",
  },
  invalidEmail: {
    ar: "البريد الإلكتروني غير صالح",
    en: "Invalid email",
  },
  requiredPassword: {
    ar: "كلمة المرور مطلوبة",
    en: "Password is required",
  },
  requiredPhone: {
    ar: "الرقم الهاتفي مطلوب",
    en: "Phone number is required",
  },
  invalidPhoneNumber: {
    ar: "رقم الهاتف مطلوب",
    en: "Phone number is required",
  },
  requiredNationalId: {
    ar: "الرقم القومي مطلوب",
    en: "National ID is required",
  },
  requiredLicenseNumber: {
    ar: "رقم الرخصة مطلوب",
    en: "License number is required",
  },
  requiredVehicleMake: {
    ar: "معلومات المركبة مطلوبة",
    en: "Vehicle information is required",
  },
  requiredVehicleModel: {
    ar: "موديل المركبة مطلوب",
    en: "Vehicle model is required",
  },
  requiredVehicleColor: {
    ar: "لون المركبة مطلوب",
    en: "Vehicle color is required",
  },
  requiredVehiclePlateNumber: {
    ar: "رقم اللوحة المركبة مطلوب",
    en: "Vehicle plate number is required",
  },
  requiredVehicleYear: {
    ar: "سنة المركبة مطلوبة",
    en: "Vehicle year is required",
  },
  requiredPlateNumber: {
    ar: "رقم اللوحة مطلوب",
    en: "Plate number is required",
  },
  requiredLicenseImage: {
    ar: "صورة الرخصة مطلوبة",
    en: "License image is required",
  },
  requiredIdImage: {
    ar: "صورة الهوية مطلوبة",
    en: "ID image is required",
  },
  requiredBirthDate: {
    ar: "تاريخ الميلاد مطلوب",
    en: "Birth date is required",
  },
  passwordMinLength: {
    ar: "يجب أن يكون كلمة المرور أطول من 8 أحرف",
    en: "Password must be at least 8 characters long",
  },
  // Login page translations
  login: {
    ar: "تسجيل الدخول",
    en: "Login",
  },
  loginDescription: {
    ar: "دخول إلى حسابك في منصة سيف دروب",
    en: "Access your SafeDrop account",
  },
  email: {
    ar: "البريد الإلكتروني",
    en: "Email",
  },
  password: {
    ar: "كلمة المرور",
    en: "Password",
  },
  rememberMe: {
    ar: "تذكرني",
    en: "Remember me",
  },
  forgotPassword: {
    ar: "نسيت كلمة المرور؟",
    en: "Forgot password?",
  },
  loggingIn: {
    ar: "جاري تسجيل الدخول...",
    en: "Logging in...",
  },
  noAccount: {
    ar: "ليس لديك حساب؟",
    en: "Don't have an account?",
  },
  registerAsCustomer: {
    ar: "سجل كعميل",
    en: "Register as customer",
  },
  registerAsDriver: {
    ar: "سجل كسائق",
    en: "Register as driver",
  },
  invalidCredentials: {
    ar: "بيانات الدخول غير صحيحة، يرجى التحقق من البريد الإلكتروني وكلمة المرور",
    en: "Invalid login credentials. Please check your email and password",
  },
  emailNotConfirmed: {
    ar: "البريد الإلكتروني غير مؤكد، يرجى التحقق من بريدك الإلكتروني وتأكيد حسابك",
    en: "Email not confirmed. Please check your email and confirm your account",
  },
  loginError: {
    ar: "حدث خطأ أثناء تسجيل الدخول",
    en: "An error occurred during login",
  },
  loginSuccess: {
    ar: "تم تسجيل الدخول بنجاح، مرحباً بك",
    en: "Login successful, welcome back",
  },
  logout: {
    ar: "تسجيل الخروج",
    en: "Logout",
  },
  logoutSuccess: {
    ar: "تم تسجيل الخروج بنجاح",
    en: "Logged out successfully",
  },
  logoutError: {
    ar: "حدث خطأ أثناء تسجيل الخروج",
    en: "An error occurred during logout",
  },
  pleaseEnterEmailPassword: {
    ar: "يرجى إدخال البريد الإلكتروني وكلمة المرور",
    en: "Please enter your email and password",
  },
  loginAsAdmin: {
    ar: "تم تسجيل الدخول كمسؤول",
    en: "Logged in as admin",
  },
  failedToGetUserInfo: {
    ar: "فشل الحصول على معلومات المستخدم",
    en: "Failed to get user information",
  },
  unknownUserType: {
    ar: "نوع المستخدم غير معروف",
    en: "Unknown user type",
  },
  profileCheckError: {
    ar: "حدث خطأ أثناء التحقق من الملف الشخصي",
    en: "Error checking profile",
  },
  loading: {
    ar: "جاري التحميل...",
    en: "Loading...",
  },

  // Password reset translations
  forgotPasswordTitle: {
    ar: "استعادة كلمة المرور",
    en: "Forgot Password",
  },
  forgotPasswordDescription: {
    ar: "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور",
    en: "Enter your email and we'll send you a password reset link",
  },
  pleaseEnterEmail: {
    ar: "يرجى إدخال البريد الإلكتروني",
    en: "Please enter your email",
  },
  sending: {
    ar: "جاري الإرسال...",
    en: "Sending...",
  },
  sendResetLink: {
    ar: "إرسال رابط إعادة التعيين",
    en: "Send Reset Link",
  },
  backToLogin: {
    ar: "العودة إلى تسجيل الدخول",
    en: "Back to Login",
  },
  passwordResetError: {
    ar: "حدث خطأ أثناء إرسال رابط إعادة تعيين كلمة المرور",
    en: "An error occurred sending the password reset link",
  },
  passwordResetEmailSent: {
    ar: "تم إرسال رابط إعادة تعيين كلمة المرور",
    en: "Password reset link sent",
  },
  passwordResetEmailSentDescription: {
    ar: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد الخاص بك.",
    en: "A password reset link has been sent to your email. Please check your inbox.",
  },
  resetPasswordTitle: {
    ar: "إعادة تعيين كلمة المرور",
    en: "Reset Password",
  },
  resetPasswordDescription: {
    ar: "أدخل كلمة المرور الجديدة",
    en: "Enter your new password",
  },
  resetPasswordSecurityNote: {
    ar: "أدخل كلمة المرور الجديدة",
    en: "Enter your new password",
  },

  verifyingResetLink: {
    ar: "جاري التحقق من رابط إعادة التعيين...",
    en: "Verifying reset link...",
  },
  passwordUpdated: {
    ar: "تم تحديث كلمة المرور",
    en: "Password Updated",
  },
  passwordUpdateSuccess: {
    ar: "تم تحديث كلمة المرور بنجاح",
    en: "Password update successful",
  },
  passwordSuccessfullyReset: {
    ar: "تم إعادة تعيين كلمة المرور بنجاح",
    en: "Password successfully reset",
  },
  missingToken: {
    ar: "الرمز مفقود في الرابط",
    en: "Missing token in URL",
  },
  invalidToken: {
    ar: "رمز غير صالح",
    en: "Invalid token",
  },
  tokenExpired: {
    ar: "انتهت صلاحية رابط إعادة التعيين. يرجى طلب رابط جديد.",
    en: "Your reset link has expired. Please request a new one.",
  },
  errorProcessingResetLink: {
    ar: "حدث خطأ أثناء معالجة رابط إعادة التعيين",
    en: "Error processing reset link",
  },
  invalidOrExpiredToken: {
    ar: "رمز غير صالح أو منتهي الصلاحية",
    en: "Invalid or expired token",
  },
  goToForgotPassword: {
    ar: "انتقل إلى صفحة نسيت كلمة المرور",
    en: "Go to Forgot Password",
  },
  sessionExpired: {
    ar: "انتهت صلاحية الجلسة",
    en: "Session expired",
  },

  newPassword: {
    ar: "كلمة المرور الجديدة",
    en: "New Password",
  },
  confirmPassword: {
    ar: "تأكيد كلمة المرور",
    en: "Confirm Password",
  },
  updating: {
    ar: "جاري التحديث...",
    en: "Updating...",
  },
  updatePassword: {
    ar: "تحديث كلمة المرور",
    en: "Update Password",
  },
  pleaseEnterPassword: {
    ar: "يرجى إدخال كلمة المرور",
    en: "Please enter your password",
  },
  passwordsDoNotMatch: {
    ar: "كلمات المرور غير متطابقة",
    en: "Passwords do not match",
  },
  passwordTooShort: {
    ar: "كلمة المرور قصيرة جدًا، يجب أن تكون 6 أحرف على الأقل",
    en: "Password is too short, it must be at least 6 characters",
  },
  passwordUpdateError: {
    ar: "حدث خطأ أثناء تحديث كلمة المرور",
    en: "An error occurred updating your password",
  },
  passwordUpdatedSuccess: {
    ar: "تم تحديث كلمة المرور بنجاح",
    en: "Password updated successfully",
  },
  passwordUpdatedDescription: {
    ar: "تم تحديث كلمة المرور الخاصة بك بنجاح. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.",
    en: "Your password has been updated successfully. You can now login with your new password.",
  },
  redirectingToLogin: {
    ar: "جاري إعادة التوجيه إلى صفحة تسجيل الدخول...",
    en: "Redirecting to login page...",
  },
  loginNow: {
    ar: "تسجيل الدخول الآن",
    en: "Login Now",
  },
  invalidResetLink: {
    ar: "رابط إعادة التعيين غير صالح أو منتهي الصلاحية",
    en: "Invalid or expired reset link",
  },
  userNotFound: {
    ar: "البريد الإلكتروني غير مسجل في النظام",
    en: "Email address is not registered in the system",
  },

  // Security Questions
  securityQuestions: {
    ar: "الأسئلة الأمنية",
    en: "Security Questions",
  },
  setupSecurityQuestions: {
    ar: "إعداد الأسئلة الأمنية",
    en: "Setup Security Questions",
  },
  securityQuestionsDescription: {
    ar: "قم بإعداد أسئلة أمنية لمساعدتك في استعادة حسابك في حال نسيت كلمة المرور",
    en: "Set up security questions to help recover your account if you forget your password",
  },
  securityQuestion: {
    ar: "السؤال الأمني",
    en: "Security Question",
  },
  securityAnswer: {
    ar: "الإجابة الأمنية",
    en: "Security Answer",
  },
  securityQuestionPlaceholder: {
    ar: "اكتب سؤالاً أمنياً خاصاً بك",
    en: "Write your own security question",
  },
  securityAnswerPlaceholder: {
    ar: "اكتب الإجابة على السؤال الأمني",
    en: "Write the answer to your security question",
  },
  saving: {
    ar: "جاري الحفظ...",
    en: "Saving...",
  },
  saveSecurityQuestions: {
    ar: "حفظ الأسئلة الأمنية",
    en: "Save Security Questions",
  },
  updateSecurityQuestions: {
    ar: "تحديث الأسئلة الأمنية",
    en: "Update Security Questions",
  },
  securityQuestionsUpdated: {
    ar: "تم تحديث الأسئلة الأمنية بنجاح",
    en: "Security questions updated successfully",
  },
  securityQuestionsCreated: {
    ar: "تم إنشاء الأسئلة الأمنية بنجاح",
    en: "Security questions created successfully",
  },
  allFieldsRequired: {
    ar: "جميع الحقول مطلوبة",
    en: "All fields are required",
  },
  errorSavingSecurityQuestions: {
    ar: "حدث خطأ أثناء حفظ الأسئلة الأمنية",
    en: "Error saving security questions",
  },
  errorFetchingSecurityQuestions: {
    ar: "حدث خطأ أثناء جلب الأسئلة الأمنية",
    en: "Error fetching security questions",
  },
  securityQuestionsVerification: {
    ar: "يرجى الإجابة على الأسئلة الأمنية التالية للتحقق من هويتك",
    en: "Please answer the following security questions to verify your identity",
  },
  allAnswersRequired: {
    ar: "يرجى الإجابة على جميع الأسئلة",
    en: "Please answer all questions",
  },
  errorCheckingAnswers: {
    ar: "حدث خطأ أثناء التحقق من الإجابات",
    en: "Error checking answers",
  },
  incorrectAnswers: {
    ar: "الإجابات غير صحيحة. يرجى المحاولة مرة أخرى",
    en: "Incorrect answers. Please try again",
  },
  verifyAnswers: {
    ar: "التحقق من الإجابات",
    en: "Verify Answers",
  },
  verifying: {
    ar: "جاري التحقق...",
    en: "Verifying...",
  },
  checking: {
    ar: "جاري التحقق...",
    en: "Checking...",
  },
  continue: {
    ar: "متابعة",
    en: "Continue",
  },
  back: {
    ar: "رجوع",
    en: "Back",
  },
  errorProcessingRequest: {
    ar: "حدث خطأ أثناء معالجة الطلب",
    en: "Error processing request",
  },
  emailForRecovery: {
    ar: "البريد الإلكتروني لاستعادة الحساب",
    en: "Email for Recovery",
  },
  emailForRecoveryDescription: {
    ar: "هذا هو البريد الإلكتروني الذي سيتم استخدامه لاستعادة حسابك في حال نسيت كلمة المرور",
    en: "This is the email that will be used to recover your account if you forget your password",
  },
  importantNote: {
    ar: "ملاحظة هامة",
    en: "Important Note",
  },
  useThisEmailForRecovery: {
    ar: "استخدم هذا البريد الإلكتروني عند محاولة استعادة كلمة المرور، حيث سيتم استخدامه للتحقق من هويتك من خلال الأسئلة الأمنية",
    en: "Use this email when attempting to recover your password, as it will be used to verify your identity through security questions",
  },

  // Registration translations
  register: {
    ar: "التسجيل",
    en: "Register",
  },
  registering: {
    ar: "جاري التسجيل...",
    en: "Registering...",
  },
  registrationSuccess: {
    ar: "تم التسجيل بنجاح",
    en: "Registration successful",
  },
  registrationError: {
    ar: "حدث خطأ أثناء التسجيل",
    en: "An error occurred during registration",
  },
  alreadyHaveAccount: {
    ar: "لديك حساب بالفعل؟",
    en: "Already have an account?",
  },

  // Customer Registration
  customerRegister: {
    ar: "تسجيل العميل",
    en: "Customer Registration",
  },

  // Driver Registration
  driverRegister: {
    ar: "تسجيل السائق",
    en: "Driver Registration",
  },

  // Form fields
  firstName: {
    ar: "الاسم الأول",
    en: "First Name",
  },
  lastName: {
    ar: "اسم العائلة",
    en: "Last Name",
  },
  phone: {
    ar: "رقم الهاتف",
    en: "Phone Number",
  },
  birthDate: {
    ar: "تاريخ الميلاد",
    en: "Birth Date",
  },
  nationalId: {
    ar: "رقم الهوية الوطنية",
    en: "National ID",
  },
  licenseNumber: {
    ar: "رقم رخصة القيادة",
    en: "License Number",
  },

  // Vehicle information
  vehicleMake: {
    ar: "نوع السيارة",
    en: "Vehicle Make",
  },
  vehicleModel: {
    ar: "موديل السيارة",
    en: "Vehicle Model",
  },
  vehicleYear: {
    ar: "سنة الصنع",
    en: "Vehicle Year",
  },
  plateNumber: {
    ar: "رقم اللوحة",
    en: "Plate Number",
  },

  // Image uploads
  idImage: {
    ar: "صورة الهوية",
    en: "ID Image",
  },
  licenseImage: {
    ar: "صورة رخصة القيادة",
    en: "Driver License Image",
  },
  uploadIdImage: {
    ar: "اضغط لتحميل صورة الهوية",
    en: "Click to upload ID image",
  },
  uploadLicenseImage: {
    ar: "اضغط لتحميل صورة الرخصة",
    en: "Click to upload license image",
  },
  clickToChangeImage: {
    ar: "انقر لتغيير الصورة",
    en: "Click to change image",
  },

  // Placeholders
  emailPlaceholder: {
    ar: "البريد الإلكتروني",
    en: "Email",
  },
  phonePlaceholder: {
    ar: "رقم الهاتف",
    en: "Phone Number",
  },

  // AuthCallback translations
  verifyingEmail: {
    ar: "جاري التحقق من البريد الإلكتروني",
    en: "Verifying Email",
  },
  pleaseWaitVerifyingEmail: {
    ar: "يرجى الانتظار بينما نتحقق من بريدك الإلكتروني...",
    en: "Please wait while we verify your email...",
  },
  emailVerificationFailed: {
    ar: "فشل التحقق من البريد الإلكتروني",
    en: "Email Verification Failed",
  },
  emailVerified: {
    ar: "تم التحقق من البريد الإلكتروني",
    en: "Email Verified",
  },
  emailVerifiedSuccess: {
    ar: "تم تأكيد بريدك الإلكتروني بنجاح. جاري تحويلك إلى صفحة تسجيل الدخول...",
    en: "Your email has been verified successfully. Redirecting to login page...",
  },
  goToLoginPage: {
    ar: "الذهاب إلى صفحة تسجيل الدخول",
    en: "Go to Login Page",
  },
  checkingLoginStatus: {
    ar: "جاري التحقق من حالة تسجيل الدخول...",
    en: "Checking login status...",
  },

  // Pending Approval translations
  accountUnderReview: {
    ar: "حسابك قيد المراجعة",
    en: "Your Account is Under Review",
  },
  thankYouForRegistering: {
    ar: "شكرًا لتسجيلك في منصة سيف دروب. طلبك قيد المراجعة من قبل الإدارة. سنُعلمك عبر البريد فور انتهاء المراجعة.",
    en: "Thank you for registering with SafeDrop platform. Your application is under review by our administration. We will notify you via email once the review is complete.",
  },
  whatHappensNow: {
    ar: "ماذا يحدث الآن؟",
    en: "What happens now?",
  },
  reviewStep1: {
    ar: "يقوم فريقنا بالتحقق من بياناتك",
    en: "Our team verifies your information",
  },
  reviewStep2: {
    ar: "قد يستغرق هذا ما بين 1–3 أيام عمل",
    en: "This may take 1-3 business days",
  },
  reviewStep3: {
    ar: "عند الموافقة، ستتم إعادة توجيهك تلقائيًا",
    en: "Upon approval, you will be automatically redirected",
  },
  updateStatus: {
    ar: "تحديث الحالة",
    en: "Update Status",
  },
  applicationApproved: {
    ar: "تمت الموافقة على طلبك",
    en: "Your Application has been Approved",
  },
  canNowUseApp: {
    ar: "يمكنك الآن استخدام تطبيق سائق سيف دروب!",
    en: "You can now use the SafeDrop driver app!",
  },
  goToDashboard: {
    ar: "الذهاب إلى لوحة التحكم",
    en: "Go to Dashboard",
  },
  applicationRejected: {
    ar: "تم رفض طلبك",
    en: "Your Application has been Rejected",
  },
  noRejectionReason: {
    ar: "لم يتم تحديد سبب للرفض",
    en: "No rejection reason specified",
  },
  systemError: {
    ar: "خطأ في النظام",
    en: "System Error",
  },
  retryAction: {
    ar: "إعادة المحاولة",
    en: "Retry",
  },
  backToLoginPage: {
    ar: "العودة إلى صفحة تسجيل الدخول",
    en: "Back to Login Page",
  },
  signOut: {
    ar: "تسجيل الخروج",
    en: "Sign Out",
  },

  // Wait time messages
  pleaseWaitBeforeRetry: {
    ar: "يرجى الانتظار قبل المحاولة مرة أخرى",
    en: "Please wait before trying again",
  },
  timeRemaining: {
    ar: "الوقت المتبقي",
    en: "Time remaining",
  },
  seconds: {
    ar: "ثانية",
    en: "seconds",
  },
  registrationAttemptLimitExceeded: {
    ar: "تم تجاوز الحد المسموح لمحاولات التسجيل. يرجى الانتظار قليلاً.",
    en: "Registration attempt limit exceeded. Please wait a moment.",
  },
  loggingOut: {
    ar: "جاري تسجيل الخروج...",
    en: "Logging out...",
  },

  confirmDeleteDocument: {
    ar: "تأكيد حذف المستند",
    en: "Confirm Document Deletion",
  },
  deleteDocumentWarning: {
    ar: "هل أنت متأكد من حذف هذا المستند؟ لا يمكن التراجع عن هذا الإجراء.",
    en: "Are you sure you want to delete this document? This action cannot be undone.",
  },
  cancel: {
    ar: "إلغاء",
    en: "Cancel",
  },
  delete: {
    ar: "حذف",
    en: "Delete",
  },
  documentDeleteError: {
    ar: "حدث خطأ أثناء حذف المستند",
    en: "Error occurred while deleting document",
  },
  documentDeletedSuccess: {
    ar: "تم حذف المستند بنجاح",
    en: "Document deleted successfully",
  },
  databaseUpdateError: {
    ar: "حدث خطأ أثناء تحديث قاعدة البيانات",
    en: "Error occurred while updating database",
  },
};
