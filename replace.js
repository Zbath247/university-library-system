const fs = require('fs');

const filePath = 'client/src/components/SessionsTable.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove import ConfirmResetModal
content = content.replace("import ConfirmResetModal from './ConfirmResetModal';\n", "");

// 2. Remove states except showExportPrompt
const statesToRemove = `  const [showResetModal, setShowResetModal] = useState(false);
  const [showExportPrompt, setShowExportPrompt] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreData, setRestoreData] = useState(null);`;
content = content.replace(statesToRemove, "  const [showExportPrompt, setShowExportPrompt] = useState(false);");

// 3. Remove fileInputRef and handlers
const handlersToRemove = `  const fileInputRef = useRef(null);

  const handleBackup = () => {
    setShowBackupModal(true);
  };

  const handleRestoreClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        setRestoreData(jsonData);
        setShowRestoreModal(true);
      } catch (err) {
        alert('ឯកសារមិនត្រឹមត្រូវ (Invalid Backup File)!');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
`;
content = content.replace(handlersToRemove, "");

// 4. Remove Reset button in header
const resetButtonHtml = `          {/* Reset Logs Button */}
          <button
            onClick={() => setShowResetModal(true)}
            className="flex shrink-0 items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 transition shadow-sm"
            title="សម្អាតទិន្នន័យជា ០ (ត្រូវការ Password Admin)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('btnReset') || 'សម្អាតទិន្នន័យ (Reset)'}</span>
          </button>

`;
content = content.replace(resetButtonHtml, "");

// 5. Remove Backup and Restore buttons
const backupRestoreHtml = `          <div className="flex shrink-0 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-lg shadow-teal-500/10">
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
          </div>`;
content = content.replace(backupRestoreHtml, "");

// 6. Fix Export Prompt Reset button
const exportPromptReset = `              onClick={() => {
                setShowExportPrompt(false);
                setShowResetModal(true);
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-400 text-white shadow-md shadow-rose-500/20 transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset ទិន្នន័យ</span>
            </button>`;
const newExportPromptReset = `              onClick={() => {
                setShowExportPrompt(false);
                alert('សូមចូលទៅកាន់ Settings ដើម្បី Reset ទិន្នន័យ។');
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-400 text-white shadow-md shadow-rose-500/20 transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset ទិន្នន័យ</span>
            </button>`;
content = content.replace(exportPromptReset, newExportPromptReset);

// 7. Remove Modals at the end
const modals = `      {/* Confirm Reset Modal with Admin Password */}
      {showResetModal && (
        <ConfirmResetModal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
          onSubmit={async (password) => {
            const res = await api.resetSessions(password);
            if (res.success) {
              if (onRefresh) onRefresh();
            } else {
              throw new Error(res.message || 'លេខសម្ងាត់មិនត្រឹមត្រូវ!');
            }
          }}
          title="សម្អាតទិន្នន័យវត្តមានជា ០ (Reset Logs)"
          description="សកម្មភាពនេះនឹងសម្អាតទិន្នន័យវត្តមាន និងការខ្ចី-សងទាំងអស់ ដើម្បីចាប់ផ្តើមវដ្តទិន្នន័យថ្មីជា ០។ សូមបញ្ចូលលេខសម្ងាត់ Admin ដើម្បីបញ្ជាក់៖"
        />
      )}

      {/* Backup Admin Password Modal */}
      {showBackupModal && (
        <ConfirmResetModal
          isOpen={showBackupModal}
          onClose={() => setShowBackupModal(false)}
          onSubmit={async (password) => {
            const url = api.backupSystem(password);
            window.open(url, '_blank');
          }}
          title="ទាញយកទិន្នន័យប្រព័ន្ធទុក (Backup)"
          description="សកម្មភាពនេះនឹងទាញយកទិន្នន័យទាំងអស់នៃប្រព័ន្ធទុកជាឯកសារ .json។ សូមបញ្ចូលលេខសម្ងាត់ Admin ដើម្បីអនុញ្ញាត៖"
          buttonText="ទាញយកឥឡូវនេះ"
          buttonIcon={Download}
        />
      )}

      {/* Restore Admin Password Modal */}
      {showRestoreModal && (
        <ConfirmResetModal
          isOpen={showRestoreModal}
          onClose={() => setShowRestoreModal(false)}
          onSubmit={async (password) => {
            const res = await api.restoreSystem(restoreData, password);
            if (res.success) {
              alert('Restore ទិន្នន័យបានជោគជ័យ! សូម Refresh ទំព័រនេះ។');
              window.location.reload();
            } else {
              throw new Error(res.message || 'Restore បរាជ័យ!');
            }
          }}
          title="ទាញទិន្នន័យចាស់មកវិញ (Restore)"
          description="សកម្មភាពនេះនឹងលុបទិន្នន័យបច្ចុប្បន្នចោលទាំងស្រុង និងជំនួសដោយទិន្នន័យពីឯកសារចាស់វិញ។ តើអ្នកពិតជាចង់បន្តមែនទេ? សូមបញ្ចូលលេខសម្ងាត់ Admin ដើម្បិអនុញ្ញាត៖"
          buttonText="បញ្ជាក់ការ Restore ឥឡូវនេះ"
          buttonIcon={Upload}
        />
      )}`;
content = content.replace(modals, "");

fs.writeFileSync(filePath, content, 'utf8');
console.log('Replacements completed successfully.');
