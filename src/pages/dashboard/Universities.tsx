import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Trash2, Loader2, ExternalLink, MapPin, GraduationCap, Star, Sparkles, Filter, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { calculateStudentRating } from '@/lib/rating';

interface SavedUniversity {
  id: string;
  university_name: string;
  country: string | null;
  city: string | null;
  program: string | null;
  notes: string | null;
  website: string | null;
}

interface DirectoryUniversity {
  id: string;
  name: string;
  country: string;
  city: string | null;
  website: string | null;
  description: string | null;
  min_gpa: number | null;
  min_rating: number | null;
  programs: any;
  grants_info: string | null;
  scholarships_info: string | null;
}

export default function Universities() {
  const { user } = useAuth();
  const [savedUniversities, setSavedUniversities] = useState<SavedUniversity[]>([]);
  const [directoryUniversities, setDirectoryUniversities] = useState<DirectoryUniversity[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState(false);
  
  // Rating state
  const [studentRating, setStudentRating] = useState<number | null>(null);
  const [ratingAnalysis, setRatingAnalysis] = useState<string | null>(null);
  const [calculatingRating, setCalculatingRating] = useState(false);

  const [formData, setFormData] = useState({
    university_name: '', country: '', city: '', program: '', notes: '', website: ''
  });

  useEffect(() => {
    if (user) {
      loadSavedUniversities();
      loadDirectory();
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from('profiles').select('student_rating, student_rating_analysis').eq('id', user.id).single();
    if (data) {
      setStudentRating(data.student_rating);
      setRatingAnalysis(data.student_rating_analysis);
    }
  };

  const loadSavedUniversities = async () => {
    try {
      const { data, error } = await supabase.from('saved_universities').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setSavedUniversities(data || []);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const loadDirectory = async () => {
    try {
      const { data, error } = await supabase.from('universities_directory').select('*');
      if (error) throw error;
      setDirectoryUniversities(data || []);
    } catch (error) { console.error(error); }
  };

  const handleCalculateRating = async () => {
    if (!user) return;
    setCalculatingRating(true);
    try {
      const result = await calculateStudentRating(user.id);
      if (result) {
        setStudentRating(result.score);
        setRatingAnalysis(result.analysis);
        toast.success(`Ваш рейтинг: ${result.score}/100`);
      }
    } finally {
      setCalculatingRating(false);
    }
  };

  const handleSaveFromDirectory = async (uni: DirectoryUniversity) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('saved_universities').insert({
        user_id: user.id,
        university_name: uni.name,
        country: uni.country,
        city: uni.city,
        website: uni.website,
        notes: `Рейтинг сложности: ${uni.min_rating || 'N/A'}/100`
      });
      if (error) throw error;
      toast.success('Университет сохранен');
      loadSavedUniversities();
    } catch {
      toast.error('Ошибка сохранения');
    }
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
      loadSavedUniversities();
    } catch { toast.error('Ошибка сохранения'); } finally { setSaving(false); }
  };

  const deleteUniversity = async (id: string) => {
    try {
      const { error } = await supabase.from('saved_universities').delete().eq('id', id);
      if (error) throw error;
      toast.success('Удалено'); loadSavedUniversities();
    } catch { toast.error('Ошибка'); }
  };

  const filteredUniversities = directoryUniversities.filter(uni => {
    const matchesSearch = 
      uni.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (uni.programs && JSON.stringify(uni.programs).toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCountry = !countryFilter || uni.country.toLowerCase().includes(countryFilter.toLowerCase());
    
    const matchesRating = !ratingFilter || (studentRating !== null && uni.min_rating !== null && studentRating >= uni.min_rating);
    
    return matchesSearch && matchesCountry && matchesRating;
  });

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl gradient-hero flex items-center justify-center">
              <Search className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Университеты</h1>
              <p className="text-sm text-muted-foreground">Поиск и подбор программ</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild><Button variant="outline"><Plus className="w-4 h-4 mr-2" />Добавить вручную</Button></DialogTrigger>
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
        </div>

        {/* Rating Card */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center shadow-sm">
                {studentRating !== null ? (
                  <span className="text-2xl font-bold text-primary">{studentRating}</span>
                ) : (
                  <Sparkles className="w-8 h-8 text-primary/40" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold">Ваш рейтинг абитуриента</h3>
                <p className="text-sm text-muted-foreground max-w-lg">
                  {ratingAnalysis || "Рассчитайте свой рейтинг на основе GPA, экзаменов и проектов, чтобы найти подходящие университеты."}
                </p>
              </div>
            </div>
            <Button onClick={handleCalculateRating} disabled={calculatingRating} size="lg" className="shrink-0">
              {calculatingRating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Star className="w-4 h-4 mr-2" />}
              {studentRating ? 'Пересчитать рейтинг' : 'Рассчитать рейтинг'}
            </Button>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="search">Поиск программ</TabsTrigger>
            <TabsTrigger value="saved">Сохранённые ({savedUniversities.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Поиск по специальности, названию..." 
                  className="pl-9" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Input 
                placeholder="Страна" 
                className="md:w-48" 
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
              />
              <Button 
                variant={ratingFilter ? "default" : "outline"} 
                onClick={() => setRatingFilter(!ratingFilter)}
                className="gap-2"
                disabled={studentRating === null}
              >
                <Filter className="w-4 h-4" />
                Подходящие мне
              </Button>
            </div>

            <div className="grid gap-4">
              {filteredUniversities.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Университеты не найдены. Попробуйте изменить фильтры.
                </div>
              ) : (
                filteredUniversities.map((uni) => (
                  <Card key={uni.id} className="group hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            {uni.logo_url ? <img src={uni.logo_url} alt={uni.name} className="w-8 h-8 object-contain" /> : <GraduationCap className="w-6 h-6 text-primary" />}
                          </div>
                          <div>
                            <CardTitle className="text-xl">{uni.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <MapPin className="w-3 h-3" /> {uni.city}, {uni.country}
                              {uni.website && (
                                <a href={uni.website} target="_blank" rel="noopener noreferrer" className="ml-2 flex items-center gap-1 text-primary hover:underline">
                                  <Globe className="w-3 h-3" /> Сайт
                                </a>
                              )}
                            </CardDescription>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleSaveFromDirectory(uni)}>
                          <Plus className="w-4 h-4 mr-2" /> Сохранить
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">{uni.description}</p>
                          <div className="flex gap-4 text-sm">
                            <div className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground font-medium">
                              Min GPA: {uni.min_gpa || 'N/A'}
                            </div>
                            <div className={`px-3 py-1 rounded-full font-medium border ${
                               studentRating && uni.min_rating && studentRating >= uni.min_rating 
                                ? 'bg-green-100 text-green-700 border-green-200' 
                                : 'bg-secondary text-secondary-foreground border-transparent'
                              }`}>
                              Сложность: {uni.min_rating}/100
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          {uni.grants_info && (
                            <div className="p-3 rounded-lg bg-blue-50 text-blue-700">
                              <span className="font-semibold block mb-1">Гранты и помощь:</span>
                              {uni.grants_info}
                            </div>
                          )}
                          {Array.isArray(uni.programs) && (
                            <div className="text-muted-foreground">
                              <span className="font-semibold text-foreground">Программы: </span>
                              {uni.programs.map((p: any) => p.name).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="saved">
            {loading ? <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin" /></div> : savedUniversities.length === 0 ? (
              <Card><CardContent className="py-16 text-center"><Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><h3 className="font-semibold text-lg mb-2">Нет сохранённых университетов</h3><p className="text-muted-foreground mb-4">Найдите университеты во вкладке "Поиск"</p></CardContent></Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {savedUniversities.map((uni) => (
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
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
