import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { fetchAdminInventory } from "../../services/inventory";

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
      <style>{`
        .inv-title {
          font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 6px;
        }
        .inv-sub {
          font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 28px;
        }
        .inv-loader {
          text-align: center; padding: 64px 24px; color: rgba(255,255,255,0.45);
        }
        
        .inv-table-container {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          overflow: hidden;
        }
        .inv-table {
          width: 100%; border-collapse: collapse; text-align: left;
        }
        .inv-th {
          padding: 16px; font-size: 12px; font-weight: 600;
          color: rgba(255,255,255,0.4); text-transform: uppercase;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .inv-td {
          padding: 16px; font-size: 14px; color: rgba(255,255,255,0.85);
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .inv-tr:last-child .inv-td { border-bottom: none; }
        .inv-tr:hover { background: rgba(255,255,255,0.02); }

        .inv-chip {
          display: inline-flex; align-items: center; padding: 4px 10px;
          border-radius: 12px; font-size: 12px; font-weight: 600;
        }
        .inv-chip-success {
          background: rgba(34,197,94,0.15); color: #4ade80; border: 1px solid rgba(34,197,94,0.3);
        }
        .inv-chip-error {
          background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3);
        }
      `}</style>

      <h1 className="inv-title">Weekly Inventory Monitor</h1>
      
      {inventory.length > 0 && (
        <p className="inv-sub">Week of {inventory[0].week_start} to {inventory[0].week_end}</p>
      )}
      {inventory.length === 0 && <p className="inv-sub">Current week overview</p>}

      {loading ? (
        <div className="inv-loader">
          <Loader2 size={36} style={{ animation: "spin 1s linear infinite", margin: "0 auto 12px", display: "block" }} />
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
                  <td className="inv-td" style={{ fontWeight: 600 }}>{inv.format}</td>
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
