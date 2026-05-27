export const PERMISSIONS = {
  VIEW_DASHBOARD: "view_dashboard",
  MANAGE_BRANDS: "manage_brands",
  MANAGE_PACKAGES: "manage_packages",
  MANAGE_BOOKINGS: "manage_bookings",
  APPROVE_CAMPAIGNS: "approve_campaigns",
  REVIEW_CREATIVES: "review_creatives",
  VIEW_REPORTS: "view_reports",
  PURCHASE_PACKAGE: "purchase_package",
  BOOK_CAMPAIGN: "book_campaign",
  VIEW_CAMPAIGNS: "view_campaigns",
};

export const BRAND_PERMISSIONS = [
  PERMISSIONS.PURCHASE_PACKAGE,
  PERMISSIONS.BOOK_CAMPAIGN,
  PERMISSIONS.VIEW_CAMPAIGNS,
];

export const ADMIN_HOME_PERMISSION = PERMISSIONS.VIEW_DASHBOARD;
