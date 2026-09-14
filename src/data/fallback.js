import { asset } from '../utils/assetPath';
import projectsData from './Projects.json';
import projectsData2 from './Projects2.json';

// Fallback lokal bila Supabase belum diset / offline.
// Diambil dari konten hardcoded yang ada saat ini.

export const fallbackProfile = {
  full_name: 'Fahril Sidik Alfarizi',
  tagline: 'AI/ML Engineer | AI Automation | Data Scientist | Frontend Developer',
  bio: 'I am a AI Engineer with a focus on Machine Learning and Deep Learning. I am a Computer Science/Information Engineering graduate from the Garut Institute of Technology and a graduate of Bangkit Academy 2024 Batch 1 (Machine Learning path). I have experience building deep learning models using TensorFlow, from data processing to implementation, and am interested in creating innovative data-driven solutions.',
  photo_url: asset('assets/profile.png'),
  resume_url: '',
  credential_url:
    'https://www.notion.so/Licence-Credential-Fahril-Sidik-Alfarizi-6db2fb315d884612aef994a956ece0c5?source=copy_link',
  socials: {
    linkedin: 'https://www.linkedin.com/in/fahril-sidik-alfarizi/',
    instagram: 'https://www.instagram.com/fhrlalfrz_?igsh=bGMxcG1yNWxjdjdu',
    github: 'https://github.com/fahrilalfariziii',
  },
  email: 'fahrilsidik207@gmail.com',
  location: 'West Java, Indonesia',
};

export const fallbackEducation = [
  {
    id: 'fallback-edu-1',
    school: 'Garut Institute of Technology',
    major: 'Computer Science/Informatics Engineering',
    start_year: '2021',
    end_year: '2025',
    sort_order: 0,
  },
];

export const fallbackExperiences = [
  {
    id: 'fallback-exp-1',
    type: 'works',
    title: 'Web Developer Intern',
    company: 'Dinas Perindustrian Perdagangan Kab. Garut',
    date_text: 'August - September 2024',
    bullets: [
      'Added a Food Price Information (Bapokting) feature to display price conditions in each regional market in Garut Regency.',
      'Added access rights to accounts that log into the admin system.',
      'This development uses PHP with the CodeIgniter 2 framework and a MySQL database.',
    ],
    link_url: 'http://bapokting.disperindag.garutkab.go.id/Bapokting',
    sort_order: 0,
  },
  {
    id: 'fallback-exp-2',
    type: 'professional',
    title: 'Machine Learning Specialization',
    company: 'Bangkit Academy by Google GoTo Tokopedia Traveloka',
    date_text: 'February - June 2024',
    bullets: [
      'Completed an intensive 900+ hour program focused on Machine Learning, including Deep Learning, Natural Language Processing, and TensorFlow.',
      'Designed and trained an image classification model using the MobileNetv2 CNN architecture with TensorFlow and Keras.',
      'Converted and optimized the trained model to TensorFlow Lite (TFLite) format for implementation on mobile devices.',
      'Collaborated with the Cloud Computing and Mobile Development teams for model integration via APIs.',
    ],
    link_url: '',
    sort_order: 0,
  },
  {
    id: 'fallback-exp-3',
    type: 'professional',
    title: 'Information Technology Staff',
    company: 'Himpunan Mahasiswa Teknik Informatika ITG',
    date_text: '2021 - 2024',
    bullets: [
      'Contributed to the development and maintenance of the Himpunan internal website using React.js.',
      'Held Machine Learning training for new students.',
    ],
    link_url: '',
    sort_order: 1,
  },
];

export const fallbackSkills = [
  { id: 'fallback-sk-1', name: 'Python', logo_url: asset('assets/python_logo.svg'), level: 90, sort_order: 0 },
  { id: 'fallback-sk-2', name: 'HTML', logo_url: asset('assets/html_logo.svg'), level: 70, sort_order: 1 },
  { id: 'fallback-sk-3', name: 'CSS', logo_url: asset('assets/css_logo.svg'), level: 70, sort_order: 2 },
  { id: 'fallback-sk-4', name: 'JavaScript', logo_url: asset('assets/js_logo.svg'), level: 80, sort_order: 3 },
  { id: 'fallback-sk-5', name: 'React', logo_url: asset('assets/react.svg'), level: 78, sort_order: 4 },
  { id: 'fallback-sk-6', name: 'PHP', logo_url: asset('assets/php_logo.svg'), level: 70, sort_order: 5 },
  { id: 'fallback-sk-7', name: 'MySQL', logo_url: asset('assets/mysql_logo.svg'), level: 72, sort_order: 6 },
  { id: 'fallback-sk-8', name: 'n8n', logo_url: asset('assets/n8n-color.svg'), level: 75, sort_order: 7 },
  { id: 'fallback-sk-9', name: 'TensorFlow', logo_url: asset('assets/tensorflow_logo.svg'), level: 88, sort_order: 8 },
  { id: 'fallback-sk-10', name: 'PyTorch', logo_url: asset('assets/pytorch_logo.svg'), level: 75, sort_order: 9 },
  { id: 'fallback-sk-11', name: 'Hugging Face', logo_url: asset('assets/hf-logo.svg'), level: 70, sort_order: 10 },
  { id: 'fallback-sk-12', name: 'OpenCV', logo_url: asset('assets/opencv.svg'), level: 70, sort_order: 11 },
  { id: 'fallback-sk-13', name: 'NumPy', logo_url: asset('assets/numpy.svg'), level: 80, sort_order: 12 },
  { id: 'fallback-sk-14', name: 'Git', logo_url: asset('assets/git_logo.svg'), level: 75, sort_order: 13 },
  { id: 'fallback-sk-15', name: 'Docker', logo_url: asset('assets/docker.svg'), level: 65, sort_order: 14 },
  { id: 'fallback-sk-16', name: 'Google Cloud', logo_url: asset('assets/google-cloud.svg'), level: 65, sort_order: 15 },
];

function normalizeProject(raw, fallbackCategory = 'ML') {
  return {
    id: raw.id ?? raw.title,
    title: raw.title ?? '',
    description: raw.description ?? '',
    technologies: Array.isArray(raw.technologies) ? raw.technologies : [],
    category: raw.category ?? raw.categories ?? fallbackCategory,
    year_text: raw.year_text ?? raw.year ?? '',
    web_url: raw.web_url ?? raw.webURL ?? '',
    repo_url: raw.repo_url ?? raw.repoUrl ?? '',
    sort_order: raw.sort_order ?? 0,
    is_visible: raw.is_visible ?? true,
  };
}

function localProjectsMerged() {
  // Gabungkan 2 JSON lama TANPA menimpa key yang sama (perbaiki bug spread).
  const map = new Map();
  const pushAll = (obj) => {
    Object.entries(obj || {}).forEach(([key, val]) => {
      const mapKey = map.has(key) ? `${key}-${Math.random().toString(36).slice(2, 7)}` : key;
      map.set(mapKey, normalizeProject({ ...val, id: mapKey }));
    });
  };
  pushAll(projectsData);
  pushAll(projectsData2);
  return Array.from(map.values());
}

export const fallbackProjects = localProjectsMerged();

export const fallbackSiteSettings = {
  formspree_id: 'xeopjjeg',
  footer_text: '© 2025 | Fahril Sidik Alfarizi',
};
