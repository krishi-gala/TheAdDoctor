import PackageTable from "../../components/admin/PackageTable";
import { hasPermission } from "../../services/auth";
import { PERMISSIONS } from "../../constants/permissions";
import "./PackagesPage.css";

export default function PackagesPage() {
  const canManagePackages = hasPermission(PERMISSIONS.MANAGE_PACKAGES);

  if (!canManagePackages) {
    return (
      <p className="pp-permission-error">
        You do not have permission to manage packages.
      </p>
    );
  }

  return <PackageTable />;
}
