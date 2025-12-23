-- Create universities directory table
CREATE TABLE public.universities_directory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT,
  website TEXT,
  logo_url TEXT,
  description TEXT,
  
  -- Admissions info
  min_gpa DECIMAL(3,2), -- e.g. 3.5
  min_rating INTEGER DEFAULT 0, -- 0-100 difficulty score
  
  -- JSONB fields for flexible data
  programs JSONB DEFAULT '[]'::jsonb, -- e.g. [{"name": "CS", "degree": "Bachelors"}]
  grants_info TEXT,
  scholarships_info TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.universities_directory ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read universities
CREATE POLICY "Universities are viewable by everyone" 
ON public.universities_directory FOR SELECT 
USING (true);

-- Add rating fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS student_rating INTEGER,
ADD COLUMN IF NOT EXISTS student_rating_analysis TEXT;

-- Insert mock data
INSERT INTO public.universities_directory (name, country, city, website, description, min_gpa, min_rating, programs, grants_info, scholarships_info)
VALUES 
(
  'Massachusetts Institute of Technology (MIT)', 
  'USA', 
  'Cambridge', 
  'https://web.mit.edu',
  'A world-class university known for STEM programs.',
  3.9, 
  95,
  '[{"name": "Computer Science", "degree": "Bachelors"}, {"name": "Physics", "degree": "Bachelors"}, {"name": "Engineering", "degree": "Masters"}]'::jsonb,
  'Need-blind admission for international students. Full financial aid available.',
  'MIT Scholarship, Federal Pell Grant'
),
(
  'Stanford University', 
  'USA', 
  'Stanford', 
  'https://www.stanford.edu',
  'Renowned for entrepreneurship and computer science.',
  3.8, 
  94,
  '[{"name": "Computer Science", "degree": "Bachelors"}, {"name": "Economics", "degree": "Bachelors"}]'::jsonb,
  'Need-based financial aid. Covers tuition for families earning under $150k.',
  'Stanford Fund Scholarship'
),
(
  'University of Oxford', 
  'UK', 
  'Oxford', 
  'https://www.ox.ac.uk',
  'The oldest university in the English-speaking world.',
  3.7, 
  92,
  '[{"name": "Philosophy, Politics and Economics", "degree": "Bachelors"}, {"name": "Medicine", "degree": "Bachelors"}]'::jsonb,
  'Reach Oxford Scholarship for developing countries.',
  'Rhodes Scholarship, Clarendon Fund'
),
(
  'ETH Zurich', 
  'Switzerland', 
  'Zurich', 
  'https://ethz.ch',
  'Leading university in science and technology.',
  3.5, 
  85,
  '[{"name": "Architecture", "degree": "Bachelors"}, {"name": "Computer Science", "degree": "Masters"}]'::jsonb,
  'Excellence Scholarship & Opportunity Programme (ESOP).',
  'Swiss Government Excellence Scholarships'
),
(
  'National University of Singapore (NUS)', 
  'Singapore', 
  'Singapore', 
  'https://nus.edu.sg',
  'Top-ranked university in Asia.',
  3.6, 
  88,
  '[{"name": "Computer Engineering", "degree": "Bachelors"}, {"name": "Business Administration", "degree": "Bachelors"}]'::jsonb,
  'ASEAN Undergraduate Scholarship.',
  'Science & Technology Undergraduate Scholarship'
),
(
  'Technical University of Munich (TUM)', 
  'Germany', 
  'Munich', 
  'https://www.tum.de',
  'Top German technical university.',
  3.0, 
  75,
  '[{"name": "Informatics", "degree": "Bachelors"}, {"name": "Mechanical Engineering", "degree": "Masters"}]'::jsonb,
  'No tuition fees for most programs. Living cost scholarships available.',
  'Deutschlandstipendium'
),
(
  'KAIST', 
  'South Korea', 
  'Daejeon', 
  'https://kaist.ac.kr',
  'Leading research university in Korea.',
  3.3, 
  80,
  '[{"name": "Electrical Engineering", "degree": "Bachelors"}, {"name": "Industrial Design", "degree": "Bachelors"}]'::jsonb,
  'Full tuition scholarship for all admitted international students.',
  'KAIST International Student Scholarship'
);
