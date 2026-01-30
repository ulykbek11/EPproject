-- Migration to attempt to fill missing logo_urls using Clearbit API
-- This is a best-effort update based on the website domain

UPDATE public.universities_directory
SET logo_url = 'https://logo.clearbit.com/' || substring(replace(replace(website, 'https://', ''), 'http://', '') from '^([^/]+)')
WHERE (logo_url IS NULL OR logo_url = '') AND website IS NOT NULL AND website != '';
