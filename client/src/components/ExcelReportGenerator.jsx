import React, { useRef, useState } from 'react';
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

export const ExcelReportGenerator = ({ isOpen, onClose }) => {
  const lineChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
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
    }
  };

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
        backgroundColor: ['#d2b48c', '#ffff00'], // brown, yellow (roughly matching image)
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
    animation: false, // Important: disable animation so it renders synchronously for export
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <div className="p-6 bg-gray-50">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-[#1F497D]">Excel Export Demo</h1>
            <div className="flex gap-3">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow disabled:opacity-50"
              >
                {isExporting ? 'Exporting...' : 'Export to Excel'}
              </button>
              <button
                onClick={onClose}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded shadow"
              >
                Close
              </button>
            </div>
          </div>

          <p className="text-gray-600 mb-6">The charts below will be embedded into the Excel file along with the tables.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Line Chart */}
            <div className="bg-white p-4 shadow rounded h-64 w-full">
              <h2 className="text-center font-bold text-sm text-[#1F497D] mb-2">Monthly Student Reading Qty in Library Report</h2>
              <div className="h-48 w-full">
                <Line ref={lineChartRef} data={lineData} options={chartOptions} />
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white p-4 shadow rounded h-64 w-full">
               <h2 className="text-center font-bold text-sm text-[#1F497D] mb-2">Monthly Reading Qty By Gender</h2>
               <div className="h-48 w-full">
                <Pie ref={pieChartRef} data={pieData} options={chartOptions} />
               </div>
            </div>

            {/* Bar Chart */}
            <div className="bg-white p-4 shadow rounded h-64 md:col-span-2 w-full">
               <h2 className="text-center font-bold text-sm text-[#1F497D] mb-2">Top 10 Books' Title Reading</h2>
               <div className="h-48 w-full">
                <Bar ref={barChartRef} data={barData} options={chartOptions} />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
