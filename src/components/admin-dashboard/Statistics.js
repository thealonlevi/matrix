// src/components/admin-dashboard/Statistics.js

import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { fetchRevenueCache } from '../../utils/api';
import 'chart.js/auto';
import './styles/Statistics.css';
import LoadingScreen from '../LoadingScreen';

const Statistics = () => {
  const [cumulativeRevenue, setCumulativeRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('1 MONTH');
  const [paymentMethod, setPaymentMethod] = useState('All');

  useEffect(() => {
    const getRevenueData = async () => {
      setLoading(true);
      try {
        const result = await fetchRevenueCache();
        console.log("Revenue Cache: ", result);

        if (result) {
          // Sort data and parse all timestamps in UTC
          const sortedData = result
            .map(entry => ({
              ...entry,
              timestamp: new Date(entry.timestamp + 'Z'), // Appends 'Z' to ensure UTC interpretation
            }))
            .sort((a, b) => a.timestamp - b.timestamp);
          setCumulativeRevenue(sortedData);
        } else {
          throw new Error('Revenue data is missing or malformed');
        }
      } catch (error) {
        console.error('Error fetching cumulative revenue data:', error);
        setError('Failed to fetch revenue data');
      } finally {
        setLoading(false);
      }
    };

    getRevenueData();
  }, []);

  const filterAndCalculateCumulativeRevenue = () => {
    const now = new Date();
    const limitDays = { '1 MONTH': 30, '1 WEEK': 7, '1 DAY': 1 }[timeRange];
    let filteredData = cumulativeRevenue.filter(entry => {
      const dayDifference = (now - entry.timestamp) / (1000 * 60 * 60 * 24);
      return dayDifference < limitDays && (paymentMethod === 'All' || entry.paymentMethod === paymentMethod);
    });

    let recalculatedRevenue, dateLabels;

    if (timeRange === '1 DAY') {
      // Generate the last 24 hours based on the current UTC time
      const hours = Array.from({ length: 24 }, (_, i) => {
        const hour = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
        hour.setUTCHours(hour.getUTCHours(), 0, 0, 0); // Set to the start of the hour in UTC
        return {
          hour: hour.getUTCHours(),
          label: hour.toISOString().split('T')[1].slice(0, 5), // Format as "HH:MM" in UTC
          revenue: 0,
        };
      });

      // Populate hourly revenue data
      filteredData.forEach(entry => {
        const entryHour = entry.timestamp.getUTCHours();
        const hourIndex = hours.findIndex(hour => hour.hour === entryHour);
        if (hourIndex !== -1) hours[hourIndex].revenue += parseFloat(entry.finalPrice);
      });

      // Calculate cumulative sum for each hour
      let cumulativeSum = 0;
      recalculatedRevenue = hours.map(entry => {
        cumulativeSum += entry.revenue;
        return cumulativeSum;
      });
      dateLabels = hours.map(entry => entry.label);
    } else {
      // Standard cumulative sum for 1 WEEK and 1 MONTH views
      let cumulativeSum = 0;
      recalculatedRevenue = filteredData.map(entry => {
        cumulativeSum += parseFloat(entry.finalPrice);
        return cumulativeSum;
      });
      dateLabels = filteredData.map(entry => entry.timestamp.toISOString().split('T')[0]); // Display date in UTC format
    }

    return { recalculatedRevenue, dateLabels };
  };

  const { recalculatedRevenue, dateLabels } = filterAndCalculateCumulativeRevenue();

  const data = {
    labels: dateLabels,
    datasets: [
      {
        label: `Cumulative Revenue Over Time (${timeRange})`,
        data: recalculatedRevenue,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: timeRange === '1 DAY' ? 'Hour (UTC)' : 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Cumulative Revenue ($)',
        },
      },
    },
  };

  return (
    <div className="statistics-page">
      <h1 className="statistics-page-title">Revenue Statistics</h1>
      {error ? (
        <p className="statistics-error-message">{error}</p>
      ) : (
        <div>
          <div className="statistics-selectors">
            <div className="statistics-dropdown">
              <label>Time Range:</label>
              <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                <option value="1 DAY">1 DAY</option>
                <option value="1 WEEK">1 WEEK</option>
                <option value="1 MONTH">1 MONTH</option>
              </select>
            </div>
            <div className="statistics-dropdown">
              <label>Payment Method:</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="All">All</option>
                <option value="Balance">Balance</option>
                <option value="Placeholder A">Placeholder A</option>
                <option value="Placeholder B">Placeholder B</option>
              </select>
            </div>
          </div>
          <div className="statistics-revenue-graph-container">
            <Line data={data} options={options} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;
