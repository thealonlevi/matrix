// src/hooks/useTicketData.js
import { useState, useEffect } from 'react';
import { fetchUserInfo, fetchOrderDetails } from '../../../utils/api';

const useTicketData = (selectedTicket) => {
  const [orderInfo, setOrderInfo] = useState('');
  const [userInfo, setUserInfo] = useState('');
  const [userCache, setUserCache] = useState({});

  useEffect(() => {
    const fetchOrderInfo = async () => {
      if (!selectedTicket?.orderID) return;
      const orderData = await fetchOrderDetails(selectedTicket.orderID);
      setOrderInfo(JSON.parse(orderData.body));
    };

    const fetchUserDetails = async () => {
      if (userCache[selectedTicket.userEmail]) {
        setUserInfo(userCache[selectedTicket.userEmail]);
        return;
      }
      const userData = JSON.parse(await fetchUserInfo(selectedTicket.userEmail));
      setUserInfo(userData);
      setUserCache((prevCache) => ({ ...prevCache, [selectedTicket.userEmail]: userData }));
    };

    if (selectedTicket) {
      fetchOrderInfo();
      fetchUserDetails();
    }
  }, [selectedTicket, userCache]);

  return { orderInfo, userInfo };
};

export default useTicketData;
