import React, { useState, useEffect } from 'react';
import { fetchAllTimeRevenue } from '../../utils/api';

const Statistics = () => {
  const [totalRevenue, setTotalRevenue] = useState(null);
  const [dailyRevenue, setDailyRevenue] = useState(null);
  const [weeklyRevenue, setWeeklyRevenue] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const getRevenue = async () => {
      try {
        const result = await fetchAllTimeRevenue();
        const parsedBody = JSON.parse(result.body); // Parse the body to extract all revenue types
        console.log(parsedBody); // Log the parsed result
        setTotalRevenue(parsedBody.total_revenue);
        setDailyRevenue(parsedBody.daily_revenue);
        setWeeklyRevenue(parsedBody.weekly_revenue);
        setMonthlyRevenue(parsedBody.monthly_revenue);
      } catch (error) {
        console.error('Error fetching revenues:', error);
        setError('Failed to fetch revenues');
      }
    };

    getRevenue();
  }, []);

  return (
    <div className="statistics-page">
      <h1>Revenue Statistics</h1>
      {error && <p className="error-message">{error}</p>}
      <div>
        {totalRevenue !== null ? (
          <h2>Total Revenue: ${totalRevenue}</h2>
        ) : (
          <p>Loading total revenue...</p>
        )}
      </div>
      <div>
        {dailyRevenue !== null ? (
          <h2>Daily Revenue: ${dailyRevenue}</h2>
        ) : (
          <p>Loading daily revenue...</p>
        )}
      </div>
      <div>
        {weeklyRevenue !== null ? (
          <h2>Weekly Revenue: ${weeklyRevenue}</h2>
        ) : (
          <p>Loading weekly revenue...</p>
        )}
      </div>
      <div>
        {monthlyRevenue !== null ? (
          <h2>Monthly Revenue: ${monthlyRevenue}</h2>
        ) : (
          <p>Loading monthly revenue...</p>
        )}
      </div>
    </div>
  );
};

export default Statistics;
