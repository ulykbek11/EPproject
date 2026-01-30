-- Change exams score and max_score columns to DECIMAL(5,2) to support fractional grades like 7.5
-- This allows storing values like 8.5, 7.0, 100.00, etc.

ALTER TABLE public.exams 
ALTER COLUMN score TYPE DECIMAL(5,2);

ALTER TABLE public.exams 
ALTER COLUMN max_score TYPE DECIMAL(5,2);
