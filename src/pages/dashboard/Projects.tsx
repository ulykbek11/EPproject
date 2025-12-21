import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FolderOpen, Plus, Trash2, ExternalLink, Loader2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Project {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
}

const categories = ['Исследование', 'Программирование', 'Дизайн', 'Волонтёрство', 'Бизнес', 'Творчество', 'Другое'];

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ''
  });

  useEffect(() => {
    if (user) loadProjects();
  }, [user]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.title.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase.from('projects').insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description || null,
        category: formData.category || null
      });

      if (error) throw error;

      toast.success('Проект добавлен');
      setFormData({ title: '', description: '', category: '' });
      setDialogOpen(false);
      loadProjects();
    } catch (error) {
      toast.error('Ошибка сохранения');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      toast.success('Проект удалён');
      loadProjects();
    } catch (error) {
      toast.error('Ошибка удаления');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl gradient-accent flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Проекты</h1>
              <p className="text-sm text-muted-foreground">Ваше портфолио работ</p>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero">
                <Plus className="w-4 h-4 mr-2" />
                Добавить
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Добавить проект</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Название проекта</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Мой крутой проект"
                    required
                  />
                </div>
                <div>
                  <Label>Описание</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Расскажите о проекте..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Категория</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          formData.category === cat
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-primary/10'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Сохранить
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Projects list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Нет проектов</h3>
              <p className="text-muted-foreground mb-4">
                Добавьте свои работы, исследования и достижения
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить первый проект
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <Card key={project.id} className="group hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      {project.category && (
                        <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary mt-1">
                          {project.category}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteProject(project.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {project.description}
                    </p>
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
