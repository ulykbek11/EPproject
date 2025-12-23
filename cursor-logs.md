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
