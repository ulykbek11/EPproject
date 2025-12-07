import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus, Trash2, Loader2, ExternalLink, MapPin, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface University {
  id: string;
  university_name: string;
  country: string | null;
  city: string | null;
  program: string | null;
  notes: string | null;
  website: string | null;
}

export default function Universities() {
  const { user } = useAuth();
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    university_name: '', country: '', city: '', program: '', notes: '', website: ''
  });

  useEffect(() => { if (user) loadUniversities(); }, [user]);

  const loadUniversities = async () => {
    try {
      const { data, error } = await supabase.from('saved_universities').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setUniversities(data || []);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.university_name.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('saved_universities').insert({
        user_id: user.id, ...formData,
        country: formData.country || null, city: formData.city || null,
        program: formData.program || null, notes: formData.notes || null, website: formData.website || null
      });
      if (error) throw error;
      toast.success('Университет добавлен');
      setFormData({ university_name: '', country: '', city: '', program: '', notes: '', website: '' });
      setDialogOpen(false);
      loadUniversities();
    } catch { toast.error('Ошибка сохранения'); } finally { setSaving(false); }
  };

  const deleteUniversity = async (id: string) => {
    try {
      const { error } = await supabase.from('saved_universities').delete().eq('id', id);
      if (error) throw error;
      toast.success('Удалено'); loadUniversities();
    } catch { toast.error('Ошибка'); }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl gradient-hero flex items-center justify-center">
              <Search className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Университеты</h1>
              <p className="text-sm text-muted-foreground">Сохранённые вузы</p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button variant="hero"><Plus className="w-4 h-4 mr-2" />Добавить</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Добавить университет</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label>Название</Label><Input value={formData.university_name} onChange={(e) => setFormData(p => ({ ...p, university_name: e.target.value }))} placeholder="МГУ им. Ломоносова" required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Страна</Label><Input value={formData.country} onChange={(e) => setFormData(p => ({ ...p, country: e.target.value }))} placeholder="Россия" /></div>
                  <div><Label>Город</Label><Input value={formData.city} onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))} placeholder="Москва" /></div>
                </div>
                <div><Label>Программа</Label><Input value={formData.program} onChange={(e) => setFormData(p => ({ ...p, program: e.target.value }))} placeholder="Информатика" /></div>
                <div><Label>Сайт</Label><Input value={formData.website} onChange={(e) => setFormData(p => ({ ...p, website: e.target.value }))} placeholder="https://..." /></div>
                <div><Label>Заметки</Label><Input value={formData.notes} onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))} placeholder="..." /></div>
                <Button type="submit" className="w-full" disabled={saving}>{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Сохранить</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin" /></div> : universities.length === 0 ? (
          <Card><CardContent className="py-16 text-center"><Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><h3 className="font-semibold text-lg mb-2">Нет университетов</h3><p className="text-muted-foreground mb-4">Сохраняйте интересные вузы</p><Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />Добавить</Button></CardContent></Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {universities.map((uni) => (
              <Card key={uni.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg gradient-hero flex items-center justify-center"><GraduationCap className="w-5 h-5 text-primary-foreground" /></div>
                      <div><h3 className="font-semibold">{uni.university_name}</h3>{uni.program && <p className="text-sm text-primary">{uni.program}</p>}</div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteUniversity(uni.id)} className="opacity-0 group-hover:opacity-100 text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                  {(uni.city || uni.country) && <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2"><MapPin className="w-4 h-4" />{[uni.city, uni.country].filter(Boolean).join(', ')}</div>}
                  {uni.notes && <p className="text-sm text-muted-foreground mb-2">{uni.notes}</p>}
                  {uni.website && <a href={uni.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline"><ExternalLink className="w-3 h-3" />Сайт</a>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
