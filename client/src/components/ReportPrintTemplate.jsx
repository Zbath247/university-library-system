import React from 'react';

const ReportPrintTemplate = React.forwardRef(({ sessions, displayItems, viewMode, category }, ref) => {
  // Format current date
  const today = new Date();
  const day = today.getDate().toString().padStart(2, '0');
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const year = today.getFullYear();
  
  // Aggregate data for summary (always useful)
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

  const itemsToRender = displayItems || groupedData; // Fallback

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
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <link href="https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&family=Moul&family=Moulpali&display=swap" rel="stylesheet" />
        {/* Header Section */}
        <div style={{ display: 'flex', position: 'relative', marginBottom: '30px' }}>
          {/* Left Logo & Uni Name */}
          <div style={{ textAlign: 'center', width: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src="/duc-logo.png" alt="DUC Logo" style={{ width: '75px', height: 'auto', marginBottom: '8px' }} />
            <div style={{ fontFamily: '"Moul", "Khmer OS Muol Light", "Khmer OS Muol", cursive', fontSize: '11pt', margin: '0 0 5px 0', color: '#000', width: '100%', textAlign: 'center' }}>សាកលវិទ្យាល័យឌីជីថលកម្ពុជា</div>
            <div style={{ fontFamily: '"Moul", "Khmer OS Muol Light", "Khmer OS Muol", cursive', fontSize: '11pt', margin: '0', color: '#000', width: '100%', textAlign: 'center' }}>បណ្ណាល័យសិក្សា</div>
          </div>
          
          {/* Center Kingdom */}
          <div style={{ flex: 1, textAlign: 'center', paddingTop: '10px' }}>
            <div style={{ fontFamily: '"Moul", "Khmer OS Muol Light", "Khmer OS Muol", cursive', fontSize: '14pt', margin: '0 0 8px 0', fontWeight: 'normal', color: '#000' }}>ព្រះរាជាណាចក្រកម្ពុជា</div>
            <div style={{ fontFamily: '"Moul", "Khmer OS Muol Light", "Khmer OS Muol", cursive', fontSize: '13pt', margin: '0', fontWeight: 'normal', color: '#000' }}>ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
            
            {/* Decorative Line */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '8px 0' }}>
              <img src="/tacteing.png" alt="Decoration" style={{ height: '35px', objectFit: 'contain' }} />
            </div>
          </div>
          
          {/* Right Spacer */}
          <div style={{ width: '250px' }}></div>
        </div>

        {/* Report Title */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontFamily: '"Moul", "Khmer OS Muol Light", "Khmer OS Muol", cursive', fontSize: '13pt', margin: '0 0 10px 0', fontWeight: 'normal', color: '#1e3a8a' }}>
            {category === 'BORROW' ? 'របាយការណ៍សិស្សខ្ចីសៀវភៅ' : 
             category === 'RETURN' ? 'របាយការណ៍សិស្សសងសៀវភៅ' : 
             category === 'BOOKS' ? 'របាយការណ៍សិស្សខ្ចីនិងសងសៀវភៅ' :
             'របាយការណ៍សិស្សចូលក្នុងបណ្ណាល័យ'}
          </div>
        </div>

        {/* Data Table */}
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          marginBottom: '30px',
          fontSize: '10pt',
          fontFamily: '"Battambang", "Khmer OS Battambang", sans-serif'
        }}>
          {viewMode === 'LOGS' ? (
            <>
              <thead>
                <tr style={{ backgroundColor: '#111827', color: '#fff' }}>
                  <th style={{ padding: '12px 15px', textAlign: 'center', border: '1px solid #e5e7eb', fontWeight: 'normal' }}>ល.រ</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', border: '1px solid #e5e7eb', fontWeight: 'normal' }}>ឈ្មោះសិស្ស / សមាជិក</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', border: '1px solid #e5e7eb', fontWeight: 'normal' }}>គោលបំណង / ប្រធានបទ</th>
                  <th style={{ padding: '12px 15px', textAlign: 'center', border: '1px solid #e5e7eb', fontWeight: 'normal' }}>ម៉ោងចូល</th>
                  <th style={{ padding: '12px 15px', textAlign: 'center', border: '1px solid #e5e7eb', fontWeight: 'normal' }}>ម៉ោងចេញ</th>
                  <th style={{ padding: '12px 15px', textAlign: 'center', border: '1px solid #e5e7eb', fontWeight: 'normal' }}>រយៈពេល</th>
                </tr>
              </thead>
              <tbody>
                {itemsToRender.map((row, index) => {
                  const inTime = new Date(row.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const inDate = new Date(row.check_in_time).toLocaleDateString([], { month: 'short', day: 'numeric' });
                  const outTime = row.check_out_time ? new Date(row.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';
                  
                  const hours = Math.floor((row.duration_minutes || 0) / 60);
                  const mins = (row.duration_minutes || 0) % 60;
                  const duration = hours > 0 ? `${hours}ម៉ ${mins}ន` : `${mins}នទី`;
                  
                  let purposeDisplay = row.purpose_of_visit || 'ចូលបណ្ណាល័យ';
                  let finalText = purposeDisplay;
                  if (row.purpose_of_visit === 'Book Borrowing') finalText = row.research_topic ? row.research_topic : 'ខ្ចីសៀវភៅ';
                  else if (row.purpose_of_visit === 'Book Return') finalText = row.research_topic ? row.research_topic : 'សងសៀវភៅ';
                  else finalText = row.research_topic ? `${purposeDisplay} - ${row.research_topic}` : purposeDisplay;

                  return (
                    <tr key={index}>
                      <td style={{ padding: '12px 15px', textAlign: 'center', border: '1px solid #e5e7eb' }}>{index + 1}</td>
                      <td style={{ padding: '12px 15px', border: '1px solid #e5e7eb', fontWeight: 'bold' }}>{row.user?.full_name || '-'}</td>
                      <td style={{ padding: '12px 15px', border: '1px solid #e5e7eb' }}>{finalText}</td>
                      <td style={{ padding: '12px 15px', textAlign: 'center', border: '1px solid #e5e7eb' }}>{inDate} {inTime}</td>
                      <td style={{ padding: '12px 15px', textAlign: 'center', border: '1px solid #e5e7eb' }}>{outTime}</td>
                      <td style={{ padding: '12px 15px', textAlign: 'center', border: '1px solid #e5e7eb' }}>{duration}</td>
                    </tr>
                  );
                })}
              </tbody>
            </>
          ) : (
            <>
              <thead>
                <tr style={{ backgroundColor: '#111827', color: '#fff' }}>
                  <th style={{ padding: '12px 15px', textAlign: 'center', border: '1px solid #e5e7eb', fontWeight: 'normal' }}>ល.រ</th>
                  <th style={{ padding: '12px 15px', textAlign: 'center', border: '1px solid #e5e7eb', fontWeight: 'normal' }}>គោត្តនាម-នាម</th>
                  <th style={{ padding: '12px 15px', textAlign: 'center', border: '1px solid #e5e7eb', fontWeight: 'normal' }}>ភេទ</th>
                  <th style={{ padding: '12px 15px', textAlign: 'center', border: '1px solid #e5e7eb', fontWeight: 'normal' }}>ដេប៉ាតឺម៉ង់</th>
                  <th style={{ padding: '12px 15px', textAlign: 'center', border: '1px solid #e5e7eb', fontWeight: 'normal' }}>ចំនួនចូលសរុប</th>
                </tr>
              </thead>
              <tbody>
                {itemsToRender.map((row, index) => {
                  const gender = row.user.gender === 'Male' || row.user.gender === 'ប្រុស' ? 'ប្រុស' : 
                                (row.user.gender === 'Female' || row.user.gender === 'ស្រី' ? 'ស្រី' : (row.user.gender || '-'));
                  
                  return (
                    <tr key={index}>
                      <td style={{ padding: '12px 15px', textAlign: 'center', border: '1px solid #e5e7eb' }}>{index + 1}</td>
                      <td style={{ padding: '12px 15px', border: '1px solid #e5e7eb', fontWeight: 'bold' }}>{row.user.full_name || '-'}</td>
                      <td style={{ padding: '12px 15px', textAlign: 'center', border: '1px solid #e5e7eb' }}>{gender}</td>
                      <td style={{ padding: '12px 15px', border: '1px solid #e5e7eb', fontWeight: 'bold' }}>{row.user.department_name || '-'}</td>
                      <td style={{ padding: '12px 15px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                        <span style={{ 
                          display: 'inline-block', 
                          width: '28px', 
                          height: '28px', 
                          lineHeight: '28px', 
                          backgroundColor: '#f3f4f6', 
                          borderRadius: '50%', 
                          textAlign: 'center',
                          fontWeight: 'bold',
                          color: '#000'
                        }}>
                          {row.visitCount}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </>
          )}
          {itemsToRender.length === 0 && (
            <tbody>
              <tr>
                <td colSpan={viewMode === 'LOGS' ? "6" : "5"} style={{ padding: '20px', textAlign: 'center', border: '1px solid #e5e7eb' }}>មិនមានទិន្នន័យទេ</td>
              </tr>
            </tbody>
          )}
        </table>

        {/* Summary Box */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '35px' }}>
          <div style={{ width: '420px', border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden', fontFamily: '"Battambang", "Khmer OS Battambang", sans-serif', fontSize: '10.5pt' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 20px', backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb' }}>
              <span>
                {category === 'BORROW' ? 'សរុបសិស្សដែលបានខ្ចី ( Total Borrowers )' : 
                 category === 'RETURN' ? 'សរុបសិស្សដែលបានសង ( Total Returners )' : 
                 category === 'BOOKS' ? 'សរុបសិស្សខ្ចីសង ( Total Borrowers/Returners )' :
                 'សរុបសិស្សដែលបានចូល ( Total Users )'}
              </span>
              <span style={{ fontWeight: 'bold' }}>{totalUsers}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 20px', backgroundColor: '#111827', color: '#fff' }}>
              <span>
                {category === 'BORROW' ? 'សរុបការខ្ចីទាំងអស់ ( TOTAL BORROWS )' : 
                 category === 'RETURN' ? 'សរុបការសងទាំងអស់ ( TOTAL RETURNS )' : 
                 category === 'BOOKS' ? 'សរុបការខ្ចីសងទាំងអស់ ( TOTAL TRANSACTIONS )' :
                 'សរុបការចូលទាំងអស់ ( TOTAL CHECK-INS )'}
              </span>
              <span style={{ fontWeight: 'bold' }}>{totalCheckins}</span>
            </div>
          </div>
        </div>

        {/* Date and Signatures */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px', fontFamily: '"Battambang", "Khmer OS Battambang", sans-serif', fontSize: '11pt', color: '#1e3a8a' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 8px 0' }}>
              {(() => {
                const khmerDays = ['អាទិត្យ', 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
                const dayName = khmerDays[new Date().getDay()];
                return `ថ្ងៃ${dayName} ១២រោច ខែស្រាពណ៍ ឆ្នាំមមី អដ្ឋស័ក ព.ស. ២៥៧០`;
              })()}
            </p>
            <p style={{ margin: '0' }}>
              {(() => {
                const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
                const khmerNumerals = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
                const toKhmerNum = (num) => num.toString().split('').map(d => khmerNumerals[parseInt(d)]).join('');
                const today = new Date();
                return `កំពង់ស្ពឺ ថ្ងៃទី${toKhmerNum(today.getDate())} ខែ${khmerMonths[today.getMonth()]} ឆ្នាំ${toKhmerNum(today.getFullYear())}`;
              })()}
            </p>
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

        {/* Footer Address */}
        <div style={{ marginTop: '160px', textAlign: 'center', fontFamily: '"Battambang", "Khmer OS Battambang", sans-serif', fontSize: '9pt', color: '#4b5563', borderTop: '1px solid #e5e7eb', paddingTop: '15px' }}>
          អាសយដ្ឋាន៖ សាកលវិទ្យាល័យ ឌីជីថល កម្ពុជា ៖ភូមិត្រពាំងស្លា ឃុំព្រះនិព្វាន ស្រុកគង់ពិសី ខេត្តកំពង់ស្ពឺ។ ទូរស័ព្ទ …….
        </div>

      </div>
    </div>
  );
});

ReportPrintTemplate.displayName = 'ReportPrintTemplate';

export default ReportPrintTemplate;
