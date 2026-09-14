// Seed data awal portfolio ke Supabase.
// Cara pakai:
//   1. Isi .env dengan VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (jangan pakai anon key)
//   2. npm run seed
// Service role key hanya untuk seeding lokal, JANGAN commit ke repo / pasang di Vercel.
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Butuh VITE_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

const projects1 = JSON.parse(readFileSync(new URL('../src/data/Projects.json', import.meta.url)));
const projects2 = JSON.parse(readFileSync(new URL('../src/data/Projects2.json', import.meta.url)));

function normalizeProjects() {
  const out = [];
  let order = 0;
  const push = (obj) => {
    for (const val of Object.values(obj)) {
      out.push({
        title: val.title,
        description: val.description || '',
        technologies: val.technologies || [],
        category: val.categories || val.category || 'ML',
        year_text: val.year || val.year_text || '',
        web_url: val.webURL || val.web_url || '',
        repo_url: val.repoUrl || val.repo_url || '',
        sort_order: order++,
        is_visible: true,
      });
    }
  };
  push(projects1);
  push(projects2);
  // Perbaiki salah label: Purchase Conversion (CatBoost) seharusnya ML bukan NLP
  return out.map((p) =>
    p.title.toLowerCase().includes('purchase conversion') ? { ...p, category: 'ML' } : p,
  );
}

async function main() {
  // Cek profile sudah ada?
  const { data: existingProfile } = await supabase.from('profile').select('id').limit(1).maybeSingle();
  if (!existingProfile) {
    console.log('NOTE: profile/site_settings sebaiknya sudah terisi dari supabase/schema.sql. Lewati seed profile.');
  }

  const { data: existingProjects } = await supabase.from('projects').select('id').limit(1);
  if (existingProjects?.length) {
    console.log('Tabel projects sudah berisi data, lewati seed projects agar tidak duplikat.');
  } else {
    const rows = normalizeProjects();
    const { error } = await supabase.from('projects').insert(rows);
    if (error) throw error;
    console.log(`Seeded ${rows.length} projects.`);
  }

  const { data: existingSkills } = await supabase.from('skills').select('id').limit(1);
  if (!existingSkills?.length) {
    const skills = [
      ['Python', 90, 0], ['HTML', 70, 1], ['CSS', 70, 2], ['JavaScript', 80, 3],
      ['React', 78, 4], ['PHP', 70, 5], ['MySQL', 72, 6], ['n8n', 75, 7],
      ['TensorFlow', 88, 8], ['PyTorch', 75, 9], ['Hugging Face', 70, 10],
      ['OpenCV', 70, 11], ['NumPy', 80, 12], ['Git', 75, 13],
      ['Docker', 65, 14], ['Google Cloud', 65, 15],
    ].map(([name, level, sort_order]) => ({ name, level, sort_order, logo_url: '' }));
    const { error } = await supabase.from('skills').insert(skills);
    if (error) throw error;
    console.log(`Seeded ${skills.length} skills (logo_url kosong, isi via CMS).`);
  } else {
    console.log('Tabel skills sudah berisi data, lewati.');
  }

  const { data: existingExp } = await supabase.from('experiences').select('id').limit(1);
  if (!existingExp?.length) {
    const experiences = [
      {
        type: 'works', title: 'Web Developer Intern',
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
        type: 'professional', title: 'Machine Learning Specialization',
        company: 'Bangkit Academy by Google GoTo Tokopedia Traveloka',
        date_text: 'February - June 2024',
        bullets: [
          'Completed an intensive 900+ hour program focused on Machine Learning, including Deep Learning, Natural Language Processing, and TensorFlow.',
          'Designed and trained an image classification model using the MobileNetv2 CNN architecture with TensorFlow and Keras.',
          'Converted and optimized the trained model to TensorFlow Lite (TFLite) format for implementation on mobile devices.',
          'Collaborated with the Cloud Computing and Mobile Development teams for model integration via APIs.',
        ],
        link_url: '',
        sort_order: 1,
      },
      {
        type: 'professional', title: 'Information Technology Staff',
        company: 'Himpunan Mahasiswa Teknik Informatika ITG',
        date_text: '2021 - 2024',
        bullets: [
          'Contributed to the development and maintenance of the Himpunan internal website using React.js.',
          'Held Machine Learning training for new students.',
        ],
        link_url: '',
        sort_order: 2,
      },
    ];
    const { error } = await supabase.from('experiences').insert(experiences);
    if (error) throw error;
    console.log(`Seeded ${experiences.length} experiences.`);
  } else {
    console.log('Tabel experiences sudah berisi data, lewati.');
  }

  const { data: existingEdu } = await supabase.from('education').select('id').limit(1);
  if (!existingEdu?.length) {
    const { error } = await supabase.from('education').insert({
      school: 'Garut Institute of Technology',
      major: 'Computer Science/Informatics Engineering',
      start_year: '2021',
      end_year: '2025',
      sort_order: 0,
    });
    if (error) throw error;
    console.log('Seeded 1 education.');
  } else {
    console.log('Tabel education sudah berisi data, lewati.');
  }

  console.log('Seed selesai.');
}

main().catch((e) => {
  console.error('Seed gagal:', e.message);
  process.exit(1);
});
