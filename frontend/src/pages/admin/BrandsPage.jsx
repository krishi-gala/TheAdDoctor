import BrandTable from "../../components/admin/BrandTable";
import { hasPermission } from "../../services/auth";
import { PERMISSIONS } from "../../constants/permissions";

export default function BrandsPage() {
  const canManageBrands = hasPermission(PERMISSIONS.MANAGE_BRANDS);

  if (!canManageBrands) {
    return (
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
        You do not have permission to manage brands.
      </p>
    );
  }

  return <BrandTable />;
}
