import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ClipboardList, Plus, Trash2, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Exam {
  id: string;
  exam_name: string;
  score: number | null;
  max_score: number;
  notes: string | null;
}

const examTemplates = [
  { name: 'ЕГЭ Математика (профиль)', maxScore: 100 },
  { name: 'ЕГЭ Русский язык', maxScore: 100 },
  { name: 'ЕГЭ Физика', maxScore: 100 },
  { name: 'ЕГЭ Информатика', maxScore: 100 },
  { name: 'IELTS', maxScore: 9 },
  { name: 'TOEFL', maxScore: 120 },
  { name: 'SAT', maxScore: 1600 },
];

export default function Exams() {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    exam_name: '',
    score: '',
    max_score: '100',
    notes: ''
  });

  useEffect(() => {
    if (user) loadExams();
  }, [user]);

  const loadExams = async () => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExams(data || []);
    } catch (error) {
      console.error('Error loading exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.exam_name.trim()) return;

    setSaving(true);
    try {
      // Handle score parsing (replace comma with dot for floats)
      const parsedScore = formData.score 
        ? Number(formData.score.toString().replace(',', '.')) 
        : null;

      const { error } = await supabase.from('exams').insert({
        user_id: user.id,
        exam_name: formData.exam_name,
        score: parsedScore,
        max_score: Number(formData.max_score) || 100,
        notes: formData.notes || null
      });

      if (error) throw error;

      toast.success('Экзамен добавлен');
      setFormData({ exam_name: '', score: '', max_score: '100', notes: '' });
      setDialogOpen(false);
      loadExams();
    } catch (error) {
      toast.error('Ошибка сохранения');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const deleteExam = async (id: string) => {
    try {
      const { error } = await supabase.from('exams').delete().eq('id', id);
      if (error) throw error;
      toast.success('Экзамен удалён');
      loadExams();
    } catch (error) {
      toast.error('Ошибка удаления');
    }
  };

  const selectTemplate = (template: typeof examTemplates[0]) => {
    setFormData(prev => ({
      ...prev,
      exam_name: template.name,
      max_score: template.maxScore.toString()
    }));
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Экзамены</h1>
              <p className="text-sm text-muted-foreground">Отслеживайте результаты тестов</p>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero">
                <Plus className="w-4 h-4 mr-2" />
                Добавить
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить экзамен</DialogTitle>
              </DialogHeader>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {examTemplates.map((template, i) => (
                  <button
                    key={i}
                    onClick={() => selectTemplate(template)}
                    className="px-3 py-1 text-xs rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {template.name}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Название экзамена</Label>
                  <Input
                    value={formData.exam_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, exam_name: e.target.value }))}
                    placeholder="ЕГЭ Математика"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Балл</Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={formData.score}
                      onChange={(e) => {
                        const val = e.target.value;
                        // Allow digits, dots, and commas. 
                        // Only update if it matches a partial number pattern or is empty
                        if (val === '' || /^[0-9.,]+$/.test(val)) {
                          setFormData(prev => ({ ...prev, score: val }));
                        }
                      }}
                      placeholder="8.5"
                    />
                  </div>
                  <div>
                    <Label>Макс. балл</Label>
                    <Input
                      type="number"
                      value={formData.max_score}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_score: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Заметки</Label>
                  <Input
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Дополнительная информация"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Сохранить
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Exams list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : exams.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Нет экзаменов</h3>
              <p className="text-muted-foreground mb-4">
                Добавьте свои результаты ЕГЭ, IELTS, SAT и других тестов
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить первый экзамен
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {exams.map((exam) => (
              <Card key={exam.id} className="group hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{exam.exam_name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteExam(exam.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2 mb-3">
                    <span className="text-4xl font-display font-bold text-primary">
                      {exam.score ?? '—'}
                    </span>
                    <span className="text-muted-foreground mb-1">/ {exam.max_score}</span>
                  </div>
                  {exam.score && (
                    <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
                      <div 
                        className="h-full gradient-hero rounded-full"
                        style={{ width: `${(exam.score / exam.max_score) * 100}%` }}
                      />
                    </div>
                  )}
                  {exam.notes && (
                    <p className="text-sm text-muted-foreground mt-2">{exam.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
