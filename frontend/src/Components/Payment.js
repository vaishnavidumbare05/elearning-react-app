import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Payment.css';
import axios from 'axios';
import { useUser } from './UserContext';

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();

  const { title, price, courseId } = location.state || {
    title: 'Sample Course',
    price: '499',
    courseId: null,
  };

  const [method, setMethod] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [pin, setPin] = useState('');
  const [upiId, setUpiId] = useState('');
  const [bankName, setBankName] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [error, setError] = useState('');
  const [customerId, setCustomerId] = useState('');
const [password, setPassword] = useState('');


  const handleMethodSelect = (selectedMethod) => {
    setMethod(selectedMethod);
    setShowForm(true);
    setError('');
    setAccountNumber('');
    setPin('');
    setUpiId('');
    setBankName('');
    setCardName('');
    setCardNumber('');
    setExpiry('');
    setCvv('');
  };

  const validateInputs = () => {
    if (method === 'netbanking') {
      if (!bankName || !customerId || !password) {
        setError('Please fill out all netbanking fields.');
        return false;
      }
      if (!customerId.trim()) {
  setError('Customer ID is required.');
  return false;
}



if (password.length < 4) {
  setError('Password must be at least 4 digits.');
  return false;
}

    } else if (method === 'upi') {
      if (!upiId) {
        setError('Please fill out your UPI ID.');
        return false;
      }
      if (!/@/.test(upiId)) {
  setError('Enter a valid UPI ID (e.g., name@bank).');
  return false;
}

    } else if (method === 'card') {
      if (!cardName || !cardNumber || !expiry || !cvv) {
        setError('Please fill out all card fields.');
        return false;
      }
      if (!/^[a-zA-Z\s]+$/.test(cardName)) {
        setError('Cardholder name must contain only letters.');
        return false;
      }
      if (!/^\d{16}$/.test(cardNumber)) {
        setError('Enter a valid 16-digit card number.');
        return false;
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
        setError('Expiry must be in MM/YY format.');
        return false;
      }
      if (!/^\d{3}$/.test(cvv)) {
        setError('CVV must be a 3-digit number.');
        return false;
      }
    } else {
      setError('Please select a payment method.');
      return false;
    }

    setError('');
    return true;
  };

  const handleEnroll = async (courseTitle) => {
    if (!user || !user.userId) {
      alert('User ID is missing. Please log in again.');
      return;
    }

    const requestData = {
      userId: user.userId,
      courseTitle: courseTitle,
    };

    try {
      const response = await axios.post(
        'http://localhost/backend/api/enroll-course.php',
        requestData,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (response.data.success) {
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        alert(`❌ Enrollment failed: ${response.data.message}`);
      }
    } catch (error) {
      alert('⚠ An error occurred. Please try again.');
    }
  };

  const handlePayment = async () => {
    if (!validateInputs()) return;
    await handleEnroll(title);
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        <h2 className="payment-title">Secure Course Payment</h2>

        <div className="course-info">
          <h3>Course: <span>{title}</span></h3>
          <p>Price: ₹{price}</p>
        </div>

        <h4 className="method-label">Select Payment Method:</h4>
        <div className="method-buttons">
          <button
            onClick={() => handleMethodSelect('netbanking')}
            className={`method-btn ${method === 'netbanking' ? 'active' : ''}`}
          >
            Net Banking
          </button>
          <button
            onClick={() => handleMethodSelect('upi')}
            className={`method-btn ${method === 'upi' ? 'active' : ''}`}
          >
            UPI
          </button>
          <button
            onClick={() => handleMethodSelect('card')}
            className={`method-btn ${method === 'card' ? 'active' : ''}`}
          >
            Credit/Debit Card
          </button>
        </div>

        {showForm && (
          <div className="payment-form">
            {method === 'netbanking' && (
              <>
                <label>Bank Name</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                >
                  <option value="">-- Select Bank --</option>
                  <option value="State Bank of India">State Bank of India</option>
                  <option value="Bank of Maharashtra">Bank of Maharashtra</option>
                  <option value="Bank of India">Bank of India</option>
                  <option value="Union Bank of India">Union Bank of India</option>
                  <option value="HDFC Bank">HDFC Bank</option>
                </select>

              <label>Customer ID</label>
<input
  type="text"
  value={customerId}
  onChange={(e) => setCustomerId(e.target.value)}
  autoComplete="new-password"
/>

<label>Password</label>
<input
  type="password"
  inputMode="numeric"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  autoComplete="new-password"
/>

              </>
            )}

            {method === 'upi' && (
              <>
                <label>UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                 
                  autoComplete="off"
                />
              </>
            )}

            {method === 'card' && (
              <>
                <label>Cardholder Name</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                
                  autoComplete="off"
                />

                <label>Card Number</label>
                <input
                  type="text"
                  maxLength="16"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="16-digit card number"
                  autoComplete="off"
                />

                <label>Expiry Date (MM/YY)</label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/YY"
                  autoComplete="off"
                />

                <label>CVV</label>
                <input
                  type="password"
                  maxLength="3"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="CVV"
                  autoComplete="new-password"
                />
              </>
            )}

            {error && <p className="error-msg">{error}</p>}

            <button className="pay-button" onClick={handlePayment}>
              Pay ₹{price}
            </button>
          </div>
        )}
      </div>

      {showSuccess && (
        <div className="payment-popup">
          <div className="popup-box">
            <div className="success-icon">✅</div>
            <h2>Payment Successful</h2>
            <p>You are now enrolled in <strong>{title}</strong>.</p>
          </div>
        </div>
      )}
    </div>
  );
}
