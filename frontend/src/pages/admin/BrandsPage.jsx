import BrandTable from "../../components/admin/BrandTable";
import { hasPermission } from "../../services/auth";
import { PERMISSIONS } from "../../constants/permissions";
import "./BrandsPage.css";

export default function BrandsPage() {
  const canManageBrands = hasPermission(PERMISSIONS.MANAGE_BRANDS);

  if (!canManageBrands) {
    return (
      <p className="bp-permission-error">
        You do not have permission to manage brands.
      </p>
    );
  }

  return <BrandTable />;
}
