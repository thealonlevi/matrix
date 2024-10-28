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
          const sortedData = result.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
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
    let filteredData = [];

    const rangeLimit = {
      '1 MONTH': 30,
      '1 WEEK': 7,
      '1 DAY': 1,
    };

    const limitDays = rangeLimit[timeRange];

    if (cumulativeRevenue.length) {
      filteredData = cumulativeRevenue.filter((entry) => {
        const entryDate = new Date(entry.timestamp);
        const dayDifference = Math.floor((now - entryDate) / (1000 * 60 * 60 * 24));
        const matchesPaymentMethod = paymentMethod === 'All' || entry.paymentMethod === paymentMethod;
        return dayDifference < limitDays && matchesPaymentMethod;
      });
    }

    let cumulativeSum = 0;
    const recalculatedRevenue = filteredData.map((entry) => {
      cumulativeSum += parseFloat(entry.finalPrice);
      return cumulativeSum;
    });
    const dateLabels = filteredData.map((entry) => new Date(entry.timestamp).toLocaleDateString());

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
          text: 'Date',
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
