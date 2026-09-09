import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { exportDashboardToExcel } from '../utils/excelExport';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const computeData = (sessions) => {
  const safeSessions = Array.isArray(sessions) ? sessions : [];
  
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthCounts = Array(12).fill(0);
  
  let maleCount = 0;
  let femaleCount = 0;
  const bookCounts = {};

  safeSessions.forEach(s => {
    if (s.check_in_time) {
      const m = new Date(s.check_in_time).getMonth();
      monthCounts[m]++;
    }

    const gender = s.user?.gender;
    if (gender === 'Male' || gender === 'ប្រុស') maleCount++;
    else if (gender === 'Female' || gender === 'ស្រី') femaleCount++;

    const purpose = s.purpose_of_visit || '';
    if (purpose.includes('Book') || purpose.includes('សៀវភៅ') || s.research_topic) {
      const bookName = s.research_topic || 'សៀវភៅផ្សេងៗ (Other)';
      bookCounts[bookName] = (bookCounts[bookName] || 0) + 1;
    }
  });

  const totalMonthly = monthCounts.reduce((a, b) => a + b, 0);
  const monthlyData = months.map((month, index) => {
    const qty = monthCounts[index];
    const ratio = totalMonthly > 0 ? Math.round((qty / totalMonthly) * 100) + '%' : '0%';
    const average = Math.round(qty / 30);
    return { month, qty, ratio, average };
  }).filter(m => m.qty > 0 || m.month === 'January'); // Keep at least one to prevent empty chart

  const totalGender = maleCount + femaleCount;
  const genderData = [
    { gender: 'Male', qty: maleCount, ratio: totalGender > 0 ? Math.round((maleCount / totalGender) * 100) + '%' : '0%', remark: '' },
    { gender: 'Female', qty: femaleCount, ratio: totalGender > 0 ? Math.round((femaleCount / totalGender) * 100) + '%' : '0%', remark: '' }
  ];

  const sortedBooks = Object.entries(bookCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const totalBooks = sortedBooks.reduce((acc, curr) => acc + curr[1], 0);

  let bookData = sortedBooks.map(([name, qty]) => ({
    name,
    qty,
    ratio: totalBooks > 0 ? Math.round((qty / totalBooks) * 100) + '%' : '0%'
  }));

  if (bookData.length === 0) {
     bookData = [{ name: 'No Data', qty: 0, ratio: '0%' }];
  }

  return { monthlyData, genderData, bookData };
};

export const ExcelReportGenerator = forwardRef(({ onClose, sessions = [] }, ref) => {
  const lineChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

  const realData = computeData(sessions);

  useImperativeHandle(ref, () => ({
    generate: async () => {
      if (isExporting) return;
      setIsExporting(true);
      try {
        // Allow time for charts to render if they just mounted
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const chartsBase64 = {
          lineChart: lineChartRef.current ? lineChartRef.current.toBase64Image() : null,
          pieChart: pieChartRef.current ? pieChartRef.current.toBase64Image() : null,
          barChart: barChartRef.current ? barChartRef.current.toBase64Image() : null,
        };

        await exportDashboardToExcel(realData, chartsBase64);
      } catch (error) {
        console.error("Failed to export Excel:", error);
        alert("Failed to export Excel. See console for details.");
      } finally {
        setIsExporting(false);
        if (onClose) onClose();
      }
    }
  }));

  const lineData = {
    labels: realData.monthlyData.map(d => d.month.substring(0, 3)),
    datasets: [
      {
        label: 'Reading Qty',
        data: realData.monthlyData.map(d => d.qty),
        borderColor: 'red',
        backgroundColor: 'red',
        borderDash: [5, 5],
        tension: 0.1,
      },
    ],
  };

  const pieData = {
    labels: realData.genderData.map(d => d.gender),
    datasets: [
      {
        data: realData.genderData.map(d => d.qty),
        backgroundColor: ['#d2b48c', '#ffff00'],
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: realData.bookData.map(d => d.name),
    datasets: [
      {
        label: 'Qty',
        data: realData.bookData.map(d => d.qty),
        backgroundColor: ['#a9a9a9', '#f5deb3', '#ffff00', '#f4a460', '#ffebcd', '#778899', '#ff6347', '#87ceeb', '#696969', '#dc143c'],
        borderWidth: 1,
      },
    ],
  };

  const year = new Date().getFullYear();

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `Monthly Student Reading Qty in Library Report\n(Jan-Dec - ${year})`,
        color: '#1F497D',
        font: { size: 14, weight: 'bold' }
      },
      datalabels: {
        color: 'red',
        align: 'top',
        font: { weight: 'bold' }
      }
    },
    animation: false,
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `Monthly Reading Qty By Gender-${year}`,
        color: '#1F497D',
        font: { size: 14, weight: 'bold' }
      },
      datalabels: {
        color: 'black',
        font: { weight: 'bold' },
        formatter: (value, context) => {
          const label = context.chart.data.labels[context.dataIndex];
          const ratio = realData.genderData[context.dataIndex].ratio;
          return `${label}\n${ratio}`;
        }
      }
    },
    animation: false,
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `Top 10 Books' Title Reading in Library Report-${year}`,
        color: '#1F497D',
        font: { size: 14, weight: 'bold' }
      },
      datalabels: {
        color: 'black',
        align: 'top',
        anchor: 'end',
        font: { weight: 'bold' }
      }
    },
    animation: false,
  };

  return (
    <div style={{ position: 'fixed', left: '-9999px', top: '-9999px', opacity: 0, pointerEvents: 'none' }}>
      {/* We render them at a fixed size so ChartJS has dimensions to draw on */}
      <div style={{ width: '800px', height: '400px' }}>
        <Line ref={lineChartRef} data={lineData} options={lineChartOptions} />
      </div>
      <div style={{ width: '800px', height: '400px' }}>
        <Pie ref={pieChartRef} data={pieData} options={pieChartOptions} />
      </div>
      <div style={{ width: '800px', height: '400px' }}>
        <Bar ref={barChartRef} data={barData} options={barChartOptions} />
      </div>
    </div>
  );
});
