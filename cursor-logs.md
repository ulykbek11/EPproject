83) UI Corrections (Exams & Projects):
    - Вкладка "Экзамены" (Exams.tsx):
        - Исправлена проблема с сохранением дробных оценок (например, 7.5 или 7,5).
            - Добавлен `step="0.01"` в поле ввода.
            - Добавлена обработка запятой: `.replace(',', '.')` перед преобразованием в число.
        - Удалено поле "Дата экзамена" (exam_date) из формы, интерфейса и отображения.
    - Вкладка "Проекты" (Projects.tsx):
        - Удалены поля "Дата начала" (start_date) и "Дата окончания" (end_date).
        - Удалено поле "Ссылка на проект" (link).
        - Обновлены интерфейсы и логика сохранения.

84) University Search & Rating System:
    - Database:
        - Created `universities_directory` table with fields for admissions, grants, and programs.
        - Added `student_rating` and `student_rating_analysis` to `profiles`.
        - Populated with initial mock data (Ivy League, European, Asian universities).
    - Logic:
        - Implemented `calculateStudentRating` in `src/lib/rating.ts` using AI to evaluate student profile (0-100 score).
    - UI (`Universities.tsx`):
        - Split into "Search" and "Saved" tabs.
        - Added Search functionality with filters for Country and Rating.
        - Added "Calculate Rating" button and display.
        - Added display of grants and programs in university cards.

85) GPA Calculator Fixes:
    - Backend (Supabase Function):
        - Switched to `gemini-flash-lite-latest` to resolve quota errors.
    - Frontend (`GPA.tsx`):
        - Implemented automatic removal of subjects with "-" (0 grade) or "PASS" (NaN) upon saving.
        - This prevents 0 grades from skewing the GPA calculation and fixes "unable to save" issues caused by invalid grades.

86) Exams Input Fix:
    - Frontend (`Exams.tsx`):
        - Changed "Score" input from `type="number"` to `type="text"` (with `inputMode="decimal"`).
        - This fully enables typing decimal scores with commas (e.g., "8,5") or dots (e.g., "7.5") regardless of browser locale.
    - Database:
        - Updated `exams` table schema to change `score` and `max_score` columns from `INTEGER` to `DECIMAL(5,2)` to support fractional grades.

87) Exams Score Type Fix (Follow-up):
    - Frontend (Exams.tsx):
        - Improved error handling to show specific database errors in toast notifications.
    - Database:
        - Re-verified need for DECIMAL(5,2) on exams.score and exams.max_score.
        - Provided SQL fix to user for manual application if migration failed.
