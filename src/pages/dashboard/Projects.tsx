import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FolderOpen, Plus, Trash2, ExternalLink, Loader2, Calendar, FileText, Download, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { analyzeProject } from '@/lib/project-analysis';

interface Project {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  file_path: string | null;
  ai_analysis: string | null;
  ai_rating: number | null;
}

const categories = ['Исследование', 'Программирование', 'Дизайн', 'Волонтёрство', 'Бизнес', 'Творчество', 'Другое'];

import { extractTextFromFile } from '@/lib/file-parser';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
      let filePath = null;
      let fileContent = '';

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('project_files')
          .upload(fileName, selectedFile);
        
        if (uploadError) throw uploadError;
        filePath = fileName;

        // Extract text content for AI analysis (supports PDF, DOCX, TXT, etc.)
        fileContent = await extractTextFromFile(selectedFile);
      }

      // AI Analysis
      const aiResult = await analyzeProject(
        formData.title,
        formData.description,
        formData.category || 'Other',
        selectedFile?.name,
        fileContent
      );

      const { error } = await supabase.from('projects').insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description || null,
        category: formData.category || null,
        file_path: filePath,
        ai_analysis: aiResult.analysis,
        ai_rating: aiResult.score
      });

      if (error) throw error;

      toast.success('Проект добавлен и проанализирован');
      setFormData({ title: '', description: '', category: '' });
      setSelectedFile(null);
      setDialogOpen(false);
      loadProjects();
    } catch (error) {
      toast.error('Ошибка сохранения');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async (id: string, filePath: string | null) => {
    try {
      if (filePath) {
        await supabase.storage.from('project_files').remove([filePath]);
      }
      
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      toast.success('Проект удалён');
      loadProjects();
    } catch (error) {
      toast.error('Ошибка удаления');
    }
  };

  const getFileUrl = (path: string) => {
    const { data } = supabase.storage.from('project_files').getPublicUrl(path);
    return data.publicUrl;
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
                  <Label>Файл проекта (опционально)</Label>
                  <div className="mt-2">
                    <Input
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Поддерживаются любые файлы. Текстовые файлы будут проанализированы ИИ.
                    </p>
                  </div>
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
                  {saving ? 'Анализ и сохранение...' : 'Сохранить'}
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
              <Card key={project.id} className="group hover:shadow-md transition-shadow flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg line-clamp-1">{project.title}</CardTitle>
                      {project.category && (
                        <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary mt-1">
                          {project.category}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteProject(project.id, project.file_path)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-3">
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  
                  {/* AI Analysis Result - Rating ONLY */}
                  {project.ai_rating !== null && (
                    <div className="bg-muted/50 rounded-lg p-2 text-sm inline-flex items-center gap-2 w-fit">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="font-medium text-primary">
                        AI Оценка: <span className={project.ai_rating >= 70 ? "text-success" : "text-primary"}>{project.ai_rating}/100</span>
                      </span>
                    </div>
                  )}

                  <div className="mt-auto pt-2 flex items-center gap-2">
                    {project.file_path && (
                      <a 
                        href={getFileUrl(project.file_path)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-primary hover:underline"
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Открыть файл
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
