import React, { useState, useEffect } from 'react';
import { fetchAllTimeRevenue } from '../../utils/api';

const Statistics = () => {
  const [totalRevenue, setTotalRevenue] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const getRevenue = async () => {
      try {
        const result = await fetchAllTimeRevenue();
        const parsedBody = JSON.parse(result.body); // Parse the body to extract total_revenue
        console.log(parsedBody); // Log the parsed result
        setTotalRevenue(parsedBody.total_revenue);
      } catch (error) {
        console.error('Error fetching total revenue:', error);
        setError('Failed to fetch revenue');
      }
    };

    getRevenue();
  }, []);

  return (
    <div className="statistics-page">
      <h1>All-Time Revenue</h1>
      {error && <p className="error-message">{error}</p>}
      {totalRevenue !== null ? (
        <h2>Total Revenue: ${totalRevenue}</h2>
      ) : (
        <p>Loading revenue...</p>
      )}
    </div>
  );
};

export default Statistics;
