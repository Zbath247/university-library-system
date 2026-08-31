import React, { useState, useRef } from 'react';
import {
  Search,
  Filter,
  Download,
  Upload,
  Clock,
  CheckCircle2,
  LogOut,
  Sparkles,
  QrCode,
  GraduationCap,
  Building,
  RefreshCw,
  BookOpen,
  Edit3,
  Trash2,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import EditSessionModal from './EditSessionModal';
import ConfirmResetModal from './ConfirmResetModal';
import { useReactToPrint } from 'react-to-print';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, AlignmentType, WidthType, ImageRun, SectionType } from 'docx';
import { saveAs } from 'file-saver';
import ReportPrintTemplate from './ReportPrintTemplate';
import { useRef } from 'react';

export default function SessionsTable({
  sessions = [],
  roles = [],
  departments = [],
  loading = false,
  actionLoading = null,
  onRefresh,
  onForceCheckout,
  onApproveSession,
  onRejectSession,
  onViewPass
}) {
  const safeSessions = Array.isArray(sessions) ? sessions : [];
  const safeRoles = Array.isArray(roles) ? roles : [];
  const safeDepts = Array.isArray(departments) ? departments : [];

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [categoryTab, setCategoryTab] = useState('ALL'); // 'ALL', 'VISIT', 'BORROW', 'RETURN'
  const [editingSession, setEditingSession] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showExportPrompt, setShowExportPrompt] = useState(false);
  const reportRef = useRef();

  const { t, tRole, tDept, tPurpose } = useLanguage();

  // Category counts
  const countAll = safeSessions.length;
  const countVisit = safeSessions.filter(s => s && s.purpose_of_visit !== 'Book Borrowing' && s.purpose_of_visit !== 'Book Return').length;
  const countBorrow = safeSessions.filter(s => s && s.purpose_of_visit === 'Book Borrowing').length;
  const countReturn = safeSessions.filter(s => s && s.purpose_of_visit === 'Book Return').length;

  // Client-side filtering for immediate snappy responses
  const filteredSessions = safeSessions.filter(s => {
    if (!s) return false;
    const user = s.user || {};

    // 1. Category segmentation
    if (categoryTab === 'VISIT') {
      if (s.purpose_of_visit === 'Book Borrowing' || s.purpose_of_visit === 'Book Return') return false;
    } else if (categoryTab === 'BORROW') {
      if (s.purpose_of_visit !== 'Book Borrowing') return false;
    } else if (categoryTab === 'RETURN') {
      if (s.purpose_of_visit !== 'Book Return') return false;
    }

    if (statusFilter && s.status !== statusFilter) return false;
    if (roleFilter && String(user.role_id) !== String(roleFilter)) return false;
    if (deptFilter && String(user.department_id) !== String(deptFilter)) return false;

    if (yearFilter) {
      const sYear = new Date(s.check_in_time).getFullYear();
      if (String(sYear) !== String(yearFilter)) return false;
    }
    if (monthFilter) {
      const sMonth = new Date(s.check_in_time).getMonth() + 1; // 0-indexed
      if (String(sMonth) !== String(monthFilter)) return false;
    }
    
    if (search) {
      const q = search.toLowerCase();
      const matchName = user.full_name && user.full_name.toLowerCase().includes(q);
      const matchId = user.university_id && user.university_id.toLowerCase().includes(q);
      const matchTopic = s.research_topic && s.research_topic.toLowerCase().includes(q);
      const matchPurpose = s.purpose_of_visit && s.purpose_of_visit.toLowerCase().includes(q);
      const matchDept = user.department_name && user.department_name.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchTopic && !matchPurpose && !matchDept) return false;
    }
    return true;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, roleFilter, deptFilter, monthFilter, yearFilter, categoryTab]);

  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExportCsv = () => {
    let startDate, endDate;
    if (yearFilter || monthFilter) {
      const y = yearFilter ? parseInt(yearFilter) : new Date().getFullYear();
      if (monthFilter) {
        const m = parseInt(monthFilter);
        startDate = new Date(y, m - 1, 1).toISOString();
        endDate = new Date(y, m, 0, 23, 59, 59, 999).toISOString();
      } else {
        startDate = new Date(y, 0, 1).toISOString();
        endDate = new Date(y, 11, 31, 23, 59, 59, 999).toISOString();
      }
    }

    const exportUrl = api.getExportCsvUrl({
      status: statusFilter,
      role_id: roleFilter,
      department_id: deptFilter,
      search,
      category: categoryTab !== 'ALL' ? categoryTab : undefined,
      startDate,
      endDate
    });
    window.open(exportUrl, '_blank');
    setShowExportPrompt(true);
  };

  const handleExportExcel = () => {
    let startDate, endDate;
    if (yearFilter || monthFilter) {
      const y = yearFilter ? parseInt(yearFilter) : new Date().getFullYear();
      if (monthFilter) {
        const m = parseInt(monthFilter);
        startDate = new Date(y, m - 1, 1).toISOString();
        endDate = new Date(y, m, 0, 23, 59, 59, 999).toISOString();
      } else {
        startDate = new Date(y, 0, 1).toISOString();
        endDate = new Date(y, 11, 31, 23, 59, 59, 999).toISOString();
      }
    }

    const exportUrl = api.getExportExcelUrl({
      status: statusFilter,
      role_id: roleFilter,
      department_id: deptFilter,
      search,
      category: categoryTab !== 'ALL' ? categoryTab : undefined,
      startDate,
      endDate
    });
    window.open(exportUrl, '_blank');
    setShowExportPrompt(true);
  };

  const fileInputRef = useRef(null);

  const handleBackup = () => {
    window.open(api.backupSystem(), '_blank');
  };

  const handleRestoreClick = () => {
    if(window.confirm('តើអ្នកពិតជាចង់ Restore ទិន្នន័យមែនទេ? ទិន្នន័យចាស់ៗទាំងអស់នឹងត្រូវលុបចោលទាំងស្រុង។')) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        await api.restoreSystem(jsonData);
        alert('Restore ទិន្នន័យបានជោគជ័យ! សូម Refresh ទំព័រនេះ។');
        window.location.reload();
      } catch (err) {
        alert('Restore បរាជ័យ៖ ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const handleExportPDF = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: `Library_Report_${categoryTab}_${new Date().toISOString().slice(0, 10)}`,
    onAfterPrint: () => setShowExportPrompt(true),
  });

  const handleExportWord = async () => {
    let logoBuffer;
    try {
      const response = await fetch('/duc-logo.png');
      logoBuffer = await response.arrayBuffer();
    } catch (e) {
      console.error('Failed to load logo for word export', e);
    }

    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();

    let reportTitle = 'ស្ដីពីបញ្ជីឈ្មោះអ្នកចូលបណ្ណាល័យ';
    if (categoryTab === 'BORROW') reportTitle = 'ស្ដីពីបញ្ជីឈ្មោះអ្នកខ្ចីសៀវភៅ';
    if (categoryTab === 'RETURN') reportTitle = 'ស្ដីពីបញ្ជីឈ្មោះអ្នកសងសៀវភៅ';
    if (categoryTab === 'VISIT') reportTitle = 'ស្ដីពីបញ្ជីឈ្មោះអ្នកចូលអានសៀវភៅ';
    reportTitle += `ប្រចាំថ្ងៃទី ${day} ខែ ${month} ឆ្នាំ ${year}`;

    const tableRows = [
      new TableRow({
        children: [
          ['ល.រ'],
          ['អត្តលេខ', 'និស្សិត'],
          ['គោត្តនាមនិង', 'នាម'],
          ['ភេទ'],
          ['លេខទូរស័ព្ទ'],
          ['តួនាទី', 'សិក្សា'],
          ['ដេប៉ាតឺម៉ង់'],
          ['បន្ទប់'],
          ['គោលបំណងនៃការចូលបណ្ណាល័យ']
        ].map(lines => new TableCell({
          children: lines.map(text => new Paragraph({ children: [new TextRun({ text, font: "Khmer OS Battambang", size: 22, bold: true })], alignment: AlignmentType.CENTER })),
          shading: { fill: "F3F4F6" },
          margins: { top: 100, bottom: 100, left: 100, right: 100 }
        }))
      })
    ];

    filteredSessions.forEach((session, index) => {
      const user = session.user || {};
      let purposeDisplay = session.purpose_of_visit || 'ចូលបណ្ណាល័យ';
      let finalText = purposeDisplay;
      if (session.purpose_of_visit === 'Book Borrowing') {
        finalText = session.research_topic ? session.research_topic : 'ខ្ចីសៀវភៅ';
      } else if (session.purpose_of_visit === 'Book Return') {
        finalText = session.research_topic ? session.research_topic : 'សងសៀវភៅ';
      } else {
        finalText = session.research_topic ? `${purposeDisplay} - ${session.research_topic}` : purposeDisplay;
      }

      tableRows.push(new TableRow({
        children: [
          `${index + 1}`,
          user.university_id || '-',
          user.full_name || '-',
          user.gender || '-',
          user.phone || '-',
          user.role_name || '-',
          user.department_name || '-',
          user.room || '-',
          finalText
        ].map(text => new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text, font: "Khmer OS Battambang", size: 22 })], alignment: AlignmentType.CENTER })],
          margins: { top: 100, bottom: 100, left: 100, right: 100 }
        }))
      }));
    });

    const docChildren = [
      new Paragraph({
        children: [new TextRun({ text: "ព្រះរាជាណាចក្រកម្ពុជា", font: "Khmer OS Muol Light", size: 36 })],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        children: [new TextRun({ text: "ជាតិ សាសនា ព្រះមហាក្សត្រ", font: "Khmer OS Muol Light", size: 32 })],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({ text: "", spacing: { after: 200 } })
    ];

    if (logoBuffer) {
      docChildren.push(new Paragraph({
        children: [
          new ImageRun({
            data: logoBuffer,
            transformation: { width: 80, height: 80 },
          })
        ],
        alignment: AlignmentType.LEFT
      }));
    }

    docChildren.push(
      new Paragraph({
        children: [new TextRun({ text: "សាកលវិទ្យាល័យឌីជីថលកម្ពុជា", font: "Khmer OS Muol Light", size: 28 })],
        alignment: AlignmentType.LEFT
      }),
      new Paragraph({
        children: [new TextRun({ text: "DIGITAL UNIVERSITY OF CAMBODIA", font: "Arial", size: 20, bold: true })],
        alignment: AlignmentType.LEFT,
        spacing: { after: 400 }
      }),
      new Paragraph({
        children: [new TextRun({ text: "របាយការណ៍", font: "Khmer OS Muol Light", size: 32, color: "1a56db" })],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        children: [new TextRun({ text: reportTitle, font: "Khmer OS Battambang", size: 28, color: "1a56db" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      }),
      new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      })
    );

    const doc = new Document({
      sections: [{
        properties: { type: SectionType.CONTINUOUS },
        children: docChildren
      }]
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `Library_Report_${categoryTab}_${new Date().toISOString().slice(0, 10)}.docx`);
      setShowExportPrompt(true);
    });
  };

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden glass-panel">
      
      {/* Header & Controls */}
      <div className="p-6 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {t('tabAllLogs')}
              </h3>
              <p className="text-xs text-slate-400">
                {filteredSessions.length} / {safeSessions.length} កំណត់ត្រា
              </p>
            </div>
          </div>
        </div>

        {/* Actions: Refresh, Reset & Export CSV */}
        <div className="flex items-center gap-2.5 flex-wrap">


          {/* Reset Logs Button */}
          <button
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 transition shadow-sm"
            title="សម្អាតទិន្នន័យទាំងអស់ជា ០ (ទាមទារ Password Admin)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>សម្អាតទិន្នន័យ (Reset)</span>
          </button>

          <div className="flex bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-lg shadow-teal-500/10">
            <button
              onClick={handleBackup}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 transition border-r border-slate-700"
              title="ទាញយកទិន្នន័យប្រព័ន្ធទុក (Backup)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Backup</span>
            </button>
            <button
              onClick={handleRestoreClick}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 transition border-r border-slate-700"
              title="ទាញទិន្នន័យចាស់មកវិញ (Restore)"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Restore</span>
            </button>
            <input 
              type="file" 
              accept=".json" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileChange} 
            />
          </div>

          <div className="flex bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-lg shadow-teal-500/10">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition border-r border-slate-700"
              title="ទាញយកជា CSV (ទិន្នន័យចាស់)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition border-r border-slate-700"
              title="ទាញយកជា Excel ជាមួយនឹងរបាយការណ៍សង្ខេប"
            >
              <Download className="w-3.5 h-3.5 text-green-400" />
              <span>Excel Summary</span>
            </button>
            <button
              onClick={handleExportWord}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition border-r border-slate-700"
              title="ទាញយកជា Word"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Word</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              title="ទាញយកជា PDF"
            >
              <Download className="w-3.5 h-3.5 text-rose-400" />
              <span>PDF</span>
            </button>
          </div>
        </div>

      </div>

      <ReportPrintTemplate ref={reportRef} sessions={filteredSessions} category={categoryTab} />

      {/* Post Export Reset Notice Banner */}
      {showExportPrompt && (
        <div className="p-4 bg-gradient-to-r from-amber-950/60 via-slate-900 to-rose-950/60 border-b border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 animate-slide-up">
          <div className="flex items-center gap-2.5 text-xs text-amber-200">
            <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
            <span>
              <strong>បានទាញយករបាយការណ៍ជោគជ័យ!</strong> តើលោកអ្នកចង់សម្អាតទិន្នន័យ (Reset) ចាស់ទាំងអស់ដើម្បីចាប់ផ្តើមវដ្តទិន្នន័យថ្មីដែរឬទេ?
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowExportPrompt(false)}
              className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white transition"
            >
              ទុកទិន្នន័យដដែល
            </button>
            <button
              onClick={() => {
                setShowExportPrompt(false);
                setShowResetModal(true);
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-400 text-white shadow-md shadow-rose-500/20 transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset ទិន្នន័យឥឡូវនេះ</span>
            </button>
          </div>
        </div>
      )}

      {/* Segmented Category Filter Tabs */}
      <div className="px-6 py-3 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap items-center gap-2">
        
        {/* All */}
        <button
          type="button"
          onClick={() => setCategoryTab('ALL')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            categoryTab === 'ALL'
              ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>📑 ទាំងអស់ (All)</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${categoryTab === 'ALL' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
            {countAll}
          </span>
        </button>

        {/* ចូលបណ្ណាល័យ */}
        <button
          type="button"
          onClick={() => setCategoryTab('VISIT')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            categoryTab === 'VISIT'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>🏛️ ចូលបណ្ណាល័យ</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${categoryTab === 'VISIT' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'}`}>
            {countVisit}
          </span>
        </button>

        {/* ខ្ចីសៀវភៅ */}
        <button
          type="button"
          onClick={() => setCategoryTab('BORROW')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            categoryTab === 'BORROW'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>📚 ខ្ចីសៀវភៅ</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${categoryTab === 'BORROW' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-amber-300'}`}>
            {countBorrow}
          </span>
        </button>

        {/* សងសៀវភៅ */}
        <button
          type="button"
          onClick={() => setCategoryTab('RETURN')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            categoryTab === 'RETURN'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>📗 សងសៀវភៅ</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${categoryTab === 'RETURN' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-emerald-300'}`}>
            {countReturn}
          </span>
        </button>

      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-slate-950/60 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchMemberPlaceholder')}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Status */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
          >
            <option value="">{t('statusActive')} & {t('statusCompleted')}</option>
            <option value="ACTIVE">🟢 {t('statusActive')}</option>
            <option value="COMPLETED">⚪ {t('statusCompleted')}</option>
          </select>
        </div>

        {/* Role */}
        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
          >
            <option value="">{t('filterAllRoles')}</option>
            {roles.map(r => (
              <option key={r.id} value={r.id}>{tRole(r.name)}</option>
            ))}
          </select>
        </div>

        {/* Department */}
        <div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
          >
            <option value="">{t('colDept')}</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{tDept(d.name)} ({d.code})</option>
            ))}
          </select>
        </div>

        {/* Month */}
        <div>
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
          >
            <option value="">គ្រប់ខែ (All Months)</option>
            <option value="1">មករា (Jan)</option>
            <option value="2">កុម្ភៈ (Feb)</option>
            <option value="3">មីនា (Mar)</option>
            <option value="4">មេសា (Apr)</option>
            <option value="5">ឧសភា (May)</option>
            <option value="6">មិថុនា (Jun)</option>
            <option value="7">កក្កដា (Jul)</option>
            <option value="8">សីហា (Aug)</option>
            <option value="9">កញ្ញា (Sep)</option>
            <option value="10">តុលា (Oct)</option>
            <option value="11">វិច្ឆិកា (Nov)</option>
            <option value="12">ធ្នូ (Dec)</option>
          </select>
        </div>

        {/* Year */}
        <div>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
          >
            <option value="">គ្រប់ឆ្នាំ (All Years)</option>
            {[...new Set([...safeSessions.map(s => new Date(s.check_in_time).getFullYear()), new Date().getFullYear()])].sort((a,b)=>b-a).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Sessions Table - Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">{t('colMember')}</th>
              <th className="py-3.5 px-4">{t('colRole')} & {t('colDept')}</th>
              <th className="py-3.5 px-4">{t('colPurpose')}</th>
              <th className="py-3.5 px-4">{t('colEntryTime')} / {t('colExitTime')}</th>
              <th className="py-3.5 px-4">{t('colDuration')}</th>
              <th className="py-3.5 px-4">{t('colStatus')}</th>
              <th className="py-3.5 px-4 text-right">{t('colActions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
                {paginatedSessions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-500 font-medium">
                      មិនមានទិន្នន័យ (No records found)
                    </td>
                  </tr>
                ) : (
                  paginatedSessions.map((session, index) => {
                const user = session.user || {};
                const isActive = session.status === 'ACTIVE';
                const isPending = session.status === 'PENDING_APPROVAL';
                const inTime = new Date(session.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const inDate = new Date(session.check_in_time).toLocaleDateString([], { month: 'short', day: 'numeric' });
                const outTime = session.check_out_time ? new Date(session.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (isActive ? t('statusActive') : '-');

                const hours = Math.floor(session.duration_minutes / 60);
                const mins = session.duration_minutes % 60;
                const durationFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

                return (
                  <tr key={session.id} className="hover:bg-slate-800/30 transition">
                    
                    {/* Visitor */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs text-white border border-slate-700 shrink-0">
                          {(user.full_name || 'U').charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white leading-tight">
                            {user.full_name || 'Visitor'}
                          </p>
                          <p className="font-mono text-[10px] text-teal-400">
                            {user.university_id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role & Dept */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span
                          className="inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono text-white shadow-xs"
                          style={{ backgroundColor: user.role_badge_color || '#3B82F6' }}
                        >
                          {tRole(user.role_name || 'Student')}
                        </span>
                        <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                          {tDept(user.department_name)}
                        </p>
                      </div>
                    </td>

                    {/* Purpose & Book Title / Research Topic */}
                    <td className="py-3.5 px-4 max-w-xs">
                      {(() => {
                        const purpose = session.purpose_of_visit || user.default_purpose || 'Study & Revision';
                        const isBorrow = purpose === 'Book Borrowing';
                        const isReturn = purpose === 'Book Return';
                        const rawTopic = session.research_topic || user.research_field || '';
                        const cleanTopic = rawTopic.replace(/^\[(ខ្ចី|សង)\]\s*/, '').trim();

                        if (isBorrow) {
                          return (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  <BookOpen className="w-3 h-3 text-amber-400" />
                                  {tPurpose('Book Borrowing')}
                                </span>
                              </div>
                              {cleanTopic && (
                                <p className="text-xs text-amber-100 font-bold flex items-start gap-1.5" title={cleanTopic}>
                                  <span className="mt-0.5 shrink-0">📖</span> <span className="underline decoration-amber-500/50 leading-relaxed break-words">{cleanTopic}</span>
                                </p>
                              )}
                            </div>
                          );
                        }

                        if (isReturn) {
                          return (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  <BookOpen className="w-3 h-3 text-emerald-400" />
                                  {tPurpose('Book Return')}
                                </span>
                              </div>
                              {cleanTopic && (
                                <p className="text-xs text-emerald-100 font-bold flex items-start gap-1.5" title={cleanTopic}>
                                  <span className="mt-0.5 shrink-0">📗</span> <span className="underline decoration-emerald-500/50 leading-relaxed break-words">{cleanTopic}</span>
                                </p>
                              )}
                            </div>
                          );
                        }

                        return (
                          <div className="flex flex-col gap-0.5">
                            <p className="font-semibold text-slate-200 truncate">
                              {tPurpose(purpose)}
                            </p>
                            {cleanTopic && cleanTopic !== purpose && (
                              <p className="text-[11px] text-slate-400 truncate max-w-[220px]" title={cleanTopic}>
                                🔬 {cleanTopic}
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </td>

                    {/* Times */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-mono text-slate-200 block">
                          {inTime} <span className="text-slate-500">({inDate})</span>
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {isPending ? 'Waiting for approval' : `→ ${outTime}`}
                        </span>
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-4">
                      <span className={`font-mono font-bold ${isActive ? 'text-teal-400 animate-pulse' : 'text-slate-300'}`}>
                        {durationFormatted}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                          <span>Pending Approval</span>
                        </span>
                      ) : isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
                          <span>{t('statusActive')}</span>
                        </span>
                      ) : session.status === 'REJECTED' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400">
                          {t('statusCompleted')}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewPass(user)}
                          title={t('passTitle')}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        >
                          <QrCode className="w-3.5 h-3.5 text-teal-400" />
                        </button>

                        {/* Edit Record Button */}
                        <button
                          onClick={() => setEditingSession(session)}
                          title="កែសម្រួលកំណត់ត្រា (Edit Record)"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Approve/Reject Buttons if Pending */}
                        {isPending && (
                          <>
                            <button
                              onClick={() => onApproveSession && onApproveSession(session.id)}
                              disabled={actionLoading === session.id}
                              title="Approve Request"
                              className="p-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500 text-teal-400 hover:text-white transition disabled:opacity-50"
                            >
                              {actionLoading === session.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => onRejectSession && onRejectSession(session.id)}
                              disabled={actionLoading === session.id}
                              title="Reject Request"
                              className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white transition disabled:opacity-50"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {/* Force Check-Out */}
                        {isActive && (
                          <button
                            onClick={() => onForceCheckout(session.id)}
                            disabled={actionLoading === session.id}
                            title={t('btnForceCheckout')}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 transition disabled:opacity-50"
                          >
                            {actionLoading === session.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <LogOut className="w-3 h-3" />}
                            <span>{t('tabCheckOut')}</span>
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Sessions List - Mobile Cards View (Optimized for Phone Screens) */}
      <div className="block md:hidden p-4 space-y-3">
        {paginatedSessions.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            {t('noSessionsFound')}
          </div>
        ) : (
          paginatedSessions.map((session) => {
            const user = session.user || {};
            const isActive = session.status === 'ACTIVE';
            const isPending = session.status === 'PENDING_APPROVAL';
            const isRejected = session.status === 'REJECTED';
            const inTime = new Date(session.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const inDate = new Date(session.check_in_time).toLocaleDateString([], { month: 'short', day: 'numeric' });
            const outTime = session.check_out_time 
              ? new Date(session.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
              : (isPending ? 'Waiting for approval' : (isActive ? t('statusActive') : '-'));

            const hours = Math.floor(session.duration_minutes / 60);
            const mins = session.duration_minutes % 60;
            const durationFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

            const purpose = session.purpose_of_visit || user.default_purpose || 'Study & Revision';
            const isBorrow = purpose === 'Book Borrowing';
            const isReturn = purpose === 'Book Return';
            const rawTopic = session.research_topic || user.research_field || '';
            const cleanTopic = rawTopic.replace(/^\[(ខ្ចី|សង)\]\s*/, '').trim();

            return (
              <div
                key={session.id}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 shadow-md space-y-3 hover:border-slate-700 transition"
              >
                {/* Header: Name, ID, Role */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xs text-white border border-slate-700 shrink-0">
                      {(user.full_name || 'U').charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm leading-tight">
                        {user.full_name || 'Visitor'}
                      </h4>
                      <span className="font-mono text-[11px] text-teal-400 font-bold">
                        {user.university_id}
                      </span>
                    </div>
                  </div>

                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold font-mono text-white shadow-xs shrink-0"
                    style={{ backgroundColor: user.role_badge_color || '#3B82F6' }}
                  >
                    {tRole(user.role_name || 'Student')}
                  </span>
                </div>

                {/* Purpose & Book Title */}
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-xs">
                  {isBorrow ? (
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <BookOpen className="w-3 h-3 text-amber-400" />
                        {tPurpose('Book Borrowing')}
                      </span>
                      {cleanTopic && (
                        <p className="text-xs text-amber-100 font-bold flex items-start gap-1" title={cleanTopic}>
                          <span className="mt-0.5 shrink-0">📖</span> <span className="leading-relaxed break-words">{cleanTopic}</span>
                        </p>
                      )}
                    </div>
                  ) : isReturn ? (
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <BookOpen className="w-3 h-3 text-emerald-400" />
                        {tPurpose('Book Return')}
                      </span>
                      {cleanTopic && (
                        <p className="text-xs text-emerald-100 font-bold flex items-start gap-1" title={cleanTopic}>
                          <span className="mt-0.5 shrink-0">📗</span> <span className="leading-relaxed break-words">{cleanTopic}</span>
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-200">
                        {tPurpose(purpose)}
                      </p>
                      {cleanTopic && cleanTopic !== purpose && (
                        <p className="text-[11px] text-slate-400 truncate">
                          🔬 {cleanTopic}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Meta details: Time, Duration, Status */}
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-500 block text-[10px]">ចូល / ចេញ៖</span>
                    <span className="font-mono text-slate-300 font-medium text-[11px]">
                      {inTime} → {outTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">ថិរវេលា & ស្ថានភាព៖</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`font-mono font-bold ${isActive ? 'text-teal-400' : 'text-slate-300'}`}>
                        {durationFormatted}
                      </span>
                      {isPending ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                          <span>Pending</span>
                        </span>
                      ) : isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
                          <span>{t('statusActive')}</span>
                        </span>
                      ) : isRejected ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Rejected
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-400">
                          {t('statusCompleted')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons for Mobile Screen */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setEditingSession(session)}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white border border-indigo-500/30 transition flex items-center justify-center gap-1.5 shadow-sm min-w-[100px]"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>កែសម្រួល</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onViewPass(user)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition"
                    title={t('passTitle')}
                  >
                    <QrCode className="w-4 h-4" />
                  </button>

                  {/* Approve & Reject for Mobile if Pending */}
                  {isPending && (
                    <>
                      <button
                        type="button"
                        onClick={() => onApproveSession && onApproveSession(session.id)}
                        disabled={actionLoading === session.id}
                        className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-teal-500/20 hover:bg-teal-500 text-teal-300 hover:text-white border border-teal-500/30 transition flex items-center justify-center gap-1 shadow-sm disabled:opacity-50 min-w-[90px]"
                      >
                        {actionLoading === session.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                        )}
                        <span>Approve</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onRejectSession && onRejectSession(session.id)}
                        disabled={actionLoading === session.id}
                        className="py-2 px-2.5 rounded-xl text-xs font-bold bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 transition flex items-center justify-center shadow-sm disabled:opacity-50"
                        title="Reject"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {/* Force Check-Out for Mobile if Active */}
                  {isActive && (
                    <button
                      type="button"
                      onClick={() => onForceCheckout(session.id)}
                      disabled={actionLoading === session.id}
                      className="py-2 px-3 rounded-xl text-xs font-bold bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 transition flex items-center justify-center gap-1 shadow-sm disabled:opacity-50"
                    >
                      {actionLoading === session.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <LogOut className="w-3.5 h-3.5" />
                      )}
                      <span>{t('tabCheckOut')}</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
          <span className="text-sm text-slate-400 font-medium">
            បង្ហាញ {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredSessions.length)} នៃ {filteredSessions.length} ទិន្នន័យ
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              ថយក្រោយ (Prev)
            </button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                // Show only a few page numbers around the current page
                if (
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center transition ${
                        currentPage === page
                          ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return <span key={page} className="text-slate-500">...</span>;
                }
                return null;
              })}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              បន្ទាប់ (Next)
            </button>
          </div>
        </div>
      )}


      {/* Edit Session Modal */}
      {editingSession && (
        <EditSessionModal
          isOpen={!!editingSession}
          session={editingSession}
          roles={roles}
          departments={departments}
          onClose={() => setEditingSession(null)}
          onSaveSuccess={() => onRefresh && onRefresh()}
          onDeleteSuccess={() => onRefresh && onRefresh()}
        />
      )}

      {/* Confirm Reset Modal with Admin Password */}
      {showResetModal && (
        <ConfirmResetModal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
          onSuccess={() => onRefresh && onRefresh()}
          title="សម្អាតទិន្នន័យវត្តមានជា ០ (Reset Logs)"
          description="សកម្មភាពនេះនឹងសម្អាតទិន្នន័យវត្តមាន និងការខ្ចី-សងទាំងអស់ ដើម្បីចាប់ផ្តើមវដ្តទិន្នន័យថ្មីជា ០។ សូមបញ្ចូលលេខសម្ងាត់ Admin ដើម្បីបញ្ជាក់៖"
        />
      )}

    </div>
  );
}
