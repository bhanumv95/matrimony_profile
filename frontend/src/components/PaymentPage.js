// frontend/src/components/PaymentPage.js
import React, { useState } from 'react';

function PaymentPage() {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const handlePayment = async () => {
    setError("");
    const payAmount = parseFloat(amount);
    if (!payAmount || payAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    try {
      const token = localStorage.getItem('token');
      // Create order by calling backend
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ amount: payAmount })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to initiate payment.");
      } else {
        // Prepare Razorpay options
        const options = {
          key: data.key, // Razorpay publishable key
          amount: data.amount.toString(), // amount in paise
          currency: data.currency,
          name: "ShaadiBiodata",
          description: "Premium Membership",
          order_id: data.orderId,
          handler: function (response) {
            // This function is called when payment is successful
            alert("Payment successful! Payment ID: " + response.razorpay_payment_id);
            // TODO: You could inform the server about the payment success or update UI
          },
          prefill: {
            name: localStorage.getItem('name') || "",
            email: ""  // you could add email here if available
            // contact: "" // phone if you have it
          }
        };
        // Open Razorpay checkout
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError("An error occurred during payment.");
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto' }}>
      <h2>Upgrade Plan - Payment</h2>
      <p>Enter an amount (INR) to pay for the premium plan:</p>
      <input 
        type="number" 
        value={amount} 
        onChange={(e) => setAmount(e.target.value)} 
        placeholder="Amount in INR" 
      />
      <button onClick={handlePayment} style={{ marginLeft: '10px' }}>Pay Now</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p style={{ marginTop: '1em' }}>Note: This is a test integration. Use Razorpay test card details to simulate payment.</p>
    </div>
  );
}

export default PaymentPage;
