import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  km: {
    // General & App
    appName: 'UniResearch',
    library: 'បណ្ណាល័យ',
    systemTitle: 'ប្រព័ន្ធគ្រប់គ្រង និងកត់ត្រាវត្តមានបណ្ណាល័យសាកលវិទ្យាល័យ',
    versionBadge: 'ប្រព័ន្ធវត្តមាន v2.5',
    academicSub: 'ច្រកទ្វារកត់ត្រាវត្តមាន និងស្រាវជ្រាវសិក្សាអប់រំឌីជីថល',
    insideLibrary: 'វត្តមានផ្ទាល់ក្នុងបណ្ណាល័យ៖',
    activeOccupants: 'នាក់កំពុងនៅ',
    time: 'ពេលវេលា',
    language: 'ភាសា',
    khmer: 'ភាសាខ្មែរ',
    english: 'English',
    footerCopyright: '© ២០២៦ ប្រព័ន្ធគ្រប់គ្រង និងកត់ត្រាវត្តមានបណ្ណាល័យសាកលវិទ្យាល័យ',
    footerRoleInfo: 'សិទ្ធិចូលប្រើប្រាស់៖ និស្សិត • សាស្ត្រាចារ្យ • អ្នកស្រាវជ្រាវ • បុគ្គលិកសិក្សា',
    footerTech: 'ប្រព័ន្ធទិន្នន័យស្រាវជ្រាវទំនើប REST API',

    // Navigation
    navKiosk: 'ផ្ទាំងស្កេនមាត់ទ្វារ (Kiosk QR)',
    navAdmin: 'ផ្ទាំងគ្រប់គ្រង & ស្ថិតិ (Admin)',
    navMobilePortal: 'ផ្ទាំងទូរស័ព្ទដៃ (Mobile)',

    // Kiosk & Entrance Screen
    kioskBadge: 'ច្រកស្កេនវត្តមានឌីជីថលស្វ័យប្រវត្តិ',
    kioskDepartureBadge: 'ច្រកកត់ត្រាចាកចេញពីបណ្ណាល័យ',
    kioskTitle: 'សូមស្វាគមន៍មកកាន់បណ្ណាល័យសាកលវិទ្យាល័យ',
    kioskSub: 'សូមស្កេន QR Code ធំខាងក្រោមតាមទូរស័ព្ទដៃ ឬវាយបញ្ចូលអត្តលេខសម្គាល់ ដើម្បីកត់ត្រាវត្តមានចូល/ចេញ។',
    entranceQrTitle: 'ស្កេន QR Code តាមទូរស័ព្ទដៃដើម្បីចូលបណ្ណាល័យ',
    entranceQrSub: 'ប្រើកាមេរ៉ាទូរស័ព្ទដៃស្កេនកូដ QR នេះ៖ ចូលលើកដំបូងបំពេញព័ត៌មានតែម្តង ចូលលើកទី២ ឬរាល់ថ្ងៃគ្រាន់តែចុច Check In លើទូរស័ព្ទជាការស្រេច!',
    entranceQrSubEn: 'Open phone camera to scan this QR code for instant check-in / check-out',
    mobileScanPrompt: 'ស្កេន QR តាមទូរស័ព្ទដៃ',
    mobileScanPromptSub: 'ងាយស្រួល រហ័ស និងមិនបាច់រង់ចាំតម្រង់ជួរ',
    kioskDepartureTitle: 'ស្កេនកាតបណ្ណាល័យ ដើម្បីកត់ត្រាចេញ',
    kioskDepartureSub: 'បញ្ចប់ការស្រាវជ្រាវ និងកត់ត្រាថិរវេលាសរុបដែលបានចំណាយក្នុងបណ្ណាល័យ។',
    tabCheckIn: 'ស្កេនកត់ត្រាចូល (Check-In)',
    tabCheckOut: 'ស្កេនកត់ត្រាចេញ (Check-Out)',
    inputPlaceholder: 'វាយបញ្ចូលអត្តលេខ (ឧ. DUC2024-0417, DUCL2024-0201)...',
    scannerReady: 'ប្រព័ន្ធស្កេនស្វ័យប្រវត្តិរួចរាល់',
    enterBtn: 'បញ្ចូល',
    btnCheckIn: 'កត់ត្រាចូល',
    btnCheckOut: 'កត់ត្រាចេញ',
    btnCameraScan: 'ស្កេនតាមកាមេរ៉ា (QR Code / Barcode)',
    btnCameraScanSub: 'គាំទ្រកាត QR ឌីជីថល និង Barcode លើកាតប្លាស្ទិក',
    btnRegister: 'ចុះឈ្មោះសមាជិកថ្មី',
    btnDemoUsers: 'គណនីគំរូសាកល្បងរហ័ស',
    btnDemoUsersSub: 'ចុចលើគណនីណាមួយដើម្បីតេស្តការស្កេនភ្លាមៗ',
    btnDirectory: 'បញ្ជីឈ្មោះសមាជិកទាំងអស់',
    purposeSectionTitle: 'ជ្រើសរើសគោលបំណងនៃការចូលស្រាវជ្រាវ',
    purposeSectionSub: 'ជួយឱ្យបណ្ណាល័យរៀបចំទីតាំង និងធនធានស្រាវជ្រាវឱ្យកាន់តែប្រសើរ',
    processing: 'កំពុងដំណើរការ...',
    readyToScan: 'ប្រព័ន្ធរួចរាល់សម្រាប់ការស្កេន Barcode ឬ QR Code...',
    newVisitorBadge: '✨ សមាជិកថ្មី',
    unregisteredBadge: 'មិនទាន់ចុះឈ្មោះ',
    firstTimeAttendee: 'អ្នកមកលើកដំបូង',
    triggerRegFlow: 'បើកទម្រង់ចុះឈ្មោះ',
    btnSimulateMobile: '📱 សាកល្បងផ្ទាំងទូរស័ព្ទដៃ (Mobile View)',
    btnManualMode: '⌨️ វាយបញ្ចូលអត្តលេខដោយផ្ទាល់',
    btnQrScreenMode: '📲 បង្ហាញ QR Code ធំមាត់ទ្វារ',
    liveRecentCheckins: 'អ្នកទើបតែបាន Check-In ថ្មីៗផ្ទាល់៖',
    
    // Mobile Web Portal Check-In Experience
    mobilePortalBadge: 'ច្រកកត់ត្រាវត្តមានលើទូរស័ព្ទដៃ',
    mobileFirstTimeTitle: 'ស្វាគមន៍ការចូលបណ្ណាល័យលើកដំបូង!',
    mobileFirstTimeSub: 'សូមបំពេញព័ត៌មានលម្អិតរបស់អ្នកតែម្ដងគត់។ ពេលមកលើកក្រោយៗ ប្រព័ន្ធនឹងចាំទូរស័ព្ទរបស់អ្នកស្វ័យប្រវត្តិ គ្រាន់តែចុច Check In ជាការស្រេច។',
    mobileReturningTitle: 'សូមស្វាគមន៍ការត្រឡប់មកវិញ!',
    mobileReturningSub: 'ប្រព័ន្ធបានស្គាល់អត្តសញ្ញាណរបស់អ្នករួចជាស្រេច។ សូមចុចប៊ូតុងខាងក្រោមដើម្បីកត់ត្រាវត្តមានភ្លាមៗ។',
    mobileOneTapCheckIn: 'ចុចទីនេះដើម្បី CHECK IN ចូលបណ្ណាល័យ',
    mobileOneTapCheckOut: 'ចុចទីនេះដើម្បី CHECK OUT ចាកចេញ',
    mobileCurrentlyInside: '🟢 អ្នកកំពុងមានវត្តមានក្នុងបណ្ណាល័យ',
    mobileNotInside: '⚪ អ្នកមិនទាន់បានកត់ត្រាចូលនៅឡើយទេ',
    mobileCheckInSuccess: '🎉 កត់ត្រាវត្តមានចូលជោគជ័យ!',
    mobileCheckOutSuccess: '👋 កត់ត្រាវត្តមានចេញជោគជ័យ!',
    mobileSaveSuccessMsg: 'ព័ត៌មានរបស់អ្នកត្រូវបានចងចាំក្នុងទូរស័ព្ទនេះរួចរាល់ហើយ!',
    mobileSwitchProfile: '🔄 ផ្លាស់ប្ដូរគណនី / ចុះឈ្មោះថ្មី',
    mobileSelectPurpose: 'ជ្រើសរើសគោលបំណងថ្ងៃនេះ៖',
    mobileBackToEntrance: '← ត្រឡប់ទៅផ្ទាំងមាត់ទ្វារធំ',
    mobileSessionDuration: 'ថិរវេលាបានចំណាយថ្ងៃនេះ៖',

    // Check-in Purposes
    purposes: {
      'Study & Revision': 'ស្វ័យសិក្សា និងរំលឹកមេរៀន',
      'Thesis & Academic Research': 'ស្រាវជ្រាវនិក្ខេបបទ និងសារណា',
      'Book Reading & Borrowing': 'អាន និងខ្ចី-សងសៀវភៅ',
      'Group Discussion & Project': 'ពិភាក្សាជាក្រុម និងធ្វើគម្រោង',
      'Computer & Digital Lab': 'ប្រើប្រាស់កុំព្យូទ័រ និងបណ្ណាល័យអេឡិចត្រូនិក',
      'Printing & Document Service': 'សេវាបោះពុម្ព និងចម្លងឯកសារ',
      'Librarian Consultation': 'ប្រឹក្សាយោបល់ជាមួយបណ្ណារក្ស',
      'Senior Thesis Literature Review': 'ស្រាវជ្រាវឯកសារនិក្ខេបបទ',
      'Grant Proposal & Research Review': 'រៀបចំគម្រោងស្រាវជ្រាវ',
      'PhD Dissertation Manuscript Drafting': 'តាក់តែងសារណាថ្នាក់បណ្ឌិត',
      'Journal Peer Review & Archival Reference': 'ស្រាវជ្រាវឯកសារយោង និងទស្សនាវដ្តី',
      'Capstone Project Experimental Analysis': 'វិភាគទិន្នន័យគម្រោងបញ្ចប់ការសិក្សា',
      'Computational Data Modeling & Coding': 'សរសេរកូដ និងវិភាគគំរូទិន្នន័យ',
      'Archival Law & Policy Research': 'ស្រាវជ្រាវច្បាប់ និងគោលនយោបាយ'
    },

    // Roles
    roles: {
      'Student': 'និស្សិត',
      'Lecturer': 'សាស្ត្រាចារ្យ',
      'Professor': 'សាស្ត្រាចារ្យជាន់ខ្ពស់',
      'Researcher': 'អ្នកស្រាវជ្រាវ',
      'Staff': 'បុគ្គលិក',
      'Guest': 'ភ្ញៀវទូទៅ'
    },

    // Departments
    departments: {
      'Computer Science & IT': 'វិទ្យាសាស្ត្រកុំព្យូទ័រ និងព័ត៌មានវិទ្យា',
      'Engineering & Architecture': 'វិស្វកម្ម និងស្ថាបត្យកម្ម',
      'Business & Economics': 'សេដ្ឋកិច្ច និងធុរកិច្ច',
      'Law & Political Science': 'នីតិសាស្ត្រ និងវិទ្យាសាស្ត្រនយោបាយ',
      'Medicine & Health Sciences': 'វេជ្ជសាស្ត្រ និងវិទ្យាសាស្ត្រសុខាភិបាល',
      'Humanities & Social Sciences': 'មនុស្សសាស្ត្រ និងវិទ្យាសាស្ត្រសង្គម',
      'Science & Technology': 'វិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យា',
      'Data Science': 'វិទ្យាសាស្ត្រទិន្នន័យ',
      'General / External': 'ទូទៅ / ខាងក្រៅ'
    },

    // Welcome Card
    welcomeTitle: 'សូមស្វាគមន៍ការមកកាន់បណ្ណាល័យ!',
    welcomeSub: 'ការកត់ត្រាវត្តមានចូលត្រូវបានរក្សាទុកដោយជោគជ័យ។',
    welcomeRegisteredTitle: 'បានចុះឈ្មោះ & កត់ត្រាចូលជោគជ័យ!',
    welcomeActiveTitle: 'វត្តមានកំពុងសកម្មក្នុងបណ្ណាល័យ',
    memberLabel: 'គោត្តនាម និងនាម',
    idLabel: 'អត្តលេខសម្គាល់ (ID)',
    roleLabel: 'តួនាទី',
    deptLabel: 'មហាវិទ្យាល័យ / ដេប៉ាតឺម៉ង់',
    checkinTimeLabel: 'ពេលវេលាចូល',
    purposeLabel: 'គោលបំណង',
    researchDomainLabel: 'ជំនាញ / មុខវិជ្ជាស្រាវជ្រាវ',
    recommendedArea: 'តំបន់ស្រាវជ្រាវដែលបានណែនាំ',
    welcomeMsg: 'សូមស្វាគមន៍ការត្រឡប់មកវិញ! ការកត់ត្រាវត្តមានចូលទទួលបានជោគជ័យ។ សូមរីករាយក្នុងការស្រាវជ្រាវ!',
    alreadyActiveMsg: 'អ្នកមានវត្តមានក្នុងបណ្ណាល័យតាំងពីម៉ោង',
    btnContinueLibrary: 'បន្តចូលក្នុងបណ្ណាល័យ',
    btnDone: 'រួចរាល់ / បន្តទៅមុខ',

    // Checkout Card
    checkoutTitle: 'កត់ត្រាចេញដោយជោគជ័យ!',
    checkoutSub: 'ការស្រាវជ្រាវត្រូវបានកត់ត្រា និងបិទបញ្ចប់ដោយជោគជ័យ។',
    durationLabel: 'ថិរវេលាសរុបក្នុងបណ្ណាល័យ',
    entryTimeLabel: 'ពេលវេលាចូល',
    exitTimeLabel: 'ពេលវេលាចេញ',
    wishingMsg: 'សូមថ្លែងអំណរគុណសម្រាប់ការមកប្រើប្រាស់បណ្ណាល័យ! សូមជូនពរឱ្យការសិក្សា និងការស្រាវជ្រាវទទួលបានលទ្ធផលល្អប្រសើរ។',
    btnDoneNext: 'រួចរាល់ (រៀបចំសម្រាប់អ្នកបន្ទាប់)',

    // Registration Modal
    regTitle: 'ចុះឈ្មោះសមាជិកបណ្ណាល័យថ្មី',
    regSub: 'បង្កើតគណនីបណ្ណាល័យឌីជីថលភ្លាមៗ ដើម្បីទទួលបានប័ណ្ណ QR Code សម្រាប់ស្កេនចូល-ចេញ។',
    step1Title: 'ព័ត៌មានផ្ទាល់ខ្លួន & តួនាទី',
    step2Title: 'ជំនាញ & គោលបំណងស្រាវជ្រាវ',
    fullName: 'គោត្តនាម និងនាម',
    fullNamePlaceholder: 'ឧ. សុខ ចាន់ដារ៉ា',
    universityId: 'អត្តលេខនិស្សិត / បុគ្គលិក',
    idPlaceholder: 'ឧ. DUC2024-0417',
    selectRole: 'ជ្រើសរើសតួនាទីសិក្សា',
    selectDept: 'ជ្រើសរើសមហាវិទ្យាល័យ / ដេប៉ាតឺម៉ង់',
    researchField: 'ប្រធានបទស្រាវជ្រាវ / ជំនាញឯកទេស',
    researchFieldPlaceholder: 'ឧ. បញ្ញាសិប្បនិម្មិត, ច្បាប់ពាណិជ្ជកម្ម, វិស្វកម្ម...',
    email: 'អាសយដ្ឋានអ៊ីមែល (មិនបង្ខំ)',
    emailPlaceholder: 'name@university.edu.kh',
    phone: 'លេខទូរស័ព្ទ (មិនបង្ខំ)',
    phonePlaceholder: '012 345 678',
    btnCancel: 'បោះបង់',
    btnBack: '← ត្រឡប់ក្រោយ',
    btnContinueToStep2: 'បន្តទៅផ្នែកស្រាវជ្រាវ',
    btnSaveAndPass: 'ចុះឈ្មោះ & បង្កើតប័ណ្ណឌីជីថល',

    // Digital Pass Modal
    passTitle: 'ប័ណ្ណបណ្ណាល័យឌីជីថល (Digital Pass)',
    passSub: 'អ្នកអាចរក្សាទុករូបភាពប័ណ្ណនេះក្នុងទូរស័ព្ទ ឬបោះពុម្ពសម្រាប់ស្កេនលើកក្រោយ។',
    passOfficialBadge: 'ប័ណ្ណសមាជិកផ្លូវការ',
    passAttendanceCard: 'ប័ណ្ណវត្តមានស្រាវជ្រាវ',
    passValidText: 'ប័ណ្ណមានសុពលភាពសម្រាប់ប្រើប្រាស់បណ្ណាល័យ',
    btnDownloadPass: 'ទាញយករូបភាពប័ណ្ណ',
    btnPrintPass: 'បោះពុម្ពប័ណ្ណ (Print)',
    btnClose: 'បិទ',

    // Camera Scanner Modal
    cameraTitle: 'ស្កេន QR Code ឬ Barcode តាមកាមេរ៉ា',
    cameraSub: 'សូមបង្ហាញប័ណ្ណបណ្ណាល័យ ឬកូដ QR ឱ្យចំប្រអប់កាមេរ៉ាខាងក្រោម។',
    cameraSearching: 'កំពុងភ្ជាប់ដំណើរការកាមេរ៉ា...',
    cameraSwitch: 'ប្ដូរកាមេរ៉ា',
    cameraSimulationTitle: 'សាកល្បងស្កេនគំរូ (១ ចុច)',

    // Users Directory Modal
    directoryTitle: 'បញ្ជីរាយនាមសមាជិកបណ្ណាល័យ',
    directorySub: 'សមាជិកទាំងអស់ដែលបានចុះឈ្មោះក្នុងប្រព័ន្ធទិន្នន័យបណ្ណាល័យ',
    searchMemberPlaceholder: 'ស្វែងរកតាមឈ្មោះ, អត្តលេខ, មហាវិទ្យាល័យ...',
    filterAllRoles: 'គ្រប់តួនាទីទាំងអស់',
    totalMembersCount: 'ចំនួនសមាជិកសរុប',
    viewPass: 'មើលប័ណ្ណ',
    btnCheckInNow: 'កត់ត្រាចូលភ្លាមៗ',
    enrolledOn: 'បានចុះឈ្មោះនៅថ្ងៃ',
    btnAddMember: 'បន្ថែមសមាជិកថ្មី',

    // Admin Dashboard
    adminTitle: 'ផ្ទាំងគ្រប់គ្រងទូទៅ និងវិភាគទិន្នន័យស្រាវជ្រាវ',
    adminSub: 'តាមដានចំនួនវត្តមានផ្ទាល់ ស្ថិតិនៃការស្រាវជ្រាវ និងគ្រប់គ្រងសមាជិកបណ្ណាល័យ',
    liveMonitorBadge: 'តាមដានផ្ទាល់ (Live)',
    btnAcademicDirectory: 'បញ្ជីសមាជិក',
    btnEnrollMember: 'ចុះឈ្មោះសមាជិក',
    btnSeedDemo: 'បង្កើតទិន្នន័យគំរូ',
    btnRefreshData: 'ផ្ទុកទិន្នន័យឡើងវិញ',
    statTodayVisits: 'វត្តមានសរុបថ្ងៃនេះ',
    statInsideNow: 'កំពុងមានវត្តមានផ្ទាល់',
    statInsideFacility: 'នាក់ក្នុងបណ្ណាល័យ',
    statAvgDuration: 'ថិរវេលាមធ្យម',
    statTotalMembers: 'សមាជិកចុះឈ្មោះសរុប',
    statOccupancyRate: 'អត្រាប្រើប្រាស់កៅអី',
    statPeakHour: 'ម៉ោងដែលមានអ្នកចូលច្រើនបំផុត',
    statPeakHourDesc: 'ចន្លោះម៉ោងដែលមានអ្នកចូលស្រាវជ្រាវច្រើន',
    tabLiveSessions: 'អ្នកកំពុងមានវត្តមានផ្ទាល់ (Live Occupants)',
    tabAllLogs: 'កំណត់ត្រាវត្តមានទាំងអស់',
    tabAnalytics: 'ស្ថិតិ និងក្រាហ្វិកស្រាវជ្រាវ',
    tabMembers: 'គ្រប់គ្រងសមាជិក',
    btnExportCsv: 'ទាញយករបាយការណ៍ (CSV / Excel)',
    btnForceCheckout: 'កត់ត្រាចេញ (Check-Out)',
    statusActive: 'កំពុងនៅក្នុងបណ្ណាល័យ',
    statusCompleted: 'បានចាកចេញរួចរាល់',
    colMember: 'សមាជិក',
    colId: 'អត្តលេខ (ID)',
    colRole: 'តួនាទី',
    colDept: 'ដេប៉ាតឺម៉ង់ / មហាវិទ្យាល័យ',
    colPurpose: 'គោលបំណង & ប្រធានបទស្រាវជ្រាវ',
    colEntryTime: 'ពេលវេលាចូល',
    colExitTime: 'ពេលវេលាចេញ',
    colDuration: 'ថិរវេលា',
    colStatus: 'ស្ថានភាព',
    colActions: 'សកម្មភាព',
    noSessionsFound: 'មិនមានទិន្នន័យវត្តមានត្រូវនឹងលក្ខខណ្ឌស្វែងរកឡើយ',
    noActiveSessions: 'បច្ចុប្បន្នគ្មានអ្នកណាម្នាក់នៅក្នុងបណ្ណាល័យឡើយ',
    inSince: 'ចូលតាំងពីម៉ោង',

    // Analytics
    analyticsVisitsByDept: 'ចំនួនវត្តមានតាមមហាវិទ្យាល័យ / ដេប៉ាតឺម៉ង់',
    analyticsVisitsByDeptSub: 'ការចូលរួមស្រាវជ្រាវតាមដេប៉ាតឺម៉ង់នីមួយៗ',
    analyticsPurposeDist: 'ការបែងចែកតាមគោលបំណងស្រាវជ្រាវ',
    analyticsPeakHours: 'ស្ថិតិអ្នកចូលតាមចន្លោះម៉ោង (Peak Hours)',
    analyticsPeakHoursSub: 'ការបែងចែកការកត់ត្រាចូលតាមម៉ោងនីមួយៗ',
    analyticsWeeklyTrends: 'និន្នាការវត្តមានប្រចាំសប្ដាហ៍ (៧ ថ្ងៃ)',
    analyticsWeeklyTrendsSub: 'ចំនួនអ្នកចូលប្រើប្រាស់បណ្ណាល័យប្រចាំថ្ងៃ',
    analyticsRoleBreakdown: 'ការបែងចែកតាមតួនាទីសិក្សា',
    analyticsRoleBreakdownSub: 'សមាមាត្រអ្នកចូលរួមស្រាវជ្រាវ',

    // Notifications & Messages
    checkInSuccess: 'កត់ត្រាវត្តមានចូលជោគជ័យ! សូមស្វាគមន៍។',
    checkOutSuccess: 'កត់ត្រាវត្តមានចេញជោគជ័យ! សូមអរគុណ។',
    userNotFound: 'រកមិនឃើញអត្តលេខសម្គាល់នេះទេ! សូមចុះឈ្មោះជាសមាជិកថ្មី។',
    alreadyCheckedIn: 'អ្នកបានកត់ត្រាចូលរួចហើយ! បច្ចុប្បន្នកំពុងស្ថិតក្នុងបណ្ណាល័យ។',
    notCheckedIn: 'មិនមានកំណត់ត្រាចូលសម្រាប់គណនីនេះឡើយ។',
    inputRequired: 'សូមវាយបញ្ចូលអត្តលេខ ឬស្កេនប័ណ្ណរបស់អ្នក។'
  },
  en: {
    // General & App
    appName: 'UniResearch',
    library: 'Library',
    systemTitle: 'University Library Research & Attendance Tracking System',
    versionBadge: 'ATTENDANCE v2.5',
    academicSub: 'Academic Research & Attendance Tracking Gateway',
    insideLibrary: 'Inside Library:',
    activeOccupants: 'active',
    time: 'Time',
    language: 'Language',
    khmer: 'ភាសាខ្មែរ',
    english: 'English',
    footerCopyright: '© 2026 University Library Research & Attendance Management System',
    footerRoleInfo: 'Role-Based Access: Student • Lecturer • Professor • Scholar • Staff',
    footerTech: 'Modern REST API & Relational Storage',

    // Navigation
    navKiosk: 'Entrance Screen (Kiosk QR)',
    navAdmin: 'Admin & Analytics',
    navMobilePortal: 'Mobile Portal (Phone)',

    // Kiosk & Entrance Screen
    kioskBadge: 'Smart Digital Entrance Gateway',
    kioskDepartureBadge: 'Library Departure Gateway',
    kioskTitle: 'Welcome to University Research Library',
    kioskSub: 'Scan the large QR Code below with your mobile phone camera or enter your ID to check in/out.',
    entranceQrTitle: 'Scan with Mobile Phone to Check In',
    entranceQrSub: 'Open your phone camera: First-time visitors fill details once. Returning visitors just tap Check In on their phone!',
    entranceQrSubEn: 'Open phone camera to scan this QR code for instant check-in / check-out',
    mobileScanPrompt: 'Scan QR with Mobile Phone',
    mobileScanPromptSub: 'Quick, touchless, and zero wait time',
    kioskDepartureTitle: 'Scan University ID to Check Out',
    kioskDepartureSub: 'End your active research session to calculate total hours logged.',
    tabCheckIn: 'Scan Check-In',
    tabCheckOut: 'Scan Check-Out',
    inputPlaceholder: 'Enter University ID (e.g. DUC2024-0417, DUCL2024-0201)...',
    scannerReady: 'Scanner Ready',
    enterBtn: 'Enter',
    btnCheckIn: 'Record Check-In',
    btnCheckOut: 'Record Check-Out',
    btnCameraScan: 'Camera Scan (QR / Barcode)',
    btnCameraScanSub: 'Supports QR code badges, digital passes & plastic ID barcodes',
    btnRegister: 'Register Member',
    btnDemoUsers: 'Quick Demo Pass',
    btnDemoUsersSub: 'Click any badge to simulate ID scanner',
    btnDirectory: 'Member Directory',
    purposeSectionTitle: 'Select Purpose of Visit / Research Focus',
    purposeSectionSub: 'Helps the library recommend optimal study zones and track academic research output',
    processing: 'Processing...',
    readyToScan: 'Ready for USB barcode scanners or mobile QR scans...',
    newVisitorBadge: '✨ New Visitor',
    unregisteredBadge: 'Unregistered',
    firstTimeAttendee: 'First-Time Attendee',
    triggerRegFlow: 'Triggers Registration Flow',
    btnSimulateMobile: '📱 Simulate Mobile Phone View',
    btnManualMode: '⌨️ Manual ID Entry Mode',
    btnQrScreenMode: '📲 Big Entrance QR Screen',
    liveRecentCheckins: 'Live Recent Check-ins at Gate:',

    // Mobile Web Portal Check-In Experience
    mobilePortalBadge: 'Mobile Phone Attendance Gateway',
    mobileFirstTimeTitle: 'Welcome to Your First Library Visit!',
    mobileFirstTimeSub: 'Please fill in your details once. On all future visits, this phone will remember you so you can check in with 1 tap.',
    mobileReturningTitle: 'Welcome Back!',
    mobileReturningSub: 'Your identity is recognized on this device. Tap the button below for instant check-in.',
    mobileOneTapCheckIn: 'TAP TO CHECK IN NOW',
    mobileOneTapCheckOut: 'TAP TO CHECK OUT NOW',
    mobileCurrentlyInside: '🟢 Currently Active Inside Library',
    mobileNotInside: '⚪ Not Checked In Yet',
    mobileCheckInSuccess: '🎉 Check-in Recorded Successfully!',
    mobileCheckOutSuccess: '👋 Check-out Recorded Successfully!',
    mobileSaveSuccessMsg: 'Your profile has been saved to this phone for instant 1-tap future visits!',
    mobileSwitchProfile: '🔄 Switch Account / New Profile',
    mobileSelectPurpose: "Select Today's Purpose:",
    mobileBackToEntrance: '← Back to Entrance Screen',
    mobileSessionDuration: 'Total Time Spent Today:',

    // Check-in Purposes
    purposes: {
      'Study & Revision': 'Self-Study & Revision',
      'Thesis & Academic Research': 'Thesis & Academic Research',
      'Book Reading & Borrowing': 'Book Reading & Borrowing',
      'Group Discussion & Project': 'Group Study & Project',
      'Computer & Digital Lab': 'Computer & Digital Lab',
      'Printing & Document Service': 'Printing & Document Service',
      'Librarian Consultation': 'Librarian Consultation',
      'Senior Thesis Literature Review': 'Senior Thesis Literature Review',
      'Grant Proposal & Research Review': 'Grant Proposal & Research Review',
      'PhD Dissertation Manuscript Drafting': 'PhD Dissertation Manuscript Drafting',
      'Journal Peer Review & Archival Reference': 'Journal Peer Review & Archival Reference',
      'Capstone Project Experimental Analysis': 'Capstone Project Experimental Analysis',
      'Computational Data Modeling & Coding': 'Computational Data Modeling & Coding',
      'Archival Law & Policy Research': 'Archival Law & Policy Research'
    },

    // Roles
    roles: {
      'Student': 'Student',
      'Lecturer': 'Lecturer',
      'Professor': 'Professor',
      'Researcher': 'Researcher',
      'Staff': 'Staff',
      'Guest': 'Guest'
    },

    // Departments
    departments: {
      'Computer Science & IT': 'Computer Science & IT',
      'Engineering & Architecture': 'Engineering & Architecture',
      'Business & Economics': 'Business & Economics',
      'Law & Political Science': 'Law & Political Science',
      'Medicine & Health Sciences': 'Medicine & Health Sciences',
      'Humanities & Social Sciences': 'Humanities & Social Sciences',
      'Science & Technology': 'Science & Technology',
      'Data Science': 'Data Science',
      'General / External': 'General / External'
    },

    // Welcome Card
    welcomeTitle: 'Welcome to the Library!',
    welcomeSub: 'Your entry has been recorded successfully.',
    welcomeRegisteredTitle: 'Profile Registered & Checked In!',
    welcomeActiveTitle: 'Active Library Session',
    memberLabel: 'Member Name',
    idLabel: 'University ID',
    roleLabel: 'Role',
    deptLabel: 'Department / Faculty',
    checkinTimeLabel: 'Check-in Time',
    purposeLabel: 'Purpose',
    researchDomainLabel: 'Research Domain',
    recommendedArea: 'Recommended Research Area',
    welcomeMsg: 'Welcome back! Your check-in was successful. Happy researching!',
    alreadyActiveMsg: 'You have been active in the library since',
    btnContinueLibrary: 'Continue into Library',
    btnDone: 'Done / Next',

    // Checkout Card
    checkoutTitle: 'Check-Out Successful!',
    checkoutSub: 'Library session logged and closed.',
    durationLabel: 'Total Time in Library',
    entryTimeLabel: 'Check-in Time',
    exitTimeLabel: 'Check-out Time',
    wishingMsg: 'Thank you for researching with us today! Wishing you great success in your academic journey.',
    btnDoneNext: 'Done (Ready for next visitor)',

    // Registration Modal
    regTitle: 'Register New Library Member',
    regSub: 'Instant digital pass issuance for students, lecturers, researchers, and university staff.',
    step1Title: 'Personal & Role Details',
    step2Title: 'Academic & Research Focus',
    fullName: 'Full Name',
    fullNamePlaceholder: 'e.g. Sok Chandara or Dr. Emily Watson',
    universityId: 'University ID (Student/Staff)',
    idPlaceholder: 'e.g. DUC2024-0417',
    selectRole: 'Select Academic Role',
    selectDept: 'Select Faculty / Department',
    researchField: 'Research Topic / Specialized Field',
    researchFieldPlaceholder: 'e.g. Deep Reinforcement Learning, CRISPR, Economics',
    email: 'University Email (Optional)',
    emailPlaceholder: 'name@university.edu.kh',
    phone: 'Phone Number (Optional)',
    phonePlaceholder: '+855 12 345 678',
    btnCancel: 'Cancel',
    btnBack: '← Back to Personal Info',
    btnContinueToStep2: 'Continue to Research Focus',
    btnSaveAndPass: 'Save & Generate Pass',

    // Digital Pass Modal
    passTitle: 'Digital Library Pass',
    passSub: 'Save this digital credential to your phone or print it for instant barcode/QR scanning.',
    passOfficialBadge: 'OFFICIAL MEMBER PASS',
    passAttendanceCard: 'Research Attendance Card',
    passValidText: 'Valid for University Library Access',
    btnDownloadPass: 'Download Pass Image',
    btnPrintPass: 'Print Pass',
    btnClose: 'Close',

    // Camera Scanner Modal
    cameraTitle: 'Scan QR Code or Barcode',
    cameraSub: 'Align the digital QR pass or physical barcode in the camera view below.',
    cameraSearching: 'Starting optical scanner...',
    cameraSwitch: 'Switch Camera',
    cameraSimulationTitle: 'Quick Scan Simulation (1-Click Test)',

    // Users Directory Modal
    directoryTitle: 'University Members Directory',
    directorySub: 'All registered scholars, students, and staff in the library database',
    searchMemberPlaceholder: 'Search by name, ID, department...',
    filterAllRoles: 'All Roles',
    totalMembersCount: 'Total Members',
    viewPass: 'View Pass',
    btnCheckInNow: 'Check-in Now',
    enrolledOn: 'Enrolled',
    btnAddMember: 'Add Member',

    // Admin Dashboard
    adminTitle: 'Attendance & Research Intelligence Dashboard',
    adminSub: 'Live occupancy monitoring, research domain analytics, and attendance history',
    liveMonitorBadge: 'Live Monitor',
    btnAcademicDirectory: 'Academic Directory',
    btnEnrollMember: 'Enroll Member',
    btnSeedDemo: 'Seed Demo',
    btnRefreshData: 'Refresh All Data',
    statTodayVisits: "Today's Total Visits",
    statInsideNow: 'Currently Inside Library',
    statInsideFacility: 'inside facility',
    statAvgDuration: 'Avg Session Duration',
    statTotalMembers: 'Registered Members',
    statOccupancyRate: 'Seat Occupancy',
    statPeakHour: 'Peak Research Hour',
    statPeakHourDesc: 'Highest library occupancy surge',
    tabLiveSessions: 'Live Occupants Room Monitor',
    tabAllLogs: 'All Attendance Logs',
    tabAnalytics: 'Research Analytics',
    tabMembers: 'Member Directory',
    btnExportCsv: 'Export Attendance (CSV)',
    btnForceCheckout: 'Force Check-out',
    statusActive: 'Inside Library',
    statusCompleted: 'Completed',
    colMember: 'Member',
    colId: 'ID Number',
    colRole: 'Role',
    colDept: 'Department',
    colPurpose: 'Purpose',
    colEntryTime: 'Entry Time',
    colExitTime: 'Exit Time',
    colDuration: 'Duration',
    colStatus: 'Status',
    colActions: 'Actions',
    noSessionsFound: 'No attendance records found',
    noActiveSessions: 'No one is currently inside the library',
    inSince: 'In since',

    // Analytics
    analyticsVisitsByDept: 'Attendance by Department / Faculty',
    analyticsVisitsByDeptSub: 'Top faculty disciplines',
    analyticsPurposeDist: 'Research Purpose Distribution',
    analyticsPeakHours: 'Visits by Time of Day (Peak Hours)',
    analyticsPeakHoursSub: 'Hourly distribution of check-in entries',
    analyticsWeeklyTrends: '7-Day Attendance Trend',
    analyticsWeeklyTrendsSub: 'Daily visitor traffic volume',
    analyticsRoleBreakdown: 'Academic Roles Breakdown',
    analyticsRoleBreakdownSub: 'All-time participant ratio',

    // Notifications & Messages
    checkInSuccess: 'Check-in recorded successfully! Welcome.',
    checkOutSuccess: 'Check-out successful! Thank you.',
    userNotFound: 'ID not found. Please register as a new library member.',
    alreadyCheckedIn: 'Already checked in! Currently active inside library.',
    notCheckedIn: 'No active session found for this ID.',
    inputRequired: 'Please enter an ID or scan a barcode/QR code.'
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('lib_lang') || 'km'; // Default to Khmer
  });

  const toggleLanguage = () => {
    const nextLang = lang === 'km' ? 'en' : 'km';
    setLang(nextLang);
    localStorage.setItem('lib_lang', nextLang);
  };

  const setSpecificLanguage = (l) => {
    if (l === 'km' || l === 'en') {
      setLang(l);
      localStorage.setItem('lib_lang', l);
    }
  };

  // Translation lookup helper
  const t = (key, fallback = '') => {
    const currentDict = translations[lang] || translations.en;
    if (key in currentDict) {
      return currentDict[key];
    }
    if (key in translations.en) {
      return translations.en[key];
    }
    return fallback || key;
  };

  // Helper for translating roles
  const tRole = (role) => {
    if (!role) return '';
    const dict = translations[lang]?.roles || translations.en.roles;
    return dict[role] || role;
  };

  // Helper for translating purposes
  const tPurpose = (purpose) => {
    if (!purpose) return '';
    const dict = translations[lang]?.purposes || translations.en.purposes;
    return dict[purpose] || purpose;
  };

  // Helper for translating departments
  const tDept = (dept) => {
    if (!dept) return '';
    const dict = translations[lang]?.departments || translations.en.departments;
    return dict[dept] || dept;
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        toggleLanguage,
        setSpecificLanguage,
        t,
        tRole,
        tPurpose,
        tDept,
        isKhmer: lang === 'km'
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
