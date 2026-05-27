import PackageTable from "../../components/admin/PackageTable";
import { hasPermission } from "../../services/auth";
import { PERMISSIONS } from "../../constants/permissions";

export default function PackagesPage() {
  const canManagePackages = hasPermission(PERMISSIONS.MANAGE_PACKAGES);

  if (!canManagePackages) {
    return (
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
        You do not have permission to manage packages.
      </p>
    );
  }

  return <PackageTable />;
}
