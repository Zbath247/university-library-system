import React from 'react';

const ReportPrintTemplate = React.forwardRef(({ sessions, category }, ref) => {
  // Format current date
  const today = new Date();
  const day = today.getDate().toString().padStart(2, '0');
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const year = today.getFullYear();
  
  // Aggregate data
  const userMap = new Map();
  (sessions || []).forEach(session => {
    const user = session.user || {};
    const uid = user.university_id || user.full_name;
    if (!uid) return;
    if (!userMap.has(uid)) {
      userMap.set(uid, {
        user,
        visitCount: 1,
      });
    } else {
      userMap.get(uid).visitCount += 1;
    }
  });
  const groupedData = Array.from(userMap.values());
  const totalCheckins = groupedData.reduce((acc, curr) => acc + curr.visitCount, 0);
  const totalUsers = groupedData.length;

  return (
    <div style={{ display: 'none' }}>
      <div 
        ref={ref} 
        style={{ 
          padding: '40px 60px',
          fontFamily: '"Battambang", "Khmer OS Battambang", "Khmer OS", Arial, sans-serif',
          color: '#000',
          backgroundColor: '#fff',
          width: '100%',
          minHeight: '100vh',
          boxSizing: 'border-box'
        }}
      >
        <link href="https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&family=Moul&family=Moulpali&display=swap" rel="stylesheet" />
        {/* Header Section */}
        <div style={{ display: 'flex', position: 'relative', marginBottom: '30px' }}>
          {/* Left Logo & Uni Name */}
          <div style={{ textAlign: 'center', width: '250px' }}>
            <img src="/duc-logo.png" alt="DUC Logo" style={{ width: '75px', height: 'auto', marginBottom: '8px' }} />
            <div style={{ fontFamily: '"Moul", "Khmer OS Muol Light", "Khmer OS Muol", cursive', fontSize: '11pt', margin: '0 0 5px 0', color: '#000' }}>សាកលវិទ្យាល័យឌីជីថលកម្ពុជា</div>
            <div style={{ fontFamily: '"Moul", "Khmer OS Muol Light", "Khmer OS Muol", cursive', fontSize: '11pt', margin: '0', color: '#000' }}>បណ្ណាល័យសិក្សា</div>
          </div>
          
          {/* Center Kingdom */}
          <div style={{ flex: 1, textAlign: 'center', paddingTop: '10px' }}>
            <div style={{ fontFamily: '"Moul", "Khmer OS Muol Light", "Khmer OS Muol", cursive', fontSize: '14pt', margin: '0 0 8px 0', fontWeight: 'normal', color: '#000' }}>ព្រះរាជាណាចក្រកម្ពុជា</div>
            <div style={{ fontFamily: '"Moul", "Khmer OS Muol Light", "Khmer OS Muol", cursive', fontSize: '13pt', margin: '0', fontWeight: 'normal', color: '#000' }}>ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
            
            {/* Decorative Line */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '15px 0' }}>
              <div style={{ width: '60px', borderTop: '1px solid #000', height: '1px' }}></div>
              <div style={{ margin: '0 10px', fontSize: '14px', color: '#000', display: 'flex', gap: '3px' }}>
                <span>&#10022;</span>
                <span>&#10043;</span>
                <span>&#10022;</span>
              </div>
              <div style={{ width: '60px', borderTop: '1px solid #000', height: '1px' }}></div>
            </div>
          </div>
          
          {/* Right Spacer */}
          <div style={{ width: '250px' }}></div>
        </div>

        {/* Report Title */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontFamily: '"Moul", "Khmer OS Muol Light", "Khmer OS Muol", cursive', fontSize: '13pt', margin: '0 0 10px 0', fontWeight: 'normal', color: '#1e3a8a' }}>របាយការណ៍សិស្សចូលក្នុងបណ្ណាល័យ</div>
          <div style={{ fontFamily: '"Moul", "Khmer OS Muol Light", "Khmer OS Muol", cursive', fontSize: '12pt', margin: '0', fontWeight: 'normal', color: '#1e3a8a' }}>កាលបរិច្ឆេទ ៖ ទាំងអស់</div>
        </div>

        {/* Data Table */}
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          marginBottom: '30px',
          fontSize: '10pt',
          fontFamily: '"Battambang", "Khmer OS Battambang", sans-serif'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#111827', color: '#fff' }}>
              <th style={{ padding: '12px 15px', textAlign: 'left', border: '1px solid #e5e7eb', fontWeight: 'normal' }}>ឈ្មោះសិស្ស / សមាជិក</th>
              <th style={{ padding: '12px 15px', textAlign: 'center', border: '1px solid #e5e7eb', fontWeight: 'normal' }}>ភេទ</th>
              <th style={{ padding: '12px 15px', textAlign: 'left', border: '1px solid #e5e7eb', fontWeight: 'normal' }}>ជំនាញ</th>
              <th style={{ padding: '12px 15px', textAlign: 'center', border: '1px solid #e5e7eb', fontWeight: 'normal' }}>ថ្នាក់</th>
              <th style={{ padding: '12px 15px', textAlign: 'center', border: '1px solid #e5e7eb', fontWeight: 'normal' }}>ចំនួនចូលសរុប</th>
            </tr>
          </thead>
          <tbody>
            {groupedData.map((row, index) => {
              const gender = row.user.gender === 'Male' || row.user.gender === 'ប្រុស' ? 'ប្រុស' : 
                            (row.user.gender === 'Female' || row.user.gender === 'ស្រី' ? 'ស្រី' : (row.user.gender || '-'));
              
              return (
                <tr key={index}>
                  <td style={{ padding: '12px 15px', border: '1px solid #e5e7eb', fontWeight: 'bold' }}>{row.user.full_name || '-'}</td>
                  <td style={{ padding: '12px 15px', textAlign: 'center', border: '1px solid #e5e7eb' }}>{gender}</td>
                  <td style={{ padding: '12px 15px', border: '1px solid #e5e7eb', fontWeight: 'bold' }}>{row.user.department_name || '-'}</td>
                  <td style={{ padding: '12px 15px', textAlign: 'center', border: '1px solid #e5e7eb', fontWeight: 'bold' }}>{row.user.room || '-'}</td>
                  <td style={{ padding: '12px 15px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                    <span style={{ 
                      display: 'inline-block', 
                      width: '28px', 
                      height: '28px', 
                      lineHeight: '28px', 
                      backgroundColor: '#f3f4f6', 
                      borderRadius: '50%', 
                      textAlign: 'center',
                      fontWeight: 'bold'
                    }}>
                      {row.visitCount}
                    </span>
                  </td>
                </tr>
              );
            })}
            {groupedData.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '20px', textAlign: 'center', border: '1px solid #e5e7eb' }}>មិនមានទិន្នន័យទេ</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Summary Box */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '35px' }}>
          <div style={{ width: '420px', border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden', fontFamily: '"Battambang", "Khmer OS Battambang", sans-serif', fontSize: '10.5pt' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 20px', backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb' }}>
              <span>សរុបសិស្សដែលបានចូល ( Total Users )</span>
              <span style={{ fontWeight: 'bold' }}>{totalUsers}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 20px', backgroundColor: '#111827', color: '#fff' }}>
              <span>សរុបការចូលទាំងអស់ ( TOTAL CHECK-INS )</span>
              <span style={{ fontWeight: 'bold' }}>{totalCheckins}</span>
            </div>
          </div>
        </div>

        {/* Date and Signatures */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px', fontFamily: '"Battambang", "Khmer OS Battambang", sans-serif', fontSize: '10.5pt' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 8px 0' }}>ថ្ងៃ .................... ខែ ............... ឆ្នាំរោង ឆស័ក ព.ស. ២៥៦៨</p>
            <p style={{ margin: '0' }}>កំណត់ធ្វើថ្ងៃទី {day} ខែ {month} ឆ្នាំ {year}</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', fontSize: '11.5pt', fontFamily: '"Battambang", "Khmer OS Battambang", sans-serif', fontWeight: 'bold' }}>
          <div style={{ textAlign: 'center', marginLeft: '80px' }}>
            <p style={{ margin: '0' }}>អ្នកត្រួតពិនិត្យ</p>
          </div>
          
          <div style={{ textAlign: 'center', marginRight: '120px' }}>
            <p style={{ margin: '0' }}>អ្នកធ្វើរបាយការណ៍</p>
          </div>
        </div>

      </div>
    </div>
  );
});

ReportPrintTemplate.displayName = 'ReportPrintTemplate';

export default ReportPrintTemplate;
