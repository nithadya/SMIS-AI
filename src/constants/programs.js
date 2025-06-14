// ICBT Programs organized by category
export const ICBT_PROGRAMS = {
  INFORMATION_TECHNOLOGY: [
    {
      id: 'HDCSE',
      name: 'Higher Diploma in Computing and Software Engineering',
      code: 'HDCSE',
      description: 'Comprehensive program covering computing fundamentals and software engineering principles',
      duration: '2 years',
      category: 'Information Technology',
      level: 'Higher Diploma'
    },
    {
      id: 'BSE3',
      name: 'BSc (Hons) Software Engineering (3 year Degree)',
      code: 'BSE3',
      description: 'Three-year bachelor degree program in software engineering',
      duration: '3 years',
      category: 'Information Technology',
      level: 'Bachelor'
    },
    {
      id: 'BIT3',
      name: 'BSc (Hons) Information Technology (3 year Degree)',
      code: 'BIT3',
      description: 'Three-year bachelor degree program in information technology',
      duration: '3 years',
      category: 'Information Technology',
      level: 'Bachelor'
    },
    {
      id: 'BSITAI',
      name: 'Bachelor of Science (Honours) Information Technology in Artificial Intelligence (4 Years)',
      code: 'BSITAI',
      description: 'Four-year specialized degree program focusing on artificial intelligence and machine learning',
      duration: '4 years',
      category: 'Information Technology',
      level: 'Bachelor'
    },
    {
      id: 'BSE',
      name: 'BSc (Hons) Software Engineering',
      code: 'BSE',
      description: 'Bachelor degree program in software engineering with industry focus',
      duration: '3 years',
      category: 'Information Technology',
      level: 'Bachelor'
    },
    {
      id: 'BSBIS',
      name: 'BSc (Hons) Business Information Systems',
      code: 'BSBIS',
      description: 'Bachelor degree program combining business knowledge with information systems',
      duration: '3 years',
      category: 'Information Technology',
      level: 'Bachelor'
    },
    {
      id: 'BSIT',
      name: 'BSc (Hons) in Information Technology',
      code: 'BSIT',
      description: 'Bachelor degree program in information technology',
      duration: '3 years',
      category: 'Information Technology',
      level: 'Bachelor'
    }
  ],
  BUSINESS: [
    {
      id: 'HDBM',
      name: 'Higher Diploma in Business Management',
      code: 'HDBM',
      description: 'Comprehensive business management program covering modern business practices',
      duration: '2 years',
      category: 'Business',
      level: 'Higher Diploma'
    },
    {
      id: 'BSDM',
      name: 'BSc (Hons) Digital Marketing',
      code: 'BSDM',
      description: 'Bachelor degree program specializing in digital marketing strategies and techniques',
      duration: '3 years',
      category: 'Business',
      level: 'Bachelor'
    },
    {
      id: 'BSBM',
      name: 'BSc (Hons) Business and Management',
      code: 'BSBM',
      description: 'Bachelor degree program in business administration and management',
      duration: '3 years',
      category: 'Business',
      level: 'Bachelor'
    }
  ],
  SCIENCE: [
    {
      id: 'HDP',
      name: 'Higher Diploma in Psychology',
      code: 'HDP',
      description: 'Two-year diploma program in psychology fundamentals',
      duration: '2 years',
      category: 'Science',
      level: 'Higher Diploma'
    },
    {
      id: 'HDBS',
      name: 'Higher Diploma in Biomedical Science',
      code: 'HDBS',
      description: 'Two-year diploma program in biomedical science',
      duration: '2 years',
      category: 'Science',
      level: 'Higher Diploma'
    },
    {
      id: 'BSP',
      name: 'BSc (Hons) in Psychology',
      code: 'BSP',
      description: 'Bachelor degree program in psychology',
      duration: '3 years',
      category: 'Science',
      level: 'Bachelor'
    }
  ]
};

// Flattened array of all programs
export const ALL_PROGRAMS = [
  ...ICBT_PROGRAMS.INFORMATION_TECHNOLOGY,
  ...ICBT_PROGRAMS.BUSINESS,
  ...ICBT_PROGRAMS.SCIENCE
];

// Program categories
export const PROGRAM_CATEGORIES = [
  { id: 'Information Technology', name: 'Information Technology', count: ICBT_PROGRAMS.INFORMATION_TECHNOLOGY.length },
  { id: 'Business', name: 'Business', count: ICBT_PROGRAMS.BUSINESS.length },
  { id: 'Science', name: 'Science', count: ICBT_PROGRAMS.SCIENCE.length }
];

// Program levels
export const PROGRAM_LEVELS = [
  { id: 'Higher Diploma', name: 'Higher Diploma' },
  { id: 'Bachelor', name: 'Bachelor Degree' }
];

// Helper functions
export const getProgramsByCategory = (category) => {
  switch (category) {
    case 'Information Technology':
      return ICBT_PROGRAMS.INFORMATION_TECHNOLOGY;
    case 'Business':
      return ICBT_PROGRAMS.BUSINESS;
    case 'Science':
      return ICBT_PROGRAMS.SCIENCE;
    default:
      return ALL_PROGRAMS;
  }
};

export const getProgramByCode = (code) => {
  return ALL_PROGRAMS.find(program => program.code === code);
};

export const getProgramsByLevel = (level) => {
  return ALL_PROGRAMS.filter(program => program.level === level);
}; 