import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { fetchAdminInventory } from "../../services/inventory";
import "./InventoryDashboard.css";

export default function InventoryDashboard() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchAdminInventory();
      setInventory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      <h1 className="inv-title">Weekly Inventory Monitor</h1>
      
      {inventory.length > 0 && (
        <p className="inv-sub">Week of {inventory[0].week_start} to {inventory[0].week_end}</p>
      )}
      {inventory.length === 0 && <p className="inv-sub">Current week overview</p>}

      {loading ? (
        <div className="inv-loader">
          <Loader2 size={36} className="inv-loader-icon" />
          <span>Loading inventory...</span>
        </div>
      ) : (
        <div className="inv-table-container">
          <table className="inv-table">
            <thead>
              <tr>
                <th className="inv-th">Format</th>
                <th className="inv-th">Weekly Limit</th>
                <th className="inv-th">Booked Slots</th>
                <th className="inv-th">Remaining Slots</th>
                <th className="inv-th">Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((inv, index) => (
                <tr key={index} className="inv-tr">
                  <td className="inv-td inv-td-strong">{inv.format}</td>
                  <td className="inv-td">{inv.weekly_limit}</td>
                  <td className="inv-td">{inv.booked_slots}</td>
                  <td className="inv-td">{inv.remaining_slots}</td>
                  <td className="inv-td">
                    {inv.sold_out ? (
                      <span className="inv-chip inv-chip-error">Sold Out</span>
                    ) : (
                      <span className="inv-chip inv-chip-success">Available</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
