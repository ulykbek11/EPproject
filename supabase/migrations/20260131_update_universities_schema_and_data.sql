-- Add new columns for filtering
ALTER TABLE public.universities_directory 
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('Public', 'Private')),
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tuition_min INTEGER,
ADD COLUMN IF NOT EXISTS tuition_max INTEGER,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS has_scholarships BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}';

-- Clear existing data to avoid conflicts and ensure clean state
TRUNCATE TABLE public.universities_directory;

-- Insert fresh data with all fields
INSERT INTO public.universities_directory (
  name, country, city, website, description, logo_url,
  min_gpa, min_rating, programs, 
  type, tags, tuition_min, tuition_max, currency, has_scholarships, languages,
  grants_info, scholarships_info
) VALUES 
(
  'Massachusetts Institute of Technology (MIT)', 'USA', 'Cambridge', 'https://web.mit.edu',
  'Ведущий мировой технический университет. Известен инновациями в робототехнике и ИИ.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/1200px-MIT_logo.svg.png',
  3.9, 98,
  '[{"name": "Computer Science", "degree": "Bachelor"}, {"name": "Engineering", "degree": "Master"}]'::jsonb,
  'Private', ARRAY['IT', 'Engineering', 'Science'], 55000, 60000, 'USD', true, ARRAY['English'],
  'Need-blind admission. Полное покрытие финансовых нужд.', 'MIT Scholarship'
),
(
  'Stanford University', 'USA', 'Stanford', 'https://www.stanford.edu',
  'Университет в сердце Кремниевой долины. Лидер в сферах IT и предпринимательства.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Stanford_University_seal_2003.svg/1200px-Stanford_University_seal_2003.svg.png',
  3.8, 97,
  '[{"name": "Computer Science", "degree": "Bachelor"}, {"name": "Business", "degree": "MBA"}]'::jsonb,
  'Private', ARRAY['IT', 'Business', 'Entrepreneurship'], 56000, 62000, 'USD', true, ARRAY['English'],
  'Щедрая финансовая помощь для семей с доходом <$150k.', 'Stanford Fund'
),
(
  'Harvard University', 'USA', 'Cambridge', 'https://www.harvard.edu',
  'Один из самых престижных университетов мира. Сильные программы по праву, медицине и бизнесу.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Harvard_University_shield.png/1200px-Harvard_University_shield.png',
  3.9, 99,
  '[{"name": "Medicine", "degree": "MD"}, {"name": "Law", "degree": "JD"}]'::jsonb,
  'Private', ARRAY['Medicine', 'Law', 'Business', 'Arts'], 54000, 58000, 'USD', true, ARRAY['English'],
  '100% need-based aid.', 'Harvard Endowment'
),
(
  'Technical University of Munich (TUM)', 'Germany', 'Munich', 'https://www.tum.de',
  'Ведущий технический вуз Германии. Бесплатное образование для многих программ.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Logo_TUM.svg/1200px-Logo_TUM.svg.png',
  3.5, 88,
  '[{"name": "Informatics", "degree": "Bachelor"}, {"name": "Mechanical Engineering", "degree": "Master"}]'::jsonb,
  'Public', ARRAY['IT', 'Engineering'], 0, 3000, 'EUR', true, ARRAY['German', 'English'],
  'Бесплатное обучение, только семестровые взносы.', 'DAAD Scholarships'
),
(
  'ETH Zurich', 'Switzerland', 'Zurich', 'https://ethz.ch',
  'Альма-матер Эйнштейна. Топовый вуз континентальной Европы.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/ETH_Z%C3%BCrich_Logo_black.svg/1200px-ETH_Z%C3%BCrich_Logo_black.svg.png',
  3.6, 92,
  '[{"name": "Architecture", "degree": "Bachelor"}, {"name": "Physics", "degree": "Master"}]'::jsonb,
  'Public', ARRAY['Science', 'Engineering', 'Architecture'], 1500, 2000, 'CHF', false, ARRAY['German', 'English'],
  'Низкая стоимость обучения, но высокая стоимость жизни.', 'Excellence Scholarship'
),
(
  'University of Oxford', 'UK', 'Oxford', 'https://www.ox.ac.uk',
  'Старейший университет англоязычного мира. Уникальная система колледжей.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/University_of_Oxford_coat_of_arms.svg/1200px-University_of_Oxford_coat_of_arms.svg.png',
  3.7, 95,
  '[{"name": "PPE", "degree": "Bachelor"}, {"name": "Literature", "degree": "Bachelor"}]'::jsonb,
  'Public', ARRAY['Arts', 'Science', 'Law'], 30000, 40000, 'GBP', true, ARRAY['English'],
  'Доступны стипендии для талантливых студентов.', 'Rhodes Scholarship'
),
(
  'National University of Singapore (NUS)', 'Singapore', 'Singapore', 'https://nus.edu.sg',
  'Лучший университет Азии. Сильные программы по технологиям и бизнесу.',
  'https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/NUS_coat_of_arms.svg/1200px-NUS_coat_of_arms.svg.png',
  3.6, 90,
  '[{"name": "Computer Engineering", "degree": "Bachelor"}, {"name": "Business Admin", "degree": "Bachelor"}]'::jsonb,
  'Public', ARRAY['IT', 'Business', 'Engineering'], 20000, 30000, 'SGD', true, ARRAY['English'],
  'Tuition Grant Scheme для иностранных студентов.', 'ASEAN Scholarship'
),
(
  'University of Toronto', 'Canada', 'Toronto', 'https://www.utoronto.ca',
  'Ведущий исследовательский университет Канады.',
  'https://upload.wikimedia.org/wikipedia/en/thumb/0/04/Utoronto_coat_of_arms.svg/1200px-Utoronto_coat_of_arms.svg.png',
  3.4, 85,
  '[{"name": "Life Sciences", "degree": "Bachelor"}, {"name": "Rotman Commerce", "degree": "Bachelor"}]'::jsonb,
  'Public', ARRAY['Medicine', 'Business', 'Science'], 40000, 60000, 'CAD', true, ARRAY['English'],
  'Lester B. Pearson International Scholarship.', 'University of Toronto Scholars'
),
(
  'Sorbonne University', 'France', 'Paris', 'https://www.sorbonne-universite.fr',
  'Исторический университет в центре Парижа. Искусство и гуманитарные науки.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Logo_Sorbonne_Universit%C3%A9.svg/1200px-Logo_Sorbonne_Universit%C3%A9.svg.png',
  3.2, 80,
  '[{"name": "History of Art", "degree": "Bachelor"}, {"name": "Philosophy", "degree": "Master"}]'::jsonb,
  'Public', ARRAY['Arts', 'Humanities'], 200, 500, 'EUR', true, ARRAY['French'],
  'Практически бесплатное обучение.', 'Eiffel Scholarship'
),
(
  'Parsons School of Design', 'USA', 'New York', 'https://www.newschool.edu/parsons',
  'Одна из лучших школ дизайна и искусства в мире.',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Parsons_School_of_Design_Logo.svg/1200px-Parsons_School_of_Design_Logo.svg.png',
  3.0, 88,
  '[{"name": "Fashion Design", "degree": "Bachelor"}, {"name": "Fine Arts", "degree": "BFA"}]'::jsonb,
  'Private', ARRAY['Arts', 'Design'], 50000, 55000, 'USD', true, ARRAY['English'],
  'Merit-based scholarships.', 'Parsons Scholarship'
);
