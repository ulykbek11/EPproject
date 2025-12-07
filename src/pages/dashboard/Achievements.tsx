import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trophy, Plus, Trash2, Loader2, Calendar, Medal, Award, Star } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Achievement {
  id: string;
  title: string;
  description: string | null;
  date_achieved: string | null;
  category: string | null;
}

const categories = [
  { name: 'Олимпиада', icon: Medal },
  { name: 'Конкурс', icon: Trophy },
  { name: 'Сертификат', icon: Award },
  { name: 'Премия', icon: Star },
  { name: 'Спорт', icon: Trophy },
  { name: 'Другое', icon: Award }
];

export default function Achievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    date_achieved: ''
  });

  useEffect(() => {
    if (user) loadAchievements();
  }, [user]);

  const loadAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('date_achieved', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.title.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase.from('achievements').insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description || null,
        category: formData.category || null,
        date_achieved: formData.date_achieved || null
      });

      if (error) throw error;

      toast.success('Достижение добавлено');
      setFormData({ title: '', description: '', category: '', date_achieved: '' });
      setDialogOpen(false);
      loadAchievements();
    } catch (error) {
      toast.error('Ошибка сохранения');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const deleteAchievement = async (id: string) => {
    try {
      const { error } = await supabase.from('achievements').delete().eq('id', id);
      if (error) throw error;
      toast.success('Достижение удалено');
      loadAchievements();
    } catch (error) {
      toast.error('Ошибка удаления');
    }
  };

  const getCategoryIcon = (category: string | null) => {
    const cat = categories.find(c => c.name === category);
    return cat?.icon || Trophy;
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-warning flex items-center justify-center">
              <Trophy className="w-6 h-6 text-warning-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Достижения</h1>
              <p className="text-sm text-muted-foreground">Олимпиады, конкурсы и награды</p>
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
                <DialogTitle>Добавить достижение</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Название</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Победитель олимпиады по математике"
                    required
                  />
                </div>
                <div>
                  <Label>Описание</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Подробности достижения..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Категория</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, category: cat.name }))}
                        className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-full transition-colors ${
                          formData.category === cat.name
                            ? 'bg-warning text-warning-foreground'
                            : 'bg-muted hover:bg-warning/10'
                        }`}
                      >
                        <cat.icon className="w-3 h-3" />
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Дата получения</Label>
                  <Input
                    type="date"
                    value={formData.date_achieved}
                    onChange={(e) => setFormData(prev => ({ ...prev, date_achieved: e.target.value }))}
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

        {/* Achievements list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : achievements.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Нет достижений</h3>
              <p className="text-muted-foreground mb-4">
                Добавьте свои награды, дипломы и сертификаты
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить первое достижение
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {achievements.map((achievement) => {
              const Icon = getCategoryIcon(achievement.category);
              return (
                <Card key={achievement.id} className="group hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-warning" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold">{achievement.title}</h3>
                            {achievement.category && (
                              <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-warning/10 text-warning mt-1">
                                {achievement.category}
                              </span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteAchievement(achievement.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        {achievement.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {achievement.description}
                          </p>
                        )}
                        {achievement.date_achieved && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                            <Calendar className="w-3 h-3" />
                            {new Date(achievement.date_achieved).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
