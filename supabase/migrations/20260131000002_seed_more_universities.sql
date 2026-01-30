-- Seed additional universities (USA, UK, Europe, Asia, Kazakhstan)

INSERT INTO public.universities_directory (
  name, country, city, website, description, logo_url,
  min_gpa, min_rating, programs, 
  type, tags, tuition_min, tuition_max, currency, has_scholarships, languages,
  grants_info, scholarships_info
) VALUES 
-- USA
(
  'Yale University', 'USA', 'New Haven', 'https://www.yale.edu',
  'Частный исследовательский университет, член Лиги плюща. Известен своими программами по праву и искусству.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Yale_University_Shield_1.svg/1200px-Yale_University_Shield_1.svg.png',
  3.8, 96,
  '[{"name": "Law", "degree": "JD"}, {"name": "Drama", "degree": "MFA"}]'::jsonb,
  'Private', ARRAY['Law', 'Arts', 'Humanities'], 60000, 65000, 'USD', true, ARRAY['English'],
  'Need-blind admission for all applicants.', 'Yale Financial Aid'
),
(
  'Columbia University', 'USA', 'New York', 'https://www.columbia.edu',
  'Университет в Нью-Йорке, известен своей школой журналистики и бизнес-школой.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Columbia_University_Shield.svg/1200px-Columbia_University_Shield.svg.png',
  3.7, 95,
  '[{"name": "Journalism", "degree": "Master"}, {"name": "Business", "degree": "MBA"}]'::jsonb,
  'Private', ARRAY['Business', 'Arts', 'Social Sciences'], 62000, 68000, 'USD', true, ARRAY['English'],
  'Полная финансовая поддержка для нуждающихся.', 'Columbia Grant'
),
(
  'Princeton University', 'USA', 'Princeton', 'https://www.princeton.edu',
  'Фокус на бакалавриате и исследованиях. Сильные программы по математике и физике.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Princeton_University_shield.svg/1200px-Princeton_University_shield.svg.png',
  3.9, 97,
  '[{"name": "Mathematics", "degree": "PhD"}, {"name": "Physics", "degree": "Bachelor"}]'::jsonb,
  'Private', ARRAY['Science', 'Mathematics'], 58000, 62000, 'USD', true, ARRAY['English'],
  'Одна из самых щедрых программ финансовой помощи.', 'Princeton Aid'
),
-- UK
(
  'University of Cambridge', 'UK', 'Cambridge', 'https://www.cam.ac.uk',
  'Один из старейших и престижнейших университетов мира. Силен в науках и технологиях.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/University_of_Cambridge_Coat_of_Arms_Flat.svg/1200px-University_of_Cambridge_Coat_of_Arms_Flat.svg.png',
  3.8, 98,
  '[{"name": "Mathematics", "degree": "Bachelor"}, {"name": "Engineering", "degree": "Bachelor"}]'::jsonb,
  'Public', ARRAY['Science', 'Engineering', 'Mathematics'], 35000, 45000, 'GBP', true, ARRAY['English'],
  'Gates Cambridge Scholarship.', 'Cambridge Trust'
),
(
  'Imperial College London', 'UK', 'London', 'https://www.imperial.ac.uk',
  'Специализируется исключительно на науке, инженерии, медицине и бизнесе.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Imperial_College_London_new_logo.png/1200px-Imperial_College_London_new_logo.png',
  3.7, 94,
  '[{"name": "Medicine", "degree": "MBBS"}, {"name": "Computing", "degree": "Master"}]'::jsonb,
  'Public', ARRAY['Medicine', 'Engineering', 'IT'], 36000, 42000, 'GBP', true, ARRAY['English'],
  'President''s PhD Scholarships.', 'Imperial Bursary'
),
(
  'UCL (University College London)', 'UK', 'London', 'https://www.ucl.ac.uk',
  'Мультидисциплинарный университет в центре Лондона. Силен в архитектуре и образовании.',
  'https://upload.wikimedia.org/wikipedia/en/thumb/d/d1/University_College_London_logo.svg/1200px-University_College_London_logo.svg.png',
  3.6, 92,
  '[{"name": "Architecture", "degree": "Bachelor"}, {"name": "Education", "degree": "Master"}]'::jsonb,
  'Public', ARRAY['Architecture', 'Education', 'Social Sciences'], 28000, 38000, 'GBP', true, ARRAY['English'],
  'UCL Global Undergraduate Scholarship.', 'UCL Masters Bursary'
),
-- Europe
(
  'Delft University of Technology', 'Netherlands', 'Delft', 'https://www.tudelft.nl',
  'Крупнейший и старейший технический университет Нидерландов.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/TU_Delft_logo.svg/1200px-TU_Delft_logo.svg.png',
  3.4, 88,
  '[{"name": "Aerospace Engineering", "degree": "Bachelor"}, {"name": "Industrial Design", "degree": "Master"}]'::jsonb,
  'Public', ARRAY['Engineering', 'Design', 'IT'], 15000, 20000, 'EUR', true, ARRAY['English'],
  'Justus & Louise van Effen Excellence Scholarships.', 'Holland Scholarship'
),
(
  'Karolinska Institute', 'Sweden', 'Stockholm', 'https://ki.se',
  'Один из ведущих медицинских университетов мира. Присуждает Нобелевскую премию по медицине.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Karolinska_Institutet_logo.svg/1200px-Karolinska_Institutet_logo.svg.png',
  3.5, 93,
  '[{"name": "Biomedicine", "degree": "Bachelor"}, {"name": "Global Health", "degree": "Master"}]'::jsonb,
  'Public', ARRAY['Medicine', 'Science'], 18000, 22000, 'EUR', true, ARRAY['English'],
  'KI Global Master''s Scholarships.', 'Swedish Institute Scholarships'
),
-- Asia
(
  'Tsinghua University', 'China', 'Beijing', 'https://www.tsinghua.edu.cn',
  'Ведущий университет Китая. Лидер в инженерии и компьютерных науках.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Tsinghua_University_Logo.svg/1200px-Tsinghua_University_Logo.svg.png',
  3.6, 91,
  '[{"name": "Computer Science", "degree": "Bachelor"}, {"name": "Economics", "degree": "Master"}]'::jsonb,
  'Public', ARRAY['IT', 'Engineering', 'Economics'], 5000, 8000, 'USD', true, ARRAY['Chinese', 'English'],
  'Chinese Government Scholarship.', 'Tsinghua Scholarship'
),
(
  'University of Tokyo', 'Japan', 'Tokyo', 'https://www.u-tokyo.ac.jp',
  'Самый престижный университет Японии.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/The_University_of_Tokyo_Logo.svg/1200px-The_University_of_Tokyo_Logo.svg.png',
  3.5, 90,
  '[{"name": "Law", "degree": "Bachelor"}, {"name": "Physics", "degree": "PhD"}]'::jsonb,
  'Public', ARRAY['Law', 'Science', 'Engineering'], 5000, 6000, 'USD', true, ARRAY['Japanese', 'English'],
  'MEXT Scholarship.', 'University of Tokyo Fellowship'
),
-- Kazakhstan
(
  'Nazarbayev University', 'Kazakhstan', 'Astana', 'https://nu.edu.kz',
  'Исследовательский университет международного уровня в Астане.',
  'https://upload.wikimedia.org/wikipedia/en/thumb/0/0b/Nazarbayev_University_Logo.png/220px-Nazarbayev_University_Logo.png',
  3.3, 85,
  '[{"name": "Computer Science", "degree": "Bachelor"}, {"name": "Robotics", "degree": "Master"}]'::jsonb,
  'Public', ARRAY['IT', 'Engineering', 'Science'], 0, 0, 'KZT', true, ARRAY['English'],
  'Государственные гранты «Назарбаев Университет».', 'Abay Qunanbayuly Scholarship'
),
(
  'KIMEP University', 'Kazakhstan', 'Almaty', 'https://www.kimep.kz',
  'Ведущий университет в области бизнеса, права и социальных наук.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/KIMEP_University_Logo.png/220px-KIMEP_University_Logo.png',
  3.0, 75,
  '[{"name": "Finance", "degree": "Bachelor"}, {"name": "Marketing", "degree": "Bachelor"}]'::jsonb,
  'Private', ARRAY['Business', 'Social Sciences', 'Law'], 4000, 5000, 'USD', true, ARRAY['English'],
  'Стипендии за академические успехи.', 'Финансовая поддержка'
),
(
  'Kazakh-British Technical University (KBTU)', 'Kazakhstan', 'Almaty', 'https://kbtu.edu.kz',
  'Специализируется на технических науках, IT и нефтегазовом секторе.',
  'https://upload.wikimedia.org/wikipedia/ru/thumb/7/77/KBTU_Logo.png/200px-KBTU_Logo.png',
  3.1, 78,
  '[{"name": "Information Systems", "degree": "Bachelor"}, {"name": "Petroleum Engineering", "degree": "Bachelor"}]'::jsonb,
  'Public', ARRAY['IT', 'Engineering', 'Energy'], 3000, 4000, 'USD', true, ARRAY['English'],
  'Гранты КБТУ и компаний-партнеров (КазМунайГаз и др.).', 'Стипендии'
),
(
  'Satbayev University', 'Kazakhstan', 'Almaty', 'https://satbayev.university',
  'Старейший и один из самых престижных технических вузов Казахстана.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Satbayev_University_logo.png/220px-Satbayev_University_logo.png',
  2.8, 70,
  '[{"name": "Architecture", "degree": "Bachelor"}, {"name": "Geology", "degree": "Bachelor"}]'::jsonb,
  'Public', ARRAY['Engineering', 'Architecture', 'Science'], 2000, 3000, 'USD', true, ARRAY['Kazakh', 'Russian', 'English'],
  'Государственные образовательные гранты.', 'Ректорская стипендия'
),
(
  'Suleyman Demirel University (SDU)', 'Kazakhstan', 'Kaskelen', 'https://sdu.edu.kz',
  'Известен сильными программами по IT, филологии и педагогике.',
  'https://upload.wikimedia.org/wikipedia/en/thumb/6/64/Suleyman_Demirel_University_Logo.png/220px-Suleyman_Demirel_University_Logo.png',
  3.0, 72,
  '[{"name": "Computer Science", "degree": "Bachelor"}, {"name": "Law", "degree": "Bachelor"}]'::jsonb,
  'Private', ARRAY['IT', 'Education', 'Law'], 2500, 3500, 'USD', true, ARRAY['English', 'Kazakh'],
  'Внутренние гранты SDU.', 'Скидки за отличную учебу'
);
