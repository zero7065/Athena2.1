/*
 * AcademiaIQ — Education Seed Data
 *
 * Default RSS feeds, syllabus templates, tool registry, and course catalog
 * used to make the platform "ready to use" out of the box.
 */

export interface EduRssFeed {
  id: string;
  title: string;
  url: string;
  category: string;
  description: string;
  language: string;
  active: boolean;
}

export interface SyllabusTemplate {
  id: string;
  course: string;
  subject: string;
  title: string;
  instructor: string;
  objectives: string[];
  modules: Array<{ title: string; topics: string[]; resources?: string[] }>;
  level: 'undergraduate' | 'graduate' | 'foundation';
}

export interface DefaultTool {
  id: string;
  title: string;
  desc: string;
  icon: string;
  resource:
    | 'dashboard'
    | 'ai'
    | 'tasks'
    | 'study'
    | 'games'
    | 'social'
    | 'content'
    | 'syllabus'
    | 'studyplan'
    | 'rss'
    | 'lecturer'
    | 'admin';
  defaultVisible: boolean;
  editable: boolean;
  requiredRole: 'student' | 'lecturer' | 'admin' | 'management';
}

export const EDU_RSS_FEEDS: EduRssFeed[] = [
  {
    id: 'rss_001',
    title: 'EdSurge — Higher Ed',
    url: 'https://www.edsurge.com/rss',
    category: 'Higher Education',
    description: 'Latest news on education technology and digital learning.',
    language: 'en',
    active: true,
  },
  {
    id: 'rss_002',
    title: 'Inside Higher Ed',
    url: 'https://www.insidehighered.com/rss',
    category: 'Higher Education',
    description: 'News, jobs, and resources for higher education professionals.',
    language: 'en',
    active: true,
  },
  {
    id: 'rss_003',
    title: 'The Chronicle of Higher Education',
    url: 'https://www.chronicle.com/section/RSS/9',
    category: 'Higher Education',
    description: 'Independent news and analysis on colleges and universities.',
    language: 'en',
    active: true,
  },
  {
    id: 'rss_004',
    title: 'EDUCAUSE Review',
    url: 'https://www.educause.edu/feed',
    category: 'IT in Education',
    description: 'IT leadership and strategy for higher education.',
    language: 'en',
    active: true,
  },
  {
    id: 'rss_005',
    title: "Times Higher Education — Global",
    url: 'https://www.timeshighereducation.com/rss',
    category: 'World Universities',
    description: 'Global university rankings and sector news.',
    language: 'en',
    active: true,
  },
  {
    id: 'rss_006',
    title: 'UNESCO Education',
    url: 'https://www.unesco.org/en/education/rss',
    category: 'Global Policy',
    description: 'UNESCO education initiatives and global policy updates.',
    language: 'en',
    active: true,
  },
  {
    id: 'rss_007',
    title: 'eLearning Industry',
    url: 'https://elearningindustry.com/feed',
    category: 'EdTech & Tools',
    description: 'Trends, tools, and best practices for digital learning.',
    language: 'en',
    active: true,
  },
  {
    id: 'rss_008',
    title: 'EdTech Magazine — Higher Ed',
    url: 'https://edtechmagazine.com/higher/rss.xml',
    category: 'EdTech & Tools',
    description: 'Technology strategy and innovation in higher education.',
    language: 'en',
    active: true,
  },
  {
    id: 'rss_009',
    title: 'Campus Technology',
    url: 'https://campustechnology.com/rss-feeds/all-articles.aspx',
    category: 'EdTech & Tools',
    description: 'Campus IT news, tools, and technology leadership.',
    language: 'en',
    active: true,
  },
  {
    id: 'rss_010',
    title: 'Edutopia',
    url: 'https://www.edutopia.org/rss.xml',
    category: 'Teaching & Learning',
    description: 'Evidence-based teaching strategies and classroom practice.',
    language: 'en',
    active: true,
  },
  {
    id: 'rss_011',
    title: 'TeachThought',
    url: 'https://www.teachthought.com/feed/',
    category: 'Teaching & Learning',
    description: 'Innovation in teaching, learning, and curriculum design.',
    language: 'en',
    active: true,
  },
  {
    id: 'rss_012',
    title: 'Faculty Focus',
    url: 'https://www.facultyfocus.com/feed/',
    category: 'Teaching & Learning',
    description: 'Practical advice for college and university faculty.',
    language: 'en',
    active: true,
  },
  {
    id: 'rss_013',
    title: 'TED-Ed Blog',
    url: 'https://blog.ed.ted.com/feed/',
    category: 'Teaching & Learning',
    description: 'Lessons worth sharing from the TED-Ed team.',
    language: 'en',
    active: true,
  },
  {
    id: 'rss_014',
    title: 'The Learning Scientists',
    url: 'https://www.learningscientists.org/blog?format=rss',
    category: 'Learning Science',
    description: 'Research-backed strategies for effective learning.',
    language: 'en',
    active: true,
  },
  {
    id: 'rss_015',
    title: 'MindShift — KQED',
    url: 'https://ww2.kqed.org/mindshift/feed/',
    category: 'Learning Science',
    description: 'How learning is evolving in a changing world.',
    language: 'en',
    active: true,
  },
  {
    id: 'rss_016',
    title: 'ScienceDaily — Educational Psychology',
    url: 'https://www.sciencedaily.com/rss/educational_psychology.xml',
    category: 'Learning Science',
    description: 'Latest research in educational psychology and learning.',
    language: 'en',
    active: true,
  },
  {
    id: 'rss_017',
    title: 'Education Week',
    url: 'https://www.edweek.org/rss',
    category: 'K-12 & Policy',
    description: 'K-12 education news, policy, and practice.',
    language: 'en',
    active: true,
  },
  {
    id: 'rss_018',
    title: 'The Hechinger Report',
    url: 'https://hechingerreport.org/feed/',
    category: 'K-12 & Policy',
    description: 'In-depth journalism on inequality and innovation in education.',
    language: 'en',
    active: true,
  },
  {
    id: 'rss_019',
    title: 'eSchool News',
    url: 'https://www.eschoolnews.com/feed/',
    category: 'K-12 & Policy',
    description: 'EdTech news and insights for K-12 educators.',
    language: 'en',
    active: true,
  },
  {
    id: 'rss_020',
    title: 'Higher Ed Dive',
    url: 'https://www.highereddive.com/feeds/news/',
    category: 'Higher Education',
    description: 'Daily news and analysis for higher education leaders.',
    language: 'en',
    active: true,
  },
  {
    id: 'rss_021',
    title: 'University World News',
    url: 'https://www.universityworldnews.com/rss.php',
    category: 'World Universities',
    description: 'Global higher education news and intelligence.',
    language: 'en',
    active: true,
  },
  {
    id: 'rss_022',
    title: 'Open Culture',
    url: 'https://www.openculture.com/feed',
    category: 'Open & Online Learning',
    description: 'Free cultural and educational media from around the web.',
    language: 'en',
    active: true,
  },
  {
    id: 'rss_023',
    title: 'MIT OpenCourseWare',
    url: 'https://ocw.mit.edu/rss',
    category: 'Open & Online Learning',
    description: 'Free course materials from MIT for self-directed learning.',
    language: 'en',
    active: true,
  },
  {
    id: 'rss_024',
    title: 'Coursera Blog',
    url: 'https://blog.coursera.org/feed/',
    category: 'Open & Online Learning',
    description: 'Insights, courses, and trends in online learning.',
    language: 'en',
    active: true,
  },
  {
    id: 'rss_025',
    title: 'edX Blog',
    url: 'https://blog.edx.org/feed/',
    category: 'Open & Online Learning',
    description: 'News and resources from the edX learning platform.',
    language: 'en',
    active: true,
  },
  {
    id: 'rss_026',
    title: 'Khan Academy Blog',
    url: 'https://blog.khanacademy.org/feed/',
    category: 'Open & Online Learning',
    description: 'Free world-class education for anyone, anywhere.',
    language: 'en',
    active: true,
  },
];

export const SYLLABUS_TEMPLATES: SyllabusTemplate[] = [
  {
    id: 'syllabus_template_001',
    course: 'CS101',
    subject: 'Computer Science',
    title: 'Introduction to Programming',
    instructor: 'AcademiaIQ Staff',
    objectives: [
      'Understand fundamental programming concepts using JavaScript/TypeScript.',
      'Build interactive web pages with HTML, CSS, and React.',
      'Apply version control with Git and GitHub.',
      'Debug and test code using modern tooling.',
    ],
    modules: [
      { title: 'Module 1 — Programming Basics', topics: ['Variables', 'Data Types', 'Operators', 'Control Flow'], resources: ['res_001'] },
      { title: 'Module 2 — Functions & Scope', topics: ['Function Declarations', 'Arrow Functions', 'Closures', 'Scope'], resources: [] },
      { title: 'Module 3 — Data Structures', topics: ['Arrays', 'Objects', 'Maps', 'Sets'], resources: [] },
      { title: 'Module 4 — Introduction to React', topics: ['Components', 'Props', 'State', 'Event Handling'], resources: [] },
    ],
    level: 'undergraduate',
  },
  {
    id: 'syllabus_template_002',
    course: 'ENG101',
    subject: 'English',
    title: 'Academic Writing & Composition',
    instructor: 'AcademiaIQ Staff',
    objectives: [
      'Write clear, well-structured academic essays.',
      'Critically analyze texts and construct arguments.',
      'Apply citation styles (APA, MLA, Chicago).',
      'Edit and proofread for grammar and style.',
    ],
    modules: [
      { title: 'Module 1 — Essay Structure', topics: ['Thesis Statements', 'Introductions', 'Body Paragraphs', 'Conclusions'], resources: [] },
      { title: 'Module 2 — Research & Citation', topics: ['Finding Sources', 'APA Style', 'MLA Style', 'Avoiding Plagiarism'], resources: [] },
      { title: 'Module 3 — Critical Analysis', topics: ['Textual Analysis', 'Argument Mapping', 'Peer Review'], resources: [] },
    ],
    level: 'undergraduate',
  },
  {
    id: 'syllabus_template_003',
    course: 'MATH101',
    subject: 'Mathematics',
    title: 'Calculus I',
    instructor: 'AcademiaIQ Staff',
    objectives: [
      'Compute limits and derivatives of functions.',
      'Apply differentiation to optimization problems.',
      'Understand definite and indefinite integrals.',
      'Model real-world phenomena with calculus.',
    ],
    modules: [
      { title: 'Module 1 — Limits & Continuity', topics: ['Limits', 'Continuity', 'Intermediate Value Theorem'], resources: [] },
      { title: 'Module 2 — Derivatives', topics: ['Power Rule', 'Product Rule', 'Chain Rule', 'Implicit Differentiation'], resources: [] },
      { title: 'Module 3 — Applications', topics: ['Related Rates', 'Optimization', 'Curve Sketching'], resources: [] },
    ],
    level: 'undergraduate',
  },
];

export const DEFAULT_TOOLS: DefaultTool[] = [
  { id: 'tool_dashboard', title: 'Dashboard', desc: 'Personal academic overview with widgets and quick stats.', icon: 'LayoutDashboard', resource: 'dashboard', defaultVisible: true, editable: true, requiredRole: 'student' },
  { id: 'tool_ai', title: 'AI Assistant', desc: '24/7 AI tutor for study questions, explanations, and planning.', icon: 'Sparkles', resource: 'ai', defaultVisible: true, editable: true, requiredRole: 'student' },
  { id: 'tool_tasks', title: 'Task Board', desc: 'Kanban-style task management by subject and priority.', icon: 'CheckSquare', resource: 'tasks', defaultVisible: true, editable: true, requiredRole: 'student' },
  { id: 'tool_study', title: 'Study Tracker', desc: 'Pomodoro timer and session logging for focused study.', icon: 'Timer', resource: 'study', defaultVisible: true, editable: true, requiredRole: 'student' },
  { id: 'tool_social', title: 'Friends & Rooms', desc: 'Connect classmates, direct message, and study rooms.', icon: 'Users', resource: 'social', defaultVisible: true, editable: true, requiredRole: 'student' },
  { id: 'tool_content', title: 'Content Library', desc: 'Notes, PDFs, links, videos, and slides organized by subject.', icon: 'BookOpen', resource: 'content', defaultVisible: true, editable: false, requiredRole: 'student' },
  { id: 'tool_syllabus', title: 'Syllabus', desc: 'Course syllabi with objectives, modules, and resources.', icon: 'GraduationCap', resource: 'syllabus', defaultVisible: true, editable: false, requiredRole: 'student' },
  { id: 'tool_studyplan', title: 'Study Plan', desc: 'AI-generated study plans from syllabus and deadlines.', icon: 'Target', resource: 'studyplan', defaultVisible: true, editable: true, requiredRole: 'student' },
  { id: 'tool_rss', title: 'Education RSS', desc: 'Curated education news and industry updates.', icon: 'Rss', resource: 'rss', defaultVisible: true, editable: true, requiredRole: 'student' },
  { id: 'tool_lecturer', title: 'Lecturer Portal', desc: 'Grade submissions, manage assignments, and run study rooms.', icon: 'BookOpen', resource: 'lecturer', defaultVisible: false, editable: false, requiredRole: 'lecturer' },
  { id: 'tool_admin', title: 'Admin Panel', desc: 'User management, audit logs, and system configuration.', icon: 'ShieldCheck', resource: 'admin', defaultVisible: false, editable: false, requiredRole: 'admin' },
];

export const DEFAULT_COURSES = [
  { code: 'CS101', title: 'Introduction to Programming', department: 'Computer Science', credits: 3, year: 1 },
  { code: 'CS202', title: 'Data Structures & Algorithms', department: 'Computer Science', credits: 4, year: 2 },
  { code: 'MATH201', title: 'Discrete Mathematics', department: 'Mathematics', credits: 3, year: 2 },
  { code: 'ENG101', title: 'Academic Writing', department: 'English', credits: 3, year: 1 },
  { code: 'PHY101', title: 'General Physics I', department: 'Physics', credits: 4, year: 1 },
];
