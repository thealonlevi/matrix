// src/components/Logout.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'aws-amplify/auth';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    async function signOutt() {
      try {
        await signOut();
        navigate('/');
      } catch (error) {
        console.log('Error signing out: ', error);
      }
    }

    signOutt();
  }, [navigate]);

  return <div>Logging out...</div>;
};

export default Logout;
