import {
  LayoutDashboard,
  Building2,
  Megaphone,
  Package,
  CalendarDays,
  BarChart3,
} from "lucide-react";
import { PERMISSIONS } from "../constants/permissions";

export const ADMIN_MENU_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
    permission: PERMISSIONS.VIEW_DASHBOARD,
  },
  {
    id: "brands",
    label: "Brand Management",
    path: "/admin/brands",
    icon: Building2,
    permission: PERMISSIONS.MANAGE_BRANDS,
  },
  {
    id: "packages",
    label: "Packages",
    path: "/admin/packages",
    icon: Package,
    permission: PERMISSIONS.MANAGE_PACKAGES,
  },
  {
    id: "bookings",
    label: "Bookings",
    path: "/admin/bookings",
    icon: CalendarDays,
    permission: PERMISSIONS.MANAGE_BOOKINGS,
  },
  {
    id: "campaigns",
    label: "Campaign Approval",
    path: "/admin/campaigns",
    icon: Megaphone,
    permission: PERMISSIONS.APPROVE_CAMPAIGNS,
  },
  {
    id: "reports",
    label: "Reports",
    path: "/admin/reports",
    icon: BarChart3,
    permission: PERMISSIONS.VIEW_REPORTS,
  },
];
