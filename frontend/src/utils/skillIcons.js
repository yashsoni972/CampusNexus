// Skill icon SVG components and color mappings

export const SKILL_COLORS = {
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
  'mongodb':     { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  'mysql':       { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  'postgresql':  { bg: 'bg-blue-50',   text: 'text-blue-800',   border: 'border-blue-200' },
  'postgres':    { bg: 'bg-blue-50',   text: 'text-blue-800',   border: 'border-blue-200' },
  'sqlite':      { bg: 'bg-cyan-50',   text: 'text-cyan-700',   border: 'border-cyan-200' },
  'redis':       { bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200' },
  'git':         { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'docker':      { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-200' },
  'aws':         { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
  'linux':       { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  'figma':       { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  'tailwind':    { bg: 'bg-cyan-50',   text: 'text-cyan-600',   border: 'border-cyan-200' },
  'graphql':     { bg: 'bg-pink-50',   text: 'text-pink-600',   border: 'border-pink-200' },
};

export const SKILL_LABELS = {
  'html': 'HTML5', 'css': 'CSS3',
  'javascript': 'JavaScript', 'js': 'JavaScript',
  'typescript': 'TypeScript', 'ts': 'TypeScript',
  'nodejs': 'Node.js', 'node': 'Node.js', 'node.js': 'Node.js',
  'nextjs': 'Next.js', 'next': 'Next.js', 'next.js': 'Next.js',
  'mongodb': 'MongoDB', 'postgresql': 'PostgreSQL', 'postgres': 'PostgreSQL',
  'c++': 'C++', 'c#': 'C#',
};

// SVG icon components for popular skills
const SvgIcon = ({ children, viewBox = '0 0 24 24' }) => (
  <svg viewBox={viewBox} className="w-5 h-5" fill="currentColor">{children}</svg>
);

export const SKILL_SVG_ICONS = {
  html: () => (
    <svg viewBox="0 0 32 32" className="w-5 h-5" fill="currentColor">
      <path d="M5.902 27.201L3.655 2h24.69l-2.25 25.197L15.985 30 5.902 27.201z" fill="#e44d26"/>
      <path d="M16 27.858l8.17-2.265 1.922-21.532H16v23.797z" fill="#f16529"/>
      <path d="M16 13.407h-4.09l-.282-3.165H16V7.151H8.25l.074.83.759 8.517H16v-3.091zm0 8.027l-.014.004-3.442-.929-.22-2.465H9.221l.433 4.852 6.332 1.758.014-.004v-3.216z" fill="#ebebeb"/>
      <path d="M15.989 13.407v3.091h3.806l-.358 4.009-3.448.93v3.216l6.337-1.757.046-.522.726-8.137.076-.83h-7.185zm0-6.256v3.091h7.466l.062-.694.141-1.567.074-.83h-7.743z" fill="#fff"/>
    </svg>
  ),
  css: () => (
    <svg viewBox="0 0 32 32" className="w-5 h-5" fill="currentColor">
      <path d="M5.902 27.201L3.656 2h24.688l-2.249 25.197L15.985 30 5.902 27.201z" fill="#1572b6"/>
      <path d="M16 27.858l8.17-2.265 1.922-21.532H16v23.797z" fill="#33a9dc"/>
      <path d="M16 13.191h4.09l.282-3.165H16V6.935H23.75l-.074.83-.759 8.517H16v-3.091zm0 8.027l-.014.004-3.442-.929-.22-2.465H9.221l.433 4.852 6.332 1.758.014-.004v-3.216z" fill="#fff"/>
      <path d="M15.989 13.191v3.091h-3.806l-.358 4.009 3.448.93v3.216l-6.337-1.757-.046-.522-.726-8.137-.076-.83h7.901zm0-6.256v3.091H8.523l-.062-.694-.141-1.567-.074-.83h7.743z" fill="#ebebeb"/>
    </svg>
  ),
  javascript: () => (
    <svg viewBox="0 0 32 32" className="w-5 h-5">
      <rect width="32" height="32" rx="3" fill="#f7df1e"/>
      <path d="M20.809 23.875a2.866 2.866 0 002.6 1.6c1.09 0 1.787-.545 1.787-1.3 0-.9-.716-1.222-1.916-1.747l-.658-.282c-1.9-.809-3.16-1.822-3.16-3.964 0-1.973 1.5-3.476 3.853-3.476a3.889 3.889 0 013.742 2.107l-2.048 1.315a1.789 1.789 0 00-1.694-1.134 1.149 1.149 0 00-1.262 1.134c0 .794.49 1.116 1.622 1.6l.658.282c2.236.959 3.5 1.938 3.5 4.138 0 2.371-1.862 3.668-4.363 3.668a5.055 5.055 0 01-4.776-2.686zm-9.295.228c.413.733.789 1.353 1.693 1.353.864 0 1.41-.338 1.41-1.653v-8.947h2.52v8.982c0 2.724-1.595 3.964-3.925 3.964a4.079 4.079 0 01-3.947-2.486z" fill="#323330"/>
    </svg>
  ),
  typescript: () => (
    <svg viewBox="0 0 32 32" className="w-5 h-5">
      <rect width="32" height="32" rx="3" fill="#3178c6"/>
      <path d="M18.245 23.759v2.426c.394.202.86.353 1.4.453s1.083.15 1.63.15c.535 0 1.044-.056 1.526-.169a3.73 3.73 0 001.244-.527 2.55 2.55 0 00.838-.926 2.95 2.95 0 00.307-1.388 2.95 2.95 0 00-.19-1.094 2.517 2.517 0 00-.545-.844 3.94 3.94 0 00-.864-.666 9.655 9.655 0 00-1.138-.557 7.84 7.84 0 01-.76-.36 2.48 2.48 0 01-.496-.35 1.24 1.24 0 01-.275-.39 1.2 1.2 0 01-.086-.46 1.1 1.1 0 01.11-.497 1.02 1.02 0 01.31-.37 1.44 1.44 0 01.48-.23 2.2 2.2 0 01.617-.08 3.1 3.1 0 01.567.052 3.5 3.5 0 01.548.155c.18.068.35.15.51.247.16.097.305.207.435.33v-2.27a5.3 5.3 0 00-1.15-.32 7.8 7.8 0 00-1.39-.11c-.527 0-1.03.06-1.507.18a3.6 3.6 0 00-1.22.548 2.6 2.6 0 00-.82.94 2.9 2.9 0 00-.3 1.37c0 .72.207 1.33.62 1.83.414.5 1.04.92 1.88 1.26.33.13.633.26.91.39.277.13.516.27.716.42.2.15.357.32.47.51.113.19.17.41.17.66 0 .19-.04.37-.12.53a1.1 1.1 0 01-.35.4 1.7 1.7 0 01-.56.25 2.8 2.8 0 01-.75.09 3.6 3.6 0 01-1.31-.25 3.9 3.9 0 01-1.17-.73zm-5.699-7.613H16v-2.13H8v2.13h2.938V26h2.608V16.146z" fill="#fff"/>
    </svg>
  ),
  python: () => (
    <svg viewBox="0 0 32 32" className="w-5 h-5">
      <path d="M15.885 2.1c-7.1 0-6.651 3.07-6.651 3.07v3.19h6.752v.96H6.545S2 8.8 2 16.005s4.013 6.912 4.013 6.912H8.33v-3.325s-.13-4.013 3.95-4.013h6.812s3.818.062 3.818-3.693V5.768S23.437 2.1 15.885 2.1zm-3.772 2.17a1.232 1.232 0 11-1.23 1.232 1.23 1.23 0 011.23-1.232z" fill="url(#a)"/>
      <path d="M16.115 29.9c7.1 0 6.651-3.07 6.651-3.07v-3.19h-6.752v-.96h9.441S30 23.2 30 15.995s-4.013-6.912-4.013-6.912H23.67v3.325s.13 4.013-3.95 4.013h-6.812s-3.818-.062-3.818 3.693v6.118S8.563 29.9 16.115 29.9zm3.772-2.17a1.232 1.232 0 111.23-1.232 1.23 1.23 0 01-1.23 1.232z" fill="url(#b)"/>
      <defs>
        <linearGradient id="a" x1="9.8" y1="2.1" x2="22.8" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#387EB8"/><stop offset="1" stopColor="#366994"/>
        </linearGradient>
        <linearGradient id="b" x1="9.2" y1="16" x2="23.2" y2="29.9" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE052"/><stop offset="1" stopColor="#FFC331"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  react: () => (
    <svg viewBox="0 0 32 32" className="w-5 h-5" fill="#61dafb">
      <circle cx="16" cy="16" r="2.5"/>
      <ellipse cx="16" cy="16" rx="14" ry="5.5" fill="none" stroke="#61dafb" strokeWidth="1.5"/>
      <ellipse cx="16" cy="16" rx="14" ry="5.5" fill="none" stroke="#61dafb" strokeWidth="1.5" transform="rotate(60 16 16)"/>
      <ellipse cx="16" cy="16" rx="14" ry="5.5" fill="none" stroke="#61dafb" strokeWidth="1.5" transform="rotate(120 16 16)"/>
    </svg>
  ),
  nodejs: () => (
    <svg viewBox="0 0 32 32" className="w-5 h-5">
      <path d="M16 3L3 10.5v15L16 29l13-3.5v-15L16 3z" fill="#3c873a"/>
      <path d="M16 7.5l8.5 4.9v9.8L16 27l-8.5-4.8v-9.8L16 7.5z" fill="#3c873a"/>
      <path d="M16 12c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="#fff"/>
    </svg>
  ),
  git: () => (
    <svg viewBox="0 0 32 32" className="w-5 h-5">
      <path d="M29.472 14.528L17.472 2.528a1.8 1.8 0 00-2.545 0l-2.545 2.545 3.225 3.225a2.14 2.14 0 012.711 2.73l3.108 3.108a2.143 2.143 0 11-1.286 1.286l-2.898-2.898v7.624a2.143 2.143 0 11-1.762-.062V12.48a2.143 2.143 0 01-1.163-2.81L10.99 6.42 2.528 14.88a1.8 1.8 0 000 2.545l12 12a1.8 1.8 0 002.545 0l12.4-12.4a1.8 1.8 0 000-2.497z" fill="#f05032"/>
    </svg>
  ),
  docker: () => (
    <svg viewBox="0 0 32 32" className="w-5 h-5">
      <path d="M31.521 13.107a7.5 7.5 0 00-4.2-1.107 7.3 7.3 0 00-1.3-4.5l-.3-.4-.4.3a5.9 5.9 0 00-2.1 3.5 5.5 5.5 0 00.5 3.3 8.1 8.1 0 01-2.9.5H.479a.5.5 0 00-.5.5 12.1 12.1 0 00.7 4.3 8.9 8.9 0 003.7 4.7 9.5 9.5 0 005.1 1.3 16.5 16.5 0 006.2-1.2 14.3 14.3 0 004.8-3.3 19.5 19.5 0 003.3-5.3h.3a4.5 4.5 0 003.1-1.1l.4-.3zm-18.5-2.6h-2.5v2.5h2.5zm3 0h-2.5v2.5h2.5zm3 0h-2.5v2.5h2.5zm-6-3h-2.5v2.5h2.5zm3 0h-2.5v2.5h2.5zm3 0h-2.5v2.5h2.5zm3 0h-2.5v2.5h2.5zm-9-3h-2.5v2.5h2.5zm3 0h-2.5v2.5h2.5z" fill="#2496ed"/>
    </svg>
  ),
  mongodb: () => (
    <svg viewBox="0 0 32 32" className="w-5 h-5">
      <path d="M16 2C9.373 2 4 7.373 4 14c0 4.418 2.239 8.313 5.636 10.636L16 30l6.364-5.364C25.761 22.313 28 18.418 28 14c0-6.627-5.373-12-12-12zm0 22.5l-4-3.5C9.343 19.25 8 16.75 8 14c0-4.418 3.582-8 8-8s8 3.582 8 8c0 2.75-1.343 5.25-3.5 6.75L16 24.5z" fill="#4db33d"/>
      <path d="M16 6v18l-1-1.5V7.5L16 6z" fill="#3fa037"/>
    </svg>
  ),
  aws: () => (
    <svg viewBox="0 0 32 32" className="w-5 h-5">
      <path d="M9.465 17.065l-1.9 4.27H5.9l6.2-14h1.8l6.2 14h-1.7l-1.9-4.27H9.465zm5.47-1.4l-2.4-5.4-2.4 5.4h4.8zm8.565 5.67l-4.5-12h1.7l3.6 10.2 3.6-10.2h1.7l-4.5 12h-1.6z" fill="#ff9900"/>
      <path d="M4 24.5C7.5 27 11.6 28.5 16 28.5s8.5-1.5 12-4" fill="none" stroke="#ff9900" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M26.5 23l2 1.5-2 1" fill="none" stroke="#ff9900" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  figma: () => (
    <svg viewBox="0 0 32 32" className="w-5 h-5">
      <path d="M10 28a4 4 0 004-4v-4h-4a4 4 0 000 8z" fill="#0acf83"/>
      <path d="M6 16a4 4 0 014-4h4v8h-4a4 4 0 01-4-4z" fill="#a259ff"/>
      <path d="M6 8a4 4 0 014-4h4v8h-4a4 4 0 01-4-4z" fill="#f24e1e"/>
      <path d="M14 4h4a4 4 0 010 8h-4V4z" fill="#ff7262"/>
      <path d="M22 16a4 4 0 11-8 0 4 4 0 018 0z" fill="#1abcfe"/>
    </svg>
  ),
};

// Normalize key for icon lookup
function normalizeKey(name) {
  const k = name.toLowerCase().trim();
  if (k === 'js') return 'javascript';
  if (k === 'ts') return 'typescript';
  if (k === 'node' || k === 'node.js') return 'nodejs';
  if (k === 'next' || k === 'next.js') return 'nextjs';
  return k;
}

export function getSkillSvgIcon(name) {
  const key = normalizeKey(name);
  return SKILL_SVG_ICONS[key] || null;
}

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
