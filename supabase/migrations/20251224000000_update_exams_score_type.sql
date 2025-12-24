-- Change exams score column type to decimal
ALTER TABLE public.exams 
ALTER COLUMN score TYPE DECIMAL(5,2);

-- Also update max_score to be safe (though usually integer, but consistent types are good)
ALTER TABLE public.exams 
ALTER COLUMN max_score TYPE DECIMAL(5,2);