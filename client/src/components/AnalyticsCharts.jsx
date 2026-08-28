import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { PieChart, Layers } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

ChartJS.defaults.font.family = "'Battambang', system-ui, sans-serif";

export default function AnalyticsCharts({ analytics }) {
  const { t, tRole, tDept } = useLanguage();

  if (!analytics) {
    return (
      <div className="p-8 text-center text-slate-400 text-sm">
        {t('processing')}
      </div>
    );
  }

  // Department Breakdown (Doughnut Chart)
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

  const roles = analytics.roles || [];

  return (
    <div className="space-y-6">
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* Department Share Doughnut */}
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

        {/* Role Distribution */}
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

    </div>
  );
}
