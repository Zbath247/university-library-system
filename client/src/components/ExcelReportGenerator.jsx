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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const mockData = {
  monthlyData: [
    { month: 'January', qty: 179, ratio: '15%', average: 6 },
    { month: 'February', qty: 108, ratio: '9%', average: 4 },
    { month: 'March', qty: 281, ratio: '24%', average: 9 },
    { month: 'April', qty: 103, ratio: '9%', average: 3 },
    { month: 'May', qty: 287, ratio: '24%', average: 10 },
    { month: 'June', qty: 180, ratio: '15%', average: 6 },
    { month: 'July', qty: 50, ratio: '4%', average: 2 },
  ],
  genderData: [
    { gender: 'Male', qty: 713, ratio: '60%', remark: '' },
    { gender: 'Female', qty: 475, ratio: '40%', remark: '' },
  ],
  bookData: [
    { name: 'ប្រលោមលោក', qty: 54, ratio: '15%' },
    { name: 'រឿងព្រេង', qty: 48, ratio: '13%' },
    { name: 'កំណាព្យ', qty: 46, ratio: '12%' },
    { name: 'ចិត្តវិទ្យា', qty: 42, ratio: '11%' },
    { name: 'អប់រំ', qty: 37, ratio: '10%' },
    { name: 'ទស្សនៈវិជ្ជា', qty: 34, ratio: '9%' },
    { name: 'ប្រវត្តិសាស្ត្រ', qty: 31, ratio: '8%' },
    { name: 'ការគ្រប់គ្រង', qty: 28, ratio: '8%' },
    { name: 'វិទ្យាសាស្ត្រ', qty: 27, ratio: '7%' },
    { name: 'សាសនា', qty: 22, ratio: '6%' },
  ]
};

export const ExcelReportGenerator = forwardRef(({ onClose }, ref) => {
  const lineChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

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

        await exportDashboardToExcel(mockData, chartsBase64);
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
    labels: mockData.monthlyData.map(d => d.month.substring(0, 3)),
    datasets: [
      {
        label: 'Reading Qty',
        data: mockData.monthlyData.map(d => d.qty),
        borderColor: 'red',
        backgroundColor: 'red',
        borderDash: [5, 5],
        tension: 0.1,
      },
    ],
  };

  const pieData = {
    labels: mockData.genderData.map(d => d.gender),
    datasets: [
      {
        data: mockData.genderData.map(d => d.qty),
        backgroundColor: ['#d2b48c', '#ffff00'],
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: mockData.bookData.map(d => d.name),
    datasets: [
      {
        label: 'Qty',
        data: mockData.bookData.map(d => d.qty),
        backgroundColor: ['#a9a9a9', '#f5deb3', '#ffff00', '#f4a460', '#ffebcd', '#778899', '#ff6347', '#87ceeb', '#696969', '#dc143c'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    animation: false,
  };

  return (
    <div style={{ position: 'fixed', left: '-9999px', top: '-9999px', opacity: 0, pointerEvents: 'none' }}>
      {/* We render them at a fixed size so ChartJS has dimensions to draw on */}
      <div style={{ width: '800px', height: '400px' }}>
        <Line ref={lineChartRef} data={lineData} options={chartOptions} />
      </div>
      <div style={{ width: '800px', height: '400px' }}>
        <Pie ref={pieChartRef} data={pieData} options={chartOptions} />
      </div>
      <div style={{ width: '800px', height: '400px' }}>
        <Bar ref={barChartRef} data={barData} options={chartOptions} />
      </div>
    </div>
  );
});
