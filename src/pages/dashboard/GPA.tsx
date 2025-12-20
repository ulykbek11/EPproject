import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Plus, Trash2, Save, Loader2, Upload, Camera } from 'lucide-react';
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
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const saveRecords = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // 1. Delete existing records (simple sync approach)
      // For a more complex app, we'd diff changes, but this is safer for consistency
      const { error: deleteError } = await supabase
        .from('gpa_records')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // 2. Insert current records
      const validRecords = records.filter(r => r.subject.trim() !== '');
      if (validRecords.length === 0) {
        toast.success('Записи очищены');
        return;
      }

      const { error: insertError } = await supabase
        .from('gpa_records')
        .insert(validRecords.map(r => ({
          user_id: user.id,
          subject: r.subject,
          grade: r.grade,
          credits: r.credits
        })));

      if (insertError) throw insertError;

      toast.success('Оценки успешно сохранены');
      loadRecords(); // Reload to get IDs
    } catch (error) {
      console.error('Error saving records:', error);
      toast.error('Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  const addRecord = () => {
    setRecords([...records, { subject: '', grade: 0, credits: 1 }]);
  };

  const removeRecord = (index: number) => {
    if (records.length > 1) {
      setRecords(records.filter((_, i) => i !== index));
    } else {
        // If it's the last record, just clear it instead of removing
        setRecords([{ subject: '', grade: 0, credits: 1 }]);
    }
  };

  const updateRecord = (index: number, field: keyof GradeRecord, value: string | number) => {
    const updated = [...records];
    if (field === 'grade') {
      const numValue = Number(value);
      updated[index][field] = Math.min(Math.max(numValue, 0), 100); // Allow up to 100 for percentage scales
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

    // Detect scale (5-point or 100-point/4.0)
    // Simple logic: if any grade > 5, assume 100-point or similar and just average for now
    // Ideally, user selects system. For now, let's just do weighted average.
    
    const totalPoints = validRecords.reduce((sum, r) => sum + (r.grade * r.credits), 0);
    const totalCredits = validRecords.reduce((sum, r) => sum + r.credits, 0);
    
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB limit (resizing will handle it)
        toast.error('Файл слишком большой (макс. 10МБ)');
        return;
    }

    setAnalyzing(true);

    // Image resizing function
    const resizeImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 768; // Reduced resolution for speed
                    const MAX_HEIGHT = 768;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8)); // 80% quality JPEG
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    try {
        const resizedBase64 = await resizeImage(file);
        
        const response = await fetch('/api/analyze-gpa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: resizedBase64 }),
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.details || errData.error || 'Ошибка анализа');
        }

        const data = await response.json();
        if (Array.isArray(data.result)) {
            // Merge with existing empty records or replace if only one empty record exists
            const newRecords = data.result.map((item: any) => ({
                subject: item.subject,
                grade: Number(item.grade),
                credits: 1 // Default credit
            }));

            if (records.length === 1 && records[0].subject === '' && records[0].grade === 0) {
                setRecords(newRecords);
            } else {
                setRecords([...records, ...newRecords]);
            }
            toast.success(`Распознано ${newRecords.length} предметов`);
        } else {
            toast.error('Не удалось найти оценки на изображении');
        }
    } catch (error: any) {
        console.error('Analyze error:', error);
        toast.error(error.message || 'Ошибка при анализе табеля');
    } finally {
        setAnalyzing(false);
        if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
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
            <p className="text-sm text-muted-foreground">Рассчитайте средний балл вручную или загрузите фото табеля</p>
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
                    style={{ width: `${Math.min((Number(gpa) / 5) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Records */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="text-lg">Оценки по предметам</CardTitle>
              <div className="flex gap-2 w-full sm:w-auto">
                <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileUpload}
                />
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 sm:flex-none"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={analyzing}
                >
                    {analyzing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Camera className="w-4 h-4 mr-2" />
                    )}
                    {analyzing ? 'Анализ...' : 'Скан. табеля'}
                </Button>
                <Button onClick={addRecord} size="sm" variant="outline" className="flex-1 sm:flex-none">
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить
                </Button>
              </div>
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
                          max="100"
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
