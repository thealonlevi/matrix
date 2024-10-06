// src/components/Statistics.js

import React, { useState, useEffect } from 'react';
import { fetchAllTimeRevenue } from '../../utils/api';
import './styles/Statistics.css';
import LoadingScreen from '../LoadingScreen';

const Statistics = () => {
  const [totalRevenue, setTotalRevenue] = useState(null);
  const [dailyRevenue, setDailyRevenue] = useState(null);
  const [weeklyRevenue, setWeeklyRevenue] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRevenue = async () => {
      setLoading(true);
      try {
        const result = await fetchAllTimeRevenue();
        const parsedBody = JSON.parse(result.body);
        setTotalRevenue(parsedBody.total_revenue);
        setDailyRevenue(parsedBody.daily_revenue);
        setWeeklyRevenue(parsedBody.weekly_revenue);
        setMonthlyRevenue(parsedBody.monthly_revenue);
      } catch (error) {
        console.error('Error fetching revenues:', error);
        setError('Failed to fetch revenues');
      } finally {
        setLoading(false);
      }
    };

    getRevenue();
  }, []);

  if (loading) {
    return (
      <div style={{ position: 'relative', height: '100vh' }}>
        <LoadingScreen message="Loading revenue statistics..." size="large" />
      </div>
    );
  }

  return (
    <div className="statistics-page">
      <h1 className="page-title">Revenue Statistics</h1>
      {error ? (
        <p className="error-message">{error}</p>
      ) : (
        <div className="revenue-container">
          <RevenueCard label="Total Revenue" value={totalRevenue} />
          <RevenueCard label="Daily Revenue" value={dailyRevenue} />
          <RevenueCard label="Weekly Revenue" value={weeklyRevenue} />
          <RevenueCard label="Monthly Revenue" value={monthlyRevenue} />
        </div>
      )}
    </div>
  );
};

const RevenueCard = ({ label, value }) => (
  <div className="revenue-card">
    <h2 className="revenue-title">{label}</h2>
    <p className="revenue-value">${value ? value.toFixed(2) : 'N/A'}</p>
  </div>
);

export default Statistics;
