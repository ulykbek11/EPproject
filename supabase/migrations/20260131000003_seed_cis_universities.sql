-- Seed CIS Universities (Kazakhstan, Russia, Uzbekistan, Kyrgyzstan, Belarus)

INSERT INTO public.universities_directory (
  name, country, city, website, description, logo_url,
  min_gpa, min_rating, programs, 
  type, tags, tuition_min, tuition_max, currency, has_scholarships, languages,
  grants_info, scholarships_info
) VALUES 

-- KAZAKHSTAN (Additional)
(
  'Al-Farabi Kazakh National University (KazNU)', 'Kazakhstan', 'Almaty', 'https://www.kaznu.kz',
  'Ведущий многопрофильный университет Казахстана. Занимает высокие позиции в рейтинге QS.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/KazNU_Logo.png/220px-KazNU_Logo.png',
  3.2, 80,
  '[{"name": "International Relations", "degree": "Bachelor"}, {"name": "Biotechnology", "degree": "Master"}, {"name": "Law", "degree": "Bachelor"}]'::jsonb,
  'Public', ARRAY['Science', 'Humanities', 'Law', 'IT'], 1000, 2000, 'USD', true, ARRAY['Kazakh', 'Russian', 'English'],
  'Множество государственных образовательных грантов.', 'Ректорские гранты, стипендии фондов'
),
(
  'L.N. Gumilyov Eurasian National University (ENU)', 'Kazakhstan', 'Astana', 'https://enu.kz',
  'Один из лидеров высшего образования в Казахстане. Активно развивает международное сотрудничество.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/ENU_Logo.png/220px-ENU_Logo.png',
  3.1, 78,
  '[{"name": "Architecture", "degree": "Bachelor"}, {"name": "Nuclear Physics", "degree": "Master"}, {"name": "Tourism", "degree": "Bachelor"}]'::jsonb,
  'Public', ARRAY['Science', 'Architecture', 'Humanities'], 1000, 2000, 'USD', true, ARRAY['Kazakh', 'Russian', 'English'],
  'Государственные гранты и программы академической мобильности.', 'Стипендия «Евразия»'
),
(
  'Asfendiyarov Kazakh National Medical University (KazNMU)', 'Kazakhstan', 'Almaty', 'https://kaznmu.kz',
  'Старейший и крупнейший медицинский вуз страны. Кузница медицинских кадров.',
  'https://upload.wikimedia.org/wikipedia/ru/thumb/3/3d/KazNMU_logo.png/200px-KazNMU_logo.png',
  3.4, 82,
  '[{"name": "General Medicine", "degree": "MD"}, {"name": "Dentistry", "degree": "Bachelor"}, {"name": "Pharmacy", "degree": "Bachelor"}]'::jsonb,
  'Public', ARRAY['Medicine', 'Science'], 1500, 2500, 'USD', true, ARRAY['Kazakh', 'Russian', 'English'],
  'Гранты на медицинские специальности.', 'Стипендии Министерства здравоохранения'
),
(
  'Narxoz University', 'Kazakhstan', 'Almaty', 'https://narxoz.kz',
  'Ведущий экономический университет. Фокус на бизнесе, финансах и праве.',
  'https://upload.wikimedia.org/wikipedia/ru/thumb/9/91/Narxoz_University_Logo.png/220px-Narxoz_University_Logo.png',
  2.9, 70,
  '[{"name": "Finance", "degree": "Bachelor"}, {"name": "Accounting", "degree": "Bachelor"}, {"name": "Management", "degree": "Master"}]'::jsonb,
  'Private', ARRAY['Business', 'Economics', 'Law'], 2000, 3000, 'USD', true, ARRAY['Russian', 'Kazakh', 'English'],
  'Гранты Нархоза и партнеров (банков, аудиторских компаний).', 'Стипендии за успеваемость'
),
(
  'Almaty Management University (AlmaU)', 'Kazakhstan', 'Almaty', 'https://almau.edu.kz',
  'Первый бизнес-вуз в Казахстане. Известен своими MBA программами.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/AlmaU_logo.png/220px-AlmaU_logo.png',
  2.8, 72,
  '[{"name": "Entrepreneurship", "degree": "Bachelor"}, {"name": "Marketing", "degree": "Bachelor"}, {"name": "Business Admin", "degree": "MBA"}]'::jsonb,
  'Private', ARRAY['Business', 'Management', 'Marketing'], 3000, 5000, 'USD', true, ARRAY['Russian', 'English', 'Kazakh'],
  'Предпринимательские стипендии.', 'Скидки для талантливых студентов'
),
(
  'Astana IT University', 'Kazakhstan', 'Astana', 'https://astanait.edu.kz',
  'Современный IT-университет, готовящий специалистов для цифровой экономики.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Astana_IT_University_logo.png/220px-Astana_IT_University_logo.png',
  3.2, 80,
  '[{"name": "Software Engineering", "degree": "Bachelor"}, {"name": "Cybersecurity", "degree": "Bachelor"}, {"name": "Big Data Analysis", "degree": "Master"}]'::jsonb,
  'Public', ARRAY['IT', 'Engineering'], 2000, 3000, 'USD', true, ARRAY['English'],
  'Целевые гранты от IT-компаний и государства.', 'Стипендия «Digital Kazakhstan»'
),
(
  'Almaty University of Power Engineering and Telecommunications (AUES)', 'Kazakhstan', 'Almaty', 'https://aues.edu.kz',
  'Ведущий вуз в области энергетики, телекоммуникаций и IT.',
  'https://upload.wikimedia.org/wikipedia/ru/thumb/2/29/AUES_Logo.png/200px-AUES_Logo.png',
  3.0, 74,
  '[{"name": "Radio Engineering", "degree": "Bachelor"}, {"name": "Electric Power Engineering", "degree": "Bachelor"}, {"name": "Telecommunications", "degree": "Master"}]'::jsonb,
  'Public', ARRAY['Engineering', 'Energy', 'IT'], 1500, 2500, 'USD', true, ARRAY['Russian', 'Kazakh'],
  'Гранты Самрук-Энерго и KEGOC.', 'Стипендии энергетических компаний'
),
(
  'Turan University', 'Kazakhstan', 'Almaty', 'https://turan-edu.kz',
  'Крупный частный университет инновационно-предпринимательского типа.',
  'https://upload.wikimedia.org/wikipedia/ru/thumb/f/f9/Turan_University_Logo.png/200px-Turan_University_Logo.png',
  2.7, 68,
  '[{"name": "Psychology", "degree": "Bachelor"}, {"name": "Tourism", "degree": "Bachelor"}, {"name": "Film Direction", "degree": "Bachelor"}]'::jsonb,
  'Private', ARRAY['Humanities', 'Arts', 'Social Sciences'], 1500, 2500, 'USD', true, ARRAY['Russian', 'Kazakh'],
  'Гранты ректора университета Туран.', 'Творческие стипендии'
),
(
  'Karaganda Technical University', 'Kazakhstan', 'Karaganda', 'https://www.kstu.kz',
  'Один из ведущих технических вузов страны, базовый вуз Карметкомбината.',
  'https://upload.wikimedia.org/wikipedia/ru/thumb/5/5e/KSTU_Logo.png/200px-KSTU_Logo.png',
  2.8, 70,
  '[{"name": "Mining Engineering", "degree": "Bachelor"}, {"name": "Metallurgy", "degree": "Bachelor"}, {"name": "Automation", "degree": "Master"}]'::jsonb,
  'Public', ARRAY['Engineering', 'Science', 'Industry'], 1000, 1500, 'USD', true, ARRAY['Russian', 'Kazakh'],
  'Промышленные гранты и стипендии.', 'Поддержка от ArcelorMittal'
),
(
  'Kazakh National Agrarian Research University (KazNARU)', 'Kazakhstan', 'Almaty', 'https://www.kaznaru.edu.kz',
  'Ведущий аграрный вуз. Исследования в области сельского хозяйства и биотехнологий.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/KazNARU_Logo.png/200px-KazNARU_Logo.png',
  2.9, 71,
  '[{"name": "Agronomy", "degree": "Bachelor"}, {"name": "Veterinary Medicine", "degree": "Bachelor"}, {"name": "Food Safety", "degree": "Master"}]'::jsonb,
  'Public', ARRAY['Agriculture', 'Science', 'Veterinary'], 1000, 1500, 'USD', true, ARRAY['Kazakh', 'Russian'],
  'Гранты МСХ РК.', 'Сельские квоты и стипендии'
),

-- RUSSIA
(
  'Lomonosov Moscow State University (MSU)', 'Russia', 'Moscow', 'https://www.msu.ru',
  'Лучший университет России. Фундаментальное образование по всем направлениям.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/MSU_Logo.svg/1200px-MSU_Logo.svg.png',
  3.8, 90,
  '[{"name": "Mathematics", "degree": "Specialist"}, {"name": "Physics", "degree": "Bachelor"}, {"name": "Chemistry", "degree": "PhD"}]'::jsonb,
  'Public', ARRAY['Science', 'Humanities', 'Mathematics'], 5000, 7000, 'USD', true, ARRAY['Russian'],
  'Бюджетные места для граждан РФ и соотечественников.', 'Повышенные государственные стипендии'
),
(
  'HSE University (Higher School of Economics)', 'Russia', 'Moscow', 'https://www.hse.ru',
  'Ведущий вуз в области экономики, социальных наук и IT.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/HSE_University_logo.svg/1200px-HSE_University_logo.svg.png',
  3.7, 88,
  '[{"name": "Economics", "degree": "Bachelor"}, {"name": "Computer Science", "degree": "Bachelor"}, {"name": "Design", "degree": "Bachelor"}]'::jsonb,
  'Public', ARRAY['Economics', 'IT', 'Arts', 'Social Sciences'], 4000, 8000, 'USD', true, ARRAY['Russian', 'English'],
  'Гранты для иностранных студентов (до 100% покрытия).', 'Стипендии за победы в олимпиадах'
),
(
  'Moscow Institute of Physics and Technology (MIPT)', 'Russia', 'Moscow', 'https://mipt.ru',
  'Легендарный Физтех. Лидер в области физики, математики и компьютерных наук.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/MIPT_logo.svg/1200px-MIPT_logo.svg.png',
  3.9, 92,
  '[{"name": "Applied Physics", "degree": "Bachelor"}, {"name": "Applied Mathematics", "degree": "Master"}, {"name": "Computer Science", "degree": "Bachelor"}]'::jsonb,
  'Public', ARRAY['Science', 'IT', 'Physics'], 4500, 6000, 'USD', true, ARRAY['Russian', 'English'],
  'Система Физтеха. Гранты для талантливых физиков и математиков.', 'Стипендии от технологических компаний'
),
(
  'Bauman Moscow State Technical University', 'Russia', 'Moscow', 'https://bmstu.ru',
  'Старейший и крупнейший технический университет России.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Bauman_University_Logo.svg/1200px-Bauman_University_Logo.svg.png',
  3.5, 85,
  '[{"name": "Mechanical Engineering", "degree": "Specialist"}, {"name": "Rocket Science", "degree": "Specialist"}, {"name": "Informatics", "degree": "Bachelor"}]'::jsonb,
  'Public', ARRAY['Engineering', 'IT', 'Space'], 3000, 5000, 'USD', true, ARRAY['Russian'],
  'Целевое обучение от предприятий ВПК.', 'Стипендии Ученого совета'
),
(
  'Saint Petersburg State University (SPbU)', 'Russia', 'St. Petersburg', 'https://spbu.ru',
  'Старейший университет России. Сильные школы права, менеджмента и наук.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Spbu_logo.svg/1200px-Spbu_logo.svg.png',
  3.6, 87,
  '[{"name": "Law", "degree": "Bachelor"}, {"name": "Management", "degree": "Master"}, {"name": "Biology", "degree": "Bachelor"}]'::jsonb,
  'Public', ARRAY['Law', 'Business', 'Science'], 4000, 6000, 'USD', true, ARRAY['Russian', 'English'],
  'Гранты СПбГУ для иностранцев.', 'Стипендии Потанина и др.'
),
(
  'ITMO University', 'Russia', 'St. Petersburg', 'https://itmo.ru',
  'Национальный исследовательский университет. Лидер в IT, оптике и робототехнике.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/ITMO_University_logo_2016.svg/1200px-ITMO_University_logo_2016.svg.png',
  3.6, 89,
  '[{"name": "Software Engineering", "degree": "Bachelor"}, {"name": "Robotics", "degree": "Master"}, {"name": "Photonics", "degree": "PhD"}]'::jsonb,
  'Public', ARRAY['IT', 'Science', 'Engineering'], 3500, 5000, 'USD', true, ARRAY['Russian', 'English'],
  'ITMO.STARS - поступление по достижениям.', 'Стипендии для программистов (ICPC чемпионы)'
),

-- UZBEKISTAN
(
  'Westminster International University in Tashkent (WIUT)', 'Uzbekistan', 'Tashkent', 'https://www.wiut.uz',
  'Первый международный университет в Узбекистане. Партнер University of Westminster (UK).',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/WIUT_Logo.png/220px-WIUT_Logo.png',
  3.0, 78,
  '[{"name": "Business Management", "degree": "Bachelor"}, {"name": "Economics", "degree": "Bachelor"}, {"name": "Commercial Law", "degree": "Master"}]'::jsonb,
  'Private', ARRAY['Business', 'Economics', 'Law'], 3000, 4000, 'USD', true, ARRAY['English'],
  'WIUT Scholarship для одаренных студентов.', 'Скидки за академические успехи'
),
(
  'Inha University in Tashkent', 'Uzbekistan', 'Tashkent', 'https://inha.uz',
  'Филиал ведущего корейского университета. Специализация на IT и логистике.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Inha_University_Logo.svg/1200px-Inha_University_Logo.svg.png',
  3.1, 80,
  '[{"name": "Computer Science Engineering", "degree": "Bachelor"}, {"name": "Logistics", "degree": "Bachelor"}]'::jsonb,
  'Public', ARRAY['IT', 'Logistics', 'Engineering'], 3000, 3500, 'USD', true, ARRAY['English'],
  'Гранты учредителей (госкомпаний).', 'Стипендии ректора'
),
(
  'National University of Uzbekistan (NUU)', 'Uzbekistan', 'Tashkent', 'https://nuu.uz',
  'Старейший и крупнейший вуз Узбекистана.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/NUU_Logo.png/220px-NUU_Logo.png',
  3.0, 75,
  '[{"name": "Mathematics", "degree": "Bachelor"}, {"name": "History", "degree": "Bachelor"}]'::jsonb,
  'Public', ARRAY['Science', 'Humanities', 'Mathematics'], 1000, 1500, 'USD', true, ARRAY['Uzbek', 'Russian'],
  'Государственные гранты.', 'Стипендия Президента Узбекистана'
),

-- KYRGYZSTAN
(
  'American University of Central Asia (AUCA)', 'Kyrgyzstan', 'Bishkek', 'https://auca.kg',
  'Ведущий гуманитарный вуз региона. Аккредитация США (Bard College).',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/AUCA_Logo.png/220px-AUCA_Logo.png',
  3.3, 85,
  '[{"name": "Liberal Arts", "degree": "Bachelor"}, {"name": "Anthropology", "degree": "Bachelor"}, {"name": "Software Engineering", "degree": "Bachelor"}]'::jsonb,
  'Private', ARRAY['Humanities', 'Social Sciences', 'IT'], 5000, 7000, 'USD', true, ARRAY['English'],
  'Щедрая программа финансовой помощи (Need-based).', 'US Government Scholarships'
),
(
  'Kyrgyz-Russian Slavic University (KRSU)', 'Kyrgyzstan', 'Bishkek', 'https://krsu.edu.kg',
  'Межгосударственный университет. Дипломы кыргызского и российского образца.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/KRSU_Logo.png/220px-KRSU_Logo.png',
  2.9, 72,
  '[{"name": "Medicine", "degree": "MD"}, {"name": "International Relations", "degree": "Bachelor"}]'::jsonb,
  'Public', ARRAY['Medicine', 'Humanities', 'Science'], 1000, 1500, 'USD', true, ARRAY['Russian'],
  'Бюджетные места РФ и КР.', 'Стипендии'
);
