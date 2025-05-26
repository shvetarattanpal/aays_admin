'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Order {
  orderId: string;
  status: string;
}

export default function UpdateOrderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [orderId, setOrderId] = useState('');
  const [status, setStatus] = useState('');
  const [currentStatus, setCurrentStatus] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const queryOrderId = searchParams?.get('orderId') ?? '';

  useEffect(() => {
    if (queryOrderId) {
      setOrderId(queryOrderId);
      fetchOrderStatus(queryOrderId);
    }
  }, [queryOrderId]);

  const fetchOrderStatus = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to fetch order');

      setCurrentStatus(data.orderDetails.status);
      setStatus(data.orderDetails.status);
    } catch (err: any) {
      setMessage(err.message || 'Could not load order');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      if (!orderId || !status) {
        setMessage('Order ID and status are required');
        return;
      }

      const res = await fetch('/api/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');

      setMessage(`✅ Order ${orderId} updated to ${status}`);
    } catch (error: any) {
      setMessage(`❌ ${error.message}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6 text-black">
      <h1 className="text-3xl font-bold text-center mb-6">Update Order</h1>

      <label className="block mb-2 font-semibold">Order ID:</label>
      <input
        type="text"
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        className="w-full border px-3 py-2 mb-4 rounded"
        placeholder="Enter Order ID"
      />

      {currentStatus && (
        <p className="text-sm mb-2 text-gray-500">
          Current Status: <strong>{currentStatus}</strong>
        </p>
      )}

      <label className="block mb-2 font-semibold">New Status:</label>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="w-full border px-3 py-2 mb-6 rounded"
      >
        <option value="">Select status</option>
        <option value="Ordered">Ordered</option>
        <option value="Shipped">Shipped</option>
        <option value="Out for Delivery">Out for Delivery</option>
        <option value="Delivered">Delivered</option>
      </select>

      <button
        onClick={handleUpdate}
        className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition w-full"
        disabled={loading}
      >
        {loading ? 'Updating...' : 'Update Status'}
      </button>

      {message && <p className="mt-4 text-center text-sm">{message}</p>}
    </div>
  );
}