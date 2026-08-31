// Maps skill names to colored SVG icon components
// Falls back to a generic CodeBracketIcon if not matched

export const SKILL_COLORS = {
  // Languages
  'html':        { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
  'css':         { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-200' },
  'javascript':  { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
  'js':          { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
  'typescript':  { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  'ts':          { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  'python':      { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-200' },
  'java':        { bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200' },
  'c':           { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
  'c++':         { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
  'c#':          { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  'php':         { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200' },
  'ruby':        { bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200' },
  'go':          { bg: 'bg-cyan-50',   text: 'text-cyan-600',   border: 'border-cyan-200' },
  'rust':        { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'kotlin':      { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  'swift':       { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
  'dart':        { bg: 'bg-blue-50',   text: 'text-blue-500',   border: 'border-blue-200' },
  // Frameworks
  'react':       { bg: 'bg-cyan-50',   text: 'text-cyan-600',   border: 'border-cyan-200' },
  'vue':         { bg: 'bg-emerald-50',text: 'text-emerald-600',border: 'border-emerald-200' },
  'angular':     { bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200' },
  'next':        { bg: 'bg-gray-100',  text: 'text-gray-800',   border: 'border-gray-300' },
  'nextjs':      { bg: 'bg-gray-100',  text: 'text-gray-800',   border: 'border-gray-300' },
  'next.js':     { bg: 'bg-gray-100',  text: 'text-gray-800',   border: 'border-gray-300' },
  'node':        { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  'nodejs':      { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  'node.js':     { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  'express':     { bg: 'bg-gray-100',  text: 'text-gray-700',   border: 'border-gray-200' },
  'django':      { bg: 'bg-green-50',  text: 'text-green-800',  border: 'border-green-200' },
  'flask':       { bg: 'bg-gray-50',   text: 'text-gray-700',   border: 'border-gray-200' },
  'spring':      { bg: 'bg-green-50',  text: 'text-green-600',  border: 'border-green-200' },
  'flutter':     { bg: 'bg-blue-50',   text: 'text-blue-500',   border: 'border-blue-200' },
  // Databases
  'mongodb':     { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  'mysql':       { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  'postgresql':  { bg: 'bg-blue-50',   text: 'text-blue-800',   border: 'border-blue-200' },
  'postgres':    { bg: 'bg-blue-50',   text: 'text-blue-800',   border: 'border-blue-200' },
  'sqlite':      { bg: 'bg-cyan-50',   text: 'text-cyan-700',   border: 'border-cyan-200' },
  'redis':       { bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200' },
  // Tools
  'git':         { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'docker':      { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-200' },
  'aws':         { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
  'linux':       { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  'figma':       { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  'tailwind':    { bg: 'bg-cyan-50',   text: 'text-cyan-600',   border: 'border-cyan-200' },
  'graphql':     { bg: 'bg-pink-50',   text: 'text-pink-600',   border: 'border-pink-200' },
};

// Short display labels for well-known skills
export const SKILL_LABELS = {
  'html':       'HTML5',
  'css':        'CSS3',
  'javascript': 'JavaScript',
  'js':         'JavaScript',
  'typescript': 'TypeScript',
  'ts':         'TypeScript',
  'nodejs':     'Node.js',
  'node':       'Node.js',
  'nextjs':     'Next.js',
  'next':       'Next.js',
  'mongodb':    'MongoDB',
  'postgresql': 'PostgreSQL',
  'postgres':   'PostgreSQL',
  'c++':        'C++',
  'c#':         'C#',
};

// Initials to show inside the skill badge icon
export function getSkillInitials(name) {
  const key = name.toLowerCase().trim();
  const known = {
    'html': 'H5', 'css': 'CS', 'javascript': 'JS', 'js': 'JS',
    'typescript': 'TS', 'ts': 'TS', 'python': 'Py', 'java': 'Jv',
    'c++': 'C++', 'c#': 'C#', 'c': 'C', 'php': 'PHP',
    'react': 'Re', 'vue': 'Vue', 'angular': 'Ng',
    'next.js': 'Nx', 'nextjs': 'Nx', 'next': 'Nx',
    'node.js': 'No', 'nodejs': 'No', 'node': 'No',
    'express': 'Ex', 'django': 'Dj', 'flask': 'Fl',
    'mongodb': 'MDB', 'mysql': 'SQL', 'postgresql': 'PG', 'postgres': 'PG',
    'redis': 'Rd', 'docker': 'Dk', 'git': 'Git',
    'aws': 'AWS', 'linux': 'Lnx', 'figma': 'Fig',
    'tailwind': 'Tw', 'graphql': 'GQL', 'flutter': 'Fl',
    'kotlin': 'Kt', 'swift': 'Sw', 'dart': 'Dt',
    'ruby': 'Rb', 'go': 'Go', 'rust': 'Rs',
  };
  return known[key] || name.slice(0, 2).toUpperCase();
}

export function getSkillStyle(name) {
  const key = name.toLowerCase().trim();
  return SKILL_COLORS[key] || { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' };
}

export function getSkillLabel(name) {
  const key = name.toLowerCase().trim();
  return SKILL_LABELS[key] || name;
}
