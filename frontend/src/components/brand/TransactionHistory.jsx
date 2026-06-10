import { useCallback, useEffect, useState } from "react";
import { Loader2, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchBrandTransactions } from "../../services/packages";
import "./TransactionHistory.css";

const PAGE_SIZE = 8;

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchBrandTransactions({
        page,
        page_size: PAGE_SIZE,
      });
      setTransactions(response.data.transactions || []);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.total_pages || 1);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to load transaction history."
      );
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <div className="tx-wrap">
        <div className="tx-title-row">
          <h3 className="tx-title">Transaction History</h3>
          <p className="tx-subtitle">Purchase transactions ledger and receipt history</p>
        </div>

        <div className="tx-table-wrap">
          <table className="tx-table">
            <thead>
              <tr>
                <th className="tx-col-ref">Reference Code</th>
                <th className="tx-col-pkg">Package</th>
                <th className="tx-col-amt">Amount</th>
                <th className="tx-col-cr">Credits Added</th>
                <th className="tx-col-date">Date</th>
                <th className="tx-col-status">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6}>
                    <div className="tx-loading">
                      <Loader2
                        size={20}
                        className="tx-loading-spinner"
                      />
                      Loading transaction history...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6}>
                    <div className="tx-error">
                      {error}
                      <br />
                      <button type="button" className="tx-retry-btn" onClick={loadTransactions}>
                        <RotateCcw size={14} />
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="tx-empty">No transaction history found.</div>
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr key={txn.transaction_id}>
                    <td>
                      <span className="tx-ref" title={txn.transaction_reference}>
                        {txn.transaction_reference || "N/A"}
                      </span>
                    </td>
                    <td>
                      <div className="tx-pkg">{txn.package_name || "Custom Package"}</div>
                      <div className="tx-pkg-meta">
                        Expires: {formatDate(txn.expiry_date)}
                      </div>
                    </td>
                    <td>₹{parseFloat(txn.amount).toLocaleString("en-IN")}</td>
                    <td>+{txn.credits_added} credits</td>
                    <td>{formatDate(txn.purchase_date)}</td>
                    <td>
                      <span className={`tx-status-badge ${txn.payment_status?.toLowerCase() || "success"}`}>
                        {txn.payment_status || "Success"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {!loading && !error && transactions.length > 0 && (
            <div className="tx-footer">
              <span className="tx-count">
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, total)} of {total}
              </span>
              <div className="tx-pagination">
                <button
                  type="button"
                  className="tx-page-btn"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="tx-page-num">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  className="tx-page-btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
