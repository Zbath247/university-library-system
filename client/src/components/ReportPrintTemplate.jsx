import React from 'react';

const ReportPrintTemplate = React.forwardRef(({ sessions, category }, ref) => {
  // Format current date
  const today = new Date();
  const day = today.getDate().toString().padStart(2, '0');
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const year = today.getFullYear();
  
  // Determine report title based on category
  let reportTitle = 'ស្ដីពីបញ្ជីឈ្មោះអ្នកចូលបណ្ណាល័យ';
  if (category === 'BORROW') {
    reportTitle = 'ស្ដីពីបញ្ជីឈ្មោះអ្នកខ្ចីសៀវភៅ';
  } else if (category === 'RETURN') {
    reportTitle = 'ស្ដីពីបញ្ជីឈ្មោះអ្នកសងសៀវភៅ';
  } else if (category === 'VISIT') {
    reportTitle = 'ស្ដីពីបញ្ជីឈ្មោះអ្នកចូលអានសៀវភៅ';
  }
  
  reportTitle += `ប្រចាំថ្ងៃទី ${day} ខែ ${month} ឆ្នាំ ${year}`;

  return (
    <div style={{ display: 'none' }}>
      <div 
        ref={ref} 
        style={{ 
          padding: '40px',
          fontFamily: '"Khmer OS Battambang", "Khmer OS", Arial, sans-serif',
          color: '#000',
          backgroundColor: '#fff',
          width: '100%',
          minHeight: '100vh',
          boxSizing: 'border-box'
        }}
      >
        {/* Header - Kingdom of Cambodia */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontFamily: '"Khmer OS Muol Light", "Khmer OS Muol", cursive', fontSize: '18pt', margin: '0 0 5px 0', fontWeight: 'normal' }}>ព្រះរាជាណាចក្រកម្ពុជា</h2>
          <h3 style={{ fontFamily: '"Khmer OS Muol Light", "Khmer OS Muol", cursive', fontSize: '16pt', margin: '0', fontWeight: 'normal' }}>ជាតិ សាសនា ព្រះមហាក្សត្រ</h3>
          <div style={{ width: '130px', height: '2px', backgroundColor: '#000', margin: '8px auto' }}></div>
        </div>

        {/* University Header */}
        <div style={{ textAlign: 'left', marginBottom: '30px' }}>
          <img src="/duc-logo.png" alt="DUC Logo" style={{ width: '80px', height: 'auto', marginBottom: '10px' }} />
          <h3 style={{ fontFamily: '"Khmer OS Muol Light", "Khmer OS Muol", cursive', fontSize: '14pt', margin: '0', fontWeight: 'normal' }}>សាកលវិទ្យាល័យឌីជីថលកម្ពុជា</h3>
          <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '10pt', margin: '0', fontWeight: 'bold', color: '#666' }}>DIGITAL UNIVERSITY OF CAMBODIA</p>
        </div>

        {/* Report Title */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontFamily: '"Khmer OS Muol Light", "Khmer OS Muol", cursive', fontSize: '16pt', color: '#1a56db', margin: '0 0 10px 0', fontWeight: 'normal' }}>របាយការណ៍</h2>
          <h3 style={{ fontSize: '14pt', color: '#1a56db', margin: '0', fontWeight: 'normal' }}>{reportTitle}</h3>
        </div>

        {/* Data Table */}
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          marginBottom: '50px',
          fontSize: '11pt'
        }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>ល.រ</th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>អត្តលេខ<br/>និស្សិត</th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>គោត្តនាមនិង<br/>នាម</th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>លេខទូរស័ព្ទ</th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>តួនាទី<br/>សិក្សា</th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>ដេប៉ាតឺម៉ង់</th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>គោលបំណងនៃការចូលបណ្ណាល័យ</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session, index) => {
              const user = session.user || {};
              let purposeDisplay = session.purpose_of_visit || 'ចូលបណ្ណាល័យ';
              if (session.purpose_of_visit === 'Book Borrowing') purposeDisplay = 'ខ្ចីសៀវភៅ';
              if (session.purpose_of_visit === 'Book Return') purposeDisplay = 'សងសៀវភៅ';
              
              const topic = session.research_topic ? ` - ${session.research_topic}` : '';

              return (
                <tr key={session.id || index}>
                  <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{index + 1}</td>
                  <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{user.university_id || '-'}</td>
                  <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{user.full_name || '-'}</td>
                  <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{user.phone || '-'}</td>
                  <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{user.role_name || '-'}</td>
                  <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{user.department_name || '-'}</td>
                  <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>{purposeDisplay}{topic}</td>
                </tr>
              );
            })}
            {sessions.length === 0 && (
              <tr>
                <td colSpan="7" style={{ border: '1px solid #000', padding: '20px', textAlign: 'center' }}>មិនមានទិន្នន័យទេ</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px', fontSize: '11pt' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 80px 0', fontWeight: 'bold', fontFamily: '"Khmer OS Muol Light", "Khmer OS Muol", cursive' }}>អ្នកត្រួតពិនិត្យ</p>
            {/* Signature space */}
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 5px 0' }}>ថ្ងៃ .................... ខែ ស្រាពណ៍ ឆ្នាំរោង ឆស័ក ព.ស ២៥៦៨</p>
            <p style={{ margin: '0 0 20px 0' }}>កំពង់ស្ពឺ ថ្ងៃទី ......... ខែ ........... ឆ្នាំ 2026</p>
            <p style={{ margin: '0 0 80px 0', fontWeight: 'bold', fontFamily: '"Khmer OS Muol Light", "Khmer OS Muol", cursive' }}>អ្នកធ្វើរបាយការណ៍</p>
            {/* Signature space */}
          </div>
        </div>

      </div>
    </div>
  );
});

ReportPrintTemplate.displayName = 'ReportPrintTemplate';

export default ReportPrintTemplate;
