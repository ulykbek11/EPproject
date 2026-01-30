-- Seed Popular Global Universities (USA, UK, Canada, Australia, Europe, Asia)

INSERT INTO public.universities_directory (
  name, country, city, website, description, logo_url,
  min_gpa, min_rating, programs, 
  type, tags, tuition_min, tuition_max, currency, has_scholarships, languages,
  grants_info, scholarships_info
) VALUES 
-- USA
(
  'California Institute of Technology (Caltech)', 'USA', 'Pasadena', 'https://www.caltech.edu',
  'Всемирно известный научно-исследовательский институт. Лидер в физике и астрономии.',
  'https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/California_Institute_of_Technology_seal.svg/1200px-California_Institute_of_Technology_seal.svg.png',
  3.9, 98,
  '[{"name": "Physics", "degree": "PhD"}, {"name": "Chemistry", "degree": "Bachelor"}]'::jsonb,
  'Private', ARRAY['Science', 'Physics', 'Engineering'], 58000, 60000, 'USD', true, ARRAY['English'],
  'Полное покрытие финансовых нужд (Need-based).', 'Caltech Scholarships'
),
(
  'University of Pennsylvania (UPenn)', 'USA', 'Philadelphia', 'https://www.upenn.edu',
  'Член Лиги плюща. Дом знаменитой бизнес-школы Wharton.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/University_of_Pennsylvania_shield_with_banner.svg/1200px-University_of_Pennsylvania_shield_with_banner.svg.png',
  3.8, 96,
  '[{"name": "Finance", "degree": "Bachelor"}, {"name": "Nursing", "degree": "Bachelor"}]'::jsonb,
  'Private', ARRAY['Business', 'Medicine', 'Social Sciences'], 60000, 65000, 'USD', true, ARRAY['English'],
  'Grant-based aid packages (no loans).', 'Penn Grant'
),
(
  'University of Chicago', 'USA', 'Chicago', 'https://www.uchicago.edu',
  'Известен своей строгой академической программой и экономической школой.',
  'https://upload.wikimedia.org/wikipedia/en/thumb/7/79/University_of_Chicago_shield.svg/1200px-University_of_Chicago_shield.svg.png',
  3.8, 95,
  '[{"name": "Economics", "degree": "Bachelor"}, {"name": "Sociology", "degree": "PhD"}]'::jsonb,
  'Private', ARRAY['Economics', 'Science', 'Social Sciences'], 60000, 64000, 'USD', true, ARRAY['English'],
  'Odyssey Scholarship для студентов с низким доходом.', 'UChicago Aid'
),
(
  'Johns Hopkins University', 'USA', 'Baltimore', 'https://www.jhu.edu',
  'Первый исследовательский университет США. Мировой лидер в медицине.',
  'https://upload.wikimedia.org/wikipedia/en/thumb/0/09/Johns_Hopkins_University_Shield.svg/1200px-Johns_Hopkins_University_Shield.svg.png',
  3.8, 94,
  '[{"name": "Medicine", "degree": "MD"}, {"name": "Public Health", "degree": "Master"}]'::jsonb,
  'Private', ARRAY['Medicine', 'Science', 'Research'], 58000, 62000, 'USD', true, ARRAY['English'],
  'Need-blind admission.', 'Hopkins Grants'
),
(
  'Cornell University', 'USA', 'Ithaca', 'https://www.cornell.edu',
  'Член Лиги плюща. Уникальное сочетание частных и государственных колледжей.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Cornell_University_seal.svg/1200px-Cornell_University_seal.svg.png',
  3.7, 93,
  '[{"name": "Engineering", "degree": "Bachelor"}, {"name": "Hotel Administration", "degree": "Bachelor"}]'::jsonb,
  'Private', ARRAY['Engineering', 'Business', 'Agriculture'], 60000, 64000, 'USD', true, ARRAY['English'],
  'Cornell Grant.', 'Tata Scholarship'
),
(
  'University of California, Berkeley (UC Berkeley)', 'USA', 'Berkeley', 'https://www.berkeley.edu',
  'Лучший государственный университет США. Лидер в исследованиях и активизме.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Seal_of_University_of_California%2C_Berkeley.svg/1200px-Seal_of_University_of_California%2C_Berkeley.svg.png',
  3.7, 92,
  '[{"name": "Computer Science", "degree": "Bachelor"}, {"name": "Environmental Science", "degree": "Bachelor"}]'::jsonb,
  'Public', ARRAY['Science', 'IT', 'Social Sciences'], 44000, 48000, 'USD', true, ARRAY['English'],
  'Стипендии для резидентов и талантливых студентов.', 'Berkeley Undergraduate Scholarship'
),
(
  'University of California, Los Angeles (UCLA)', 'USA', 'Los Angeles', 'https://www.ucla.edu',
  'Самый популярный университет США по количеству заявок. Силен в искусстве и медицине.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/UCLA_Seal.svg/1200px-UCLA_Seal.svg.png',
  3.8, 93,
  '[{"name": "Film", "degree": "Bachelor"}, {"name": "Psychology", "degree": "Bachelor"}]'::jsonb,
  'Public', ARRAY['Arts', 'Medicine', 'Humanities'], 43000, 47000, 'USD', true, ARRAY['English'],
  'Regents Scholarship.', 'Alumni Scholarships'
),
(
  'New York University (NYU)', 'USA', 'New York', 'https://www.nyu.edu',
  'Крупнейший частный университет США. Кампусы по всему миру.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/NYU_Torch_Logo.png/200px-NYU_Torch_Logo.png',
  3.6, 90,
  '[{"name": "Business", "degree": "Bachelor"}, {"name": "Film", "degree": "Bachelor"}]'::jsonb,
  'Private', ARRAY['Business', 'Arts', 'Social Sciences'], 58000, 62000, 'USD', true, ARRAY['English'],
  'NYU Promise (покрытие для семей с низким доходом).', 'Merit Scholarships'
),

-- UK
(
  'London School of Economics (LSE)', 'UK', 'London', 'https://www.lse.ac.uk',
  'Мировой лидер в социальных науках, экономике и политике.',
  'https://upload.wikimedia.org/wikipedia/en/thumb/5/52/London_School_of_Economics_coat_of_arms.svg/1200px-London_School_of_Economics_coat_of_arms.svg.png',
  3.7, 92,
  '[{"name": "Economics", "degree": "Bachelor"}, {"name": "International Relations", "degree": "Master"}]'::jsonb,
  'Public', ARRAY['Economics', 'Politics', 'Social Sciences'], 24000, 28000, 'GBP', true, ARRAY['English'],
  'LSE Undergraduate Support Scheme.', 'Graduate Support Scheme'
),
(
  'University of Edinburgh', 'UK', 'Edinburgh', 'https://www.ed.ac.uk',
  'Один из древних университетов Шотландии. Сильные гуманитарные и научные программы.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/University_of_Edinburgh_Ceremonial_Coat_of_Arms.svg/1200px-University_of_Edinburgh_Ceremonial_Coat_of_Arms.svg.png',
  3.5, 88,
  '[{"name": "Informatics", "degree": "Bachelor"}, {"name": "Medicine", "degree": "MBChB"}]'::jsonb,
  'Public', ARRAY['Science', 'Medicine', 'Humanities'], 24000, 32000, 'GBP', true, ARRAY['English'],
  'Edinburgh Global Undergraduate Maths Scholarships.', 'Chevening Scholarships'
),
(
  'King''s College London', 'UK', 'London', 'https://www.kcl.ac.uk',
  'Один из ведущих вузов Лондона. Известен исследованиями в медицине и праве.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/King%27s_College_London_logo.svg/1200px-King%27s_College_London_logo.svg.png',
  3.5, 89,
  '[{"name": "Law", "degree": "Bachelor"}, {"name": "War Studies", "degree": "Bachelor"}]'::jsonb,
  'Public', ARRAY['Law', 'Medicine', 'Social Sciences'], 23000, 30000, 'GBP', true, ARRAY['English'],
  'King''s Living Bursary.', 'Global Health Scholarship'
),
(
  'University of Manchester', 'UK', 'Manchester', 'https://www.manchester.ac.uk',
  'Крупнейший университет Великобритании. Силен в инженерии и бизнесе.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/University_of_Manchester_Coat_of_Arms.svg/1200px-University_of_Manchester_Coat_of_Arms.svg.png',
  3.4, 85,
  '[{"name": "Materials Science", "degree": "Bachelor"}, {"name": "MBA", "degree": "Master"}]'::jsonb,
  'Public', ARRAY['Engineering', 'Business', 'Science'], 22000, 28000, 'GBP', true, ARRAY['English'],
  'Global Futures Scholarship.', 'Equity and Merit Scholarships'
),

-- Canada
(
  'McGill University', 'Canada', 'Montreal', 'https://www.mcgill.ca',
  'Один из самых престижных вузов Канады. Сильная медицина.',
  'https://upload.wikimedia.org/wikipedia/en/thumb/2/29/McGill_University_Coat_of_Arms.svg/1200px-McGill_University_Coat_of_Arms.svg.png',
  3.6, 90,
  '[{"name": "Medicine", "degree": "MD"}, {"name": "Law", "degree": "Bachelor"}]'::jsonb,
  'Public', ARRAY['Medicine', 'Law', 'Arts'], 20000, 40000, 'CAD', true, ARRAY['English', 'French'],
  'McGill Entrance Scholarships.', 'Major Entrance Scholarships'
),
(
  'University of British Columbia (UBC)', 'Canada', 'Vancouver', 'https://www.ubc.ca',
  'Глобальный центр исследований и обучения. Красивейший кампус.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/UBC_Coat_of_Arms.svg/1200px-UBC_Coat_of_Arms.svg.png',
  3.5, 88,
  '[{"name": "Forestry", "degree": "Bachelor"}, {"name": "International Relations", "degree": "Bachelor"}]'::jsonb,
  'Public', ARRAY['Science', 'Social Sciences', 'Environment'], 35000, 50000, 'CAD', true, ARRAY['English'],
  'International Major Entrance Scholarship.', 'Karen McKellin International Leader of Tomorrow Award'
),

-- Australia
(
  'University of Melbourne', 'Australia', 'Melbourne', 'https://www.unimelb.edu.au',
  'Ведущий университет Австралии. Широкий спектр программ.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/University_of_Melbourne_Coat_of_Arms.svg/1200px-University_of_Melbourne_Coat_of_Arms.svg.png',
  3.5, 90,
  '[{"name": "Biomedicine", "degree": "Bachelor"}, {"name": "Commerce", "degree": "Bachelor"}]'::jsonb,
  'Public', ARRAY['Medicine', 'Business', 'Arts'], 30000, 45000, 'AUD', true, ARRAY['English'],
  'Melbourne International Undergraduate Scholarship.', 'Graduate Research Scholarships'
),
(
  'University of Sydney', 'Australia', 'Sydney', 'https://www.sydney.edu.au',
  'Первый университет Австралии. Лидер в медицине и праве.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/University_of_Sydney_Coat_of_Arms.svg/1200px-University_of_Sydney_Coat_of_Arms.svg.png',
  3.4, 88,
  '[{"name": "Law", "degree": "Bachelor"}, {"name": "Veterinary Science", "degree": "Bachelor"}]'::jsonb,
  'Public', ARRAY['Law', 'Medicine', 'Science'], 32000, 48000, 'AUD', true, ARRAY['English'],
  'Vice-Chancellor''s International Scholarships.', 'Sydney Scholars Award'
),

-- Europe (Continental)
(
  'EPFL (École Polytechnique Fédérale de Lausanne)', 'Switzerland', 'Lausanne', 'https://www.epfl.ch',
  'Ведущий технический вуз Европы, аналог MIT во франкоязычной части.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/EPFL_Logo_Digital_RGB_Red.svg/1200px-EPFL_Logo_Digital_RGB_Red.svg.png',
  3.5, 91,
  '[{"name": "Robotics", "degree": "Master"}, {"name": "Data Science", "degree": "Master"}]'::jsonb,
  'Public', ARRAY['Engineering', 'IT', 'Science'], 1500, 2000, 'CHF', false, ARRAY['French', 'English'],
  'Низкая стоимость обучения.', 'Excellence Fellowships'
),
(
  'LMU Munich (Ludwig Maximilian University)', 'Germany', 'Munich', 'https://www.lmu.de',
  'Один из самых престижных университетов Германии. Сильная гуманитарная и научная база.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/LMU_Muenchen_Logo.svg/1200px-LMU_Muenchen_Logo.svg.png',
  3.4, 87,
  '[{"name": "Physics", "degree": "Master"}, {"name": "Psychology", "degree": "Bachelor"}]'::jsonb,
  'Public', ARRAY['Science', 'Humanities', 'Medicine'], 0, 300, 'EUR', true, ARRAY['German', 'English'],
  'Бесплатное обучение.', 'Deutschlandstipendium'
),
(
  'University of Amsterdam', 'Netherlands', 'Amsterdam', 'https://www.uva.nl',
  'Крупнейший вуз Нидерландов. Популярен среди международных студентов.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/UvA_Logo_English.svg/1200px-UvA_Logo_English.svg.png',
  3.3, 85,
  '[{"name": "Communication Science", "degree": "Bachelor"}, {"name": "Psychology", "degree": "Bachelor"}]'::jsonb,
  'Public', ARRAY['Social Sciences', 'Humanities', 'Science'], 10000, 15000, 'EUR', true, ARRAY['English'],
  'Amsterdam Merit Scholarship.', 'Holland Scholarship'
),

-- Asia
(
  'Nanyang Technological University (NTU)', 'Singapore', 'Singapore', 'https://www.ntu.edu.sg',
  'Быстрорастущий технологический университет. Красивый кампус.',
  'https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/NTU_seal.svg/1200px-NTU_seal.svg.png',
  3.6, 91,
  '[{"name": "Materials Science", "degree": "Bachelor"}, {"name": "Business", "degree": "Bachelor"}]'::jsonb,
  'Public', ARRAY['Engineering', 'Science', 'Business'], 18000, 25000, 'SGD', true, ARRAY['English'],
  'Nanyang Scholarship.', 'ASEAN Undergraduate Scholarship'
),
(
  'University of Hong Kong (HKU)', 'Hong Kong', 'Hong Kong', 'https://www.hku.hk',
  'Старейший вуз Гонконга. Мост между Востоком и Западом.',
  'https://upload.wikimedia.org/wikipedia/en/thumb/d/d0/HKU_Coat_of_Arms.svg/1200px-HKU_Coat_of_Arms.svg.png',
  3.5, 89,
  '[{"name": "Dentistry", "degree": "Bachelor"}, {"name": "Law", "degree": "Bachelor"}]'::jsonb,
  'Public', ARRAY['Medicine', 'Law', 'Business'], 140000, 170000, 'HKD', true, ARRAY['English'],
  'HKU Foundation Entrance Scholarships.', 'HeForShe Scholarship'
),
(
  'Peking University', 'China', 'Beijing', 'https://english.pku.edu.cn',
  'Ключевой национальный университет Китая. Гуманитарные и естественные науки.',
  'https://upload.wikimedia.org/wikipedia/en/thumb/d/d5/Peking_University_seal.svg/1200px-Peking_University_seal.svg.png',
  3.6, 92,
  '[{"name": "Chinese Literature", "degree": "Bachelor"}, {"name": "Physics", "degree": "PhD"}]'::jsonb,
  'Public', ARRAY['Humanities', 'Science', 'Arts'], 5000, 8000, 'USD', true, ARRAY['Chinese', 'English'],
  'Chinese Government Scholarship.', 'Beijing Government Scholarship'
),
(
  'Seoul National University (SNU)', 'South Korea', 'Seoul', 'https://en.snu.ac.kr',
  'Самый престижный университет Южной Кореи.',
  'https://upload.wikimedia.org/wikipedia/en/thumb/2/29/Seoul_National_University_Seal.svg/1200px-Seoul_National_University_Seal.svg.png',
  3.5, 90,
  '[{"name": "Engineering", "degree": "Bachelor"}, {"name": "Business", "degree": "MBA"}]'::jsonb,
  'Public', ARRAY['Engineering', 'Business', 'Science'], 4000, 6000, 'USD', true, ARRAY['Korean', 'English'],
  'KGSP (Global Korea Scholarship).', 'SNU Global Scholarship'
),
(
  'KAIST', 'South Korea', 'Daejeon', 'https://www.kaist.ac.kr',
  'Ведущий научно-технический вуз Кореи. Инновации и стартапы.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/KAIST_logo.svg/1200px-KAIST_logo.svg.png',
  3.6, 91,
  '[{"name": "Robotics", "degree": "Master"}, {"name": "AI", "degree": "Master"}]'::jsonb,
  'Public', ARRAY['IT', 'Engineering', 'Science'], 3000, 4000, 'USD', true, ARRAY['English'],
  'KAIST International Student Scholarship (Full tuition + allowance).', 'GKS'
);
