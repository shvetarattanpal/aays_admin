"use client";

import { useState } from "react";

const statuses = ["Ordered", "Shipped", "Out for Delivery", "Delivered"];

type Props = {
  orderId: string;
  currentStatus: string;
};

export default function OrderStatusForm({ orderId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const updateStatus = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/orders/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Status updated successfully.");
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (err) {
      setMessage("❌ Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-xl w-full max-w-md space-y-4 bg-white shadow">
      <h2 className="text-lg font-semibold">Update Order Status</h2>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="w-full border p-2 rounded"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <button
        onClick={updateStatus}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Updating..." : "Update Status"}
      </button>

      {message && <p className="text-sm">{message}</p>}
    </div>
  );
}