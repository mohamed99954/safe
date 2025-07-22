import { Translations } from "./types";
import { siteCommon } from "./site-common";
import { ctaSection } from "./cta-section";
import { aboutPage } from "./about-page";
import { contactPage } from "./contact-page";
import { authUI } from "./auth-ui";
import { dashboard } from "./dashboard";
import { supportTranslations } from "./support";
import { accountStatus } from "./account-status";
import { billing } from "./billing";
import { orders } from "./orders";
import { services } from "./services";
import { profile } from "./profile";
import { feedback } from "./feedback";
import { settings } from "./settings";
import { notifications } from "./notifications";
import { driver } from "./driver";
import { pages } from "./pages";
import { complaints } from "./complaints";
import { customers } from "./customers";
import { finance } from "./finance";
import { subscription } from "./subscription";
// Combine all translation sections
export const translations: Translations = {
  ...siteCommon,
  ...ctaSection,
  ...aboutPage,
  ...contactPage,
  ...authUI,
  ...dashboard,
  ...supportTranslations,
  ...accountStatus,
  ...billing,
  ...orders,
  ...services,
  ...profile,
  ...feedback,
  ...settings,
  ...notifications,
  ...complaints,
  ...driver,
  ...customers,
  ...finance,
  ...pages,
  ...subscription,
};
