import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface GradeRecord {
  id?: string;
  subject: string;
  grade: number;
  credits: number;
}

export default function GPA() {
  const { user } = useAuth();
  const [records, setRecords] = useState<GradeRecord[]>([
    { subject: '', grade: 0, credits: 1 }
  ]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) loadRecords();
  }, [user]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gpa_records')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setRecords(data.map(r => ({
          id: r.id,
          subject: r.subject,
          grade: Number(r.grade),
          credits: r.credits || 1
        })));
      }
    } catch (error) {
      console.error('Error loading GPA records:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRecord = () => {
    setRecords([...records, { subject: '', grade: 0, credits: 1 }]);
  };

  const removeRecord = (index: number) => {
    if (records.length > 1) {
      setRecords(records.filter((_, i) => i !== index));
    }
  };

  const updateRecord = (index: number, field: keyof GradeRecord, value: string | number) => {
    const updated = [...records];
    if (field === 'grade') {
      const numValue = Number(value);
      updated[index][field] = Math.min(Math.max(numValue, 0), 5);
    } else if (field === 'credits') {
      updated[index][field] = Math.max(Number(value), 1);
    } else {
      updated[index][field] = value as string;
    }
    setRecords(updated);
  };

  const calculateGPA = () => {
    const validRecords = records.filter(r => r.subject && r.grade > 0);
    if (validRecords.length === 0) return 0;

    const totalPoints = validRecords.reduce((sum, r) => sum + (r.grade * r.credits), 0);
    const totalCredits = validRecords.reduce((sum, r) => sum + r.credits, 0);
    
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
  };

  const saveRecords = async () => {
    if (!user) return;
    
    const validRecords = records.filter(r => r.subject.trim());
    if (validRecords.length === 0) {
      toast.error('Добавьте хотя бы один предмет');
      return;
    }

    setSaving(true);
    try {
      // Delete existing records
      await supabase.from('gpa_records').delete().eq('user_id', user.id);

      // Insert new records
      const { error } = await supabase.from('gpa_records').insert(
        validRecords.map(r => ({
          user_id: user.id,
          subject: r.subject,
          grade: r.grade,
          credits: r.credits
        }))
      );

      if (error) throw error;
      toast.success('Данные сохранены');
      loadRecords();
    } catch (error) {
      toast.error('Ошибка сохранения');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const gpa = calculateGPA();
  const gpaColor = Number(gpa) >= 4.5 ? 'text-success' : Number(gpa) >= 3.5 ? 'text-warning' : 'text-destructive';

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
            <Calculator className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Калькулятор GPA</h1>
            <p className="text-sm text-muted-foreground">Рассчитайте средний балл</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* GPA Display */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Ваш GPA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={`text-6xl font-display font-bold ${gpaColor}`}>
                  {gpa}
                </div>
                <p className="text-muted-foreground mt-2">из 5.0</p>
                <div className="mt-4 h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full gradient-hero rounded-full transition-all duration-500"
                    style={{ width: `${(Number(gpa) / 5) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Records */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Оценки по предметам</CardTitle>
              <Button onClick={addRecord} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Добавить
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-3">
                  {records.map((record, index) => (
                    <div key={index} className="flex items-end gap-3">
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Предмет</Label>
                        <Input
                          value={record.subject}
                          onChange={(e) => updateRecord(index, 'subject', e.target.value)}
                          placeholder="Математика"
                        />
                      </div>
                      <div className="w-20">
                        <Label className="text-xs text-muted-foreground">Оценка</Label>
                        <Input
                          type="number"
                          min="0"
                          max="5"
                          step="0.1"
                          value={record.grade || ''}
                          onChange={(e) => updateRecord(index, 'grade', e.target.value)}
                          placeholder="5"
                        />
                      </div>
                      <div className="w-20">
                        <Label className="text-xs text-muted-foreground">Кредиты</Label>
                        <Input
                          type="number"
                          min="1"
                          value={record.credits}
                          onChange={(e) => updateRecord(index, 'credits', e.target.value)}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRecord(index)}
                        disabled={records.length === 1}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button 
                onClick={saveRecords} 
                className="w-full mt-6"
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Сохранить
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              <strong>Как рассчитывается GPA:</strong> Средний балл = сумма (оценка × кредиты) / сумма кредитов. 
              Используйте кредиты для учёта важности предметов. По умолчанию кредит = 1.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
