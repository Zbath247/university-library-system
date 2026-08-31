import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Clock, PieChart, TrendingUp, BookOpen, Layers } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

ChartJS.defaults.font.family = "'Battambang', system-ui, sans-serif";

export default function AnalyticsCharts({ analytics }) {
  const { t, tRole, tDept, tPurpose } = useLanguage();

  if (!analytics) {
    return (
      <div className="p-8 text-center text-slate-400 text-sm">
        {t('processing')}
      </div>
    );
  }

  // 1. Peak Research Hours (Bar Chart)
  const hourlyData = {
    labels: analytics.hourly?.labels || [],
    datasets: [
      {
        label: t('statTodayVisits'),
        data: analytics.hourly?.data || [],
        backgroundColor: 'rgba(20, 184, 166, 0.75)',
        hoverBackgroundColor: 'rgba(45, 212, 191, 0.95)',
        borderRadius: 8,
        borderSkipped: false
      }
    ]
  };

  const hourlyOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#2dd4bf',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 10,
        displayColors: false,
        callbacks: {
          label: (context) => ` ${context.raw}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 11, family: 'Battambang, sans-serif' } }
      },
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: { color: '#94a3b8', stepSize: 1, font: { size: 11 } }
      }
    }
  };

  // 2. Department Breakdown (Doughnut Chart)
  const topDepts = (analytics.departments || []).slice(0, 5);
  const deptData = {
    labels: topDepts.map(d => tDept(d.name) || d.code),
    datasets: [
      {
        data: topDepts.map(d => d.count),
        backgroundColor: [
          '#14b8a6', // Teal
          '#6366f1', // Indigo
          '#ec4899', // Pink
          '#f59e0b', // Amber
          '#8b5cf6'  // Purple
        ],
        borderWidth: 2,
        borderColor: '#0f172a'
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#cbd5e1',
          font: { size: 11, family: 'Battambang, sans-serif' },
          padding: 12,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 10
      }
    }
  };

  // 3. 7-Day Attendance Trend (Line Chart)
  const trendData = {
    labels: analytics.trend?.labels || [],
    datasets: [
      {
        label: t('statTodayVisits'),
        data: analytics.trend?.data || [],
        fill: true,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        tension: 0.35,
        pointBackgroundColor: '#818cf8',
        pointBorderColor: '#0f172a',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 10
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 11 } }
      },
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: { color: '#94a3b8', stepSize: 2, font: { size: 11 } }
      }
    }
  };

    const roles = analytics.roles || [];

  // 5. 30-Day Monthly Trend (Bar Chart - Total Sums)
  const totalVisits = (analytics.monthlyTrend?.visits || []).reduce((acc, val) => acc + val, 0);
  const totalBorrows = (analytics.monthlyTrend?.borrows || []).reduce((acc, val) => acc + val, 0);
  const totalReturns = (analytics.monthlyTrend?.returns || []).reduce((acc, val) => acc + val, 0);
  const sum30Days = totalVisits + totalBorrows + totalReturns;

  const monthlyBarData = {
    labels: ['ចូលបណ្ណាល័យ (Visits)', 'ខ្ចីសៀវភៅ (Borrow)', 'សងសៀវភៅ (Return)'],
    datasets: [
      {
        data: [totalVisits, totalBorrows, totalReturns],
        backgroundColor: [
          'rgba(59, 130, 246, 0.9)', // Blue
          'rgba(245, 158, 11, 0.9)', // Amber
          'rgba(16, 185, 129, 0.9)'  // Emerald
        ],
        hoverBackgroundColor: [
          'rgba(59, 130, 246, 1)', 
          'rgba(245, 158, 11, 1)', 
          'rgba(16, 185, 129, 1)'
        ],
        borderRadius: 4,
        barThickness: 60
      }
    ]
  };

  const monthlyBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 25 // Make room for the labels above the bars
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 10,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const val = context.raw;
            const pct = sum30Days > 0 ? Math.round((val / sum30Days) * 100) : 0;
            return `សរុប៖ ${val} នាក់ (${pct}%)`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#cbd5e1', font: { size: 13, family: 'Battambang, sans-serif' } }
      },
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: { color: '#94a3b8', stepSize: 1, font: { size: 12 } }
      }
    }
  };

  const barDataLabelsPlugin = {
    id: 'barDataLabels',
    afterDatasetsDraw(chart) {
      const { ctx, data } = chart;
      ctx.save();
      const dataset = data.datasets[0];
      const meta = chart.getDatasetMeta(0);
      
      meta.data.forEach((bar, index) => {
        const val = dataset.data[index];
        if (val > 0 || sum30Days === 0) {
          const pct = sum30Days > 0 ? Math.round((val / sum30Days) * 100) : 0;
          ctx.font = 'bold 12px "Battambang", sans-serif';
          ctx.fillStyle = '#e2e8f0';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(`${val} (${pct}%)`, bar.x, bar.y - 6);
        }
      });
      ctx.restore();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Comprehensive 2x2 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* 1. Peak Research Hours Bar Chart */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-teal-950/20 border border-slate-800/90 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800/80">
              <div className="p-2.5 rounded-2xl bg-teal-500/15 text-teal-300 border border-teal-500/20">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{t('statPeakHour')}</h4>
                <p className="text-xs text-slate-400">{t('statPeakHourDesc')}</p>
              </div>
            </div>

            <div className="h-60 w-full relative flex items-center justify-center pt-2">
              <Bar data={hourlyData} options={hourlyOptions} />
            </div>
          </div>
        </div>

        {/* 2. 7-Day Attendance Trend Line Chart */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-violet-950/20 border border-slate-800/90 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800/80">
              <div className="p-2.5 rounded-2xl bg-violet-500/15 text-violet-300 border border-violet-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{t('tabAnalytics')}</h4>
                <p className="text-xs text-slate-400">និន្នាការវត្តមានរយៈពេល ៧ថ្ងៃចុងក្រោយ</p>
              </div>
            </div>

            <div className="h-60 w-full relative flex items-center justify-center pt-2">
              <Line data={trendData} options={trendOptions} />
            </div>
          </div>
        </div>

        {/* 3. Department Share Doughnut */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-indigo-950/20 border border-slate-800/90 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800/80">
              <div className="p-2.5 rounded-2xl bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{t('analyticsVisitsByDept')}</h4>
                <p className="text-xs text-slate-400">{t('analyticsVisitsByDeptSub')}</p>
              </div>
            </div>

            <div className="h-60 w-full relative flex items-center justify-center pt-2">
              <Doughnut data={deptData} options={doughnutOptions} />
            </div>
          </div>
        </div>

        {/* 4. Role Distribution */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-amber-950/20 border border-slate-800/90 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800/80">
              <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-300 border border-amber-500/20">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{t('analyticsRoleBreakdown')}</h4>
                <p className="text-xs text-slate-400">{t('analyticsRoleBreakdownSub')}</p>
              </div>
            </div>

            {/* Role Bars */}
            <div className="space-y-3.5 pt-2">
              {roles.map((r, i) => {
                const total = roles.reduce((acc, x) => acc + x.count, 0) || 1;
                const pct = Math.round((r.count / total) * 100);
                return (
                  <div key={i} className="text-xs">
                    <div className="flex justify-between text-slate-300 font-semibold mb-1">
                      <span className="font-medium">{tRole(r.name)}</span>
                      <span className="font-mono text-slate-400 font-bold">{r.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800/80 p-0.5">
                      <div
                        className="h-full rounded-full transition-all duration-700 shadow-sm"
                        style={{ width: `${pct}%`, backgroundColor: r.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* 5. 30-Day Monthly Trend */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-emerald-950/20 border border-slate-800/90 shadow-xl backdrop-blur-xl flex flex-col justify-between w-full">
        <div>
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800/80">
            <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">ក្រាបហ្វិកសម្រាប់១ខែ (30-Day Activity)</h4>
              <p className="text-xs text-slate-400">ប្រៀបធៀបចំនួនអ្នកចូលស្រាវជ្រាវ ជាមួយនឹងការខ្ចី-សងសៀវភៅ</p>
            </div>
          </div>

          <div className="h-72 w-full relative flex items-center justify-center pt-2">
            <Bar data={monthlyBarData} options={monthlyBarOptions} plugins={[barDataLabelsPlugin]} />
          </div>
        </div>
      </div>

    </div>
  );
}
