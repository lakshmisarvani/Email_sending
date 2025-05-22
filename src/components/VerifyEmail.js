// src/components/VerifyEmail.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function VerifyEmail() {
  const { token } = useParams();
  const [message, setMessage] = useState('Verifying...');

  useEffect(() => {
    async function verify() {
      const res = await fetch(`/api/auth/verify/${token}`);
      const text = await res.text();
      setMessage(text);
    }
    verify();
  }, [token]);

  return (
    <div>
      <h2>Email Verification</h2>
      <p>{message}</p>
    </div>
  );
}

export default VerifyEmail;
