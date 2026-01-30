import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Trash2, Loader2, ExternalLink, MapPin, GraduationCap, Star, Sparkles, Filter, Globe, DollarSign, BookOpen, Languages } from 'lucide-react';
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
  type?: 'Public' | 'Private';
  tags?: string[];
  tuition_min?: number;
  tuition_max?: number;
  currency?: string;
  has_scholarships?: boolean;
  languages?: string[];
}

const AVAILABLE_TAGS = ['IT', 'Medicine', 'Business', 'Arts', 'Engineering', 'Science', 'Law', 'Design'];

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
  const [regionFilter, setRegionFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // New Filters
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [tagsFilter, setTagsFilter] = useState<string[]>([]);
  const [scholarshipFilter, setScholarshipFilter] = useState(false);
  const [maxTuition, setMaxTuition] = useState<number>(100000);
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  
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

    // Simple region mapping
    let matchesRegion = true;
    if (regionFilter !== 'all') {
      const country = uni.country.toLowerCase();
      if (regionFilter === 'North America') {
        matchesRegion = ['usa', 'canada', 'сша', 'канада'].some(c => country.includes(c));
      } else if (regionFilter === 'Europe') {
        matchesRegion = ['uk', 'germany', 'switzerland', 'france', 'italy', 'netherlands', 'sweden', 'великобритания', 'германия', 'швейцария', 'франция'].some(c => country.includes(c));
      } else if (regionFilter === 'Asia') {
        matchesRegion = ['singapore', 'korea', 'china', 'japan', 'hong kong', 'сингапур', 'корея', 'китай', 'япония'].some(c => country.includes(c));
      } else if (regionFilter === 'CIS') {
        matchesRegion = ['russia', 'kazakhstan', 'belarus', 'россия', 'казахстан'].some(c => country.includes(c));
      } else {
         // Other or specific mapping missed - strictly speaking we should have a region column in DB
         // For now, if it doesn't match above, it might be Other. 
         // But let's keep it simple: if selected region is Other, show those NOT in above lists?
         // Let's just assume we only support these 4 major regions for now in the filter.
         matchesRegion = false;
      }
    }
    
    const matchesRating = !ratingFilter || (studentRating !== null && uni.min_rating !== null && studentRating >= uni.min_rating);
    
    const matchesType = typeFilter === 'all' || uni.type === typeFilter;
    const matchesTags = tagsFilter.length === 0 || (uni.tags && tagsFilter.some(tag => uni.tags?.includes(tag))); // some or every? usually OR logic for tags, but user said "critical for filters", usually implies "contains at least one". Let's use some.
    const matchesScholarship = !scholarshipFilter || uni.has_scholarships;
    const matchesTuition = !uni.tuition_min || uni.tuition_min <= maxTuition;
    const matchesLanguage = languageFilter === 'all' || (uni.languages && uni.languages.includes(languageFilter));

    return matchesSearch && matchesCountry && matchesRegion && matchesRating && matchesType && matchesTags && matchesScholarship && matchesTuition && matchesLanguage;
  });

  const toggleTag = (tag: string) => {
    setTagsFilter(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

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
              
              <select 
                className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:w-40"
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
              >
                <option value="all">Все регионы</option>
                <option value="North America">Сев. Америка</option>
                <option value="Europe">Европа</option>
                <option value="Asia">Азия</option>
                <option value="CIS">СНГ</option>
              </select>

              <Input 
                placeholder="Страна" 
                className="md:w-40" 
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
              />
              <Button 
                variant={ratingFilter ? "default" : "outline"} 
                onClick={() => setRatingFilter(!ratingFilter)}
                className="gap-2"
                disabled={studentRating === null}
              >
                <Star className="w-4 h-4" />
                Подходящие мне
              </Button>
              <Button
                variant={showFilters ? "secondary" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Фильтры
              </Button>
            </div>

            {/* Extended Filters */}
            {showFilters && (
              <Card className="p-4 bg-muted/30">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Тип университета</Label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger><SelectValue placeholder="Любой" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Любой</SelectItem>
                        <SelectItem value="Public">Государственный</SelectItem>
                        <SelectItem value="Private">Частный</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Язык обучения</Label>
                    <Select value={languageFilter} onValueChange={setLanguageFilter}>
                      <SelectTrigger><SelectValue placeholder="Любой" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Любой</SelectItem>
                        <SelectItem value="English">Английский</SelectItem>
                        <SelectItem value="German">Немецкий</SelectItem>
                        <SelectItem value="French">Французский</SelectItem>
                        <SelectItem value="Chinese">Китайский</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Стоимость до: {maxTuition.toLocaleString()} USD</Label>
                    <Slider 
                      value={[maxTuition]} 
                      onValueChange={(v) => setMaxTuition(v[0])} 
                      max={100000} 
                      step={1000} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="block mb-2">Направления</Label>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_TAGS.map(tag => (
                        <Badge 
                          key={tag} 
                          variant={tagsFilter.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-8">
                    <Switch id="scholarship" checked={scholarshipFilter} onCheckedChange={setScholarshipFilter} />
                    <Label htmlFor="scholarship">Только со стипендиями</Label>
                  </div>
                </div>
              </Card>
            )}

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
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <CardTitle className="text-xl">{uni.name}</CardTitle>
                              {uni.type && <Badge variant="secondary" className="text-xs h-5">{uni.type === 'Public' ? 'Гос.' : 'Частный'}</Badge>}
                              {uni.has_scholarships && <Badge variant="outline" className="text-xs h-5 border-green-500 text-green-600 bg-green-50">Стипендии</Badge>}
                            </div>
                            <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {uni.city}, {uni.country}</span>
                              {uni.languages && uni.languages.length > 0 && (
                                <span className="flex items-center gap-1"><Languages className="w-3 h-3" /> {uni.languages.join(', ')}</span>
                              )}
                              {uni.website && (
                                <a href={uni.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
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
                          
                          {uni.tags && uni.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {uni.tags.map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-3 text-sm">
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/50 font-medium whitespace-nowrap">
                                <DollarSign className="w-3.5 h-3.5" />
                                {uni.tuition_min !== undefined ? `${uni.tuition_min.toLocaleString()} ${uni.currency || 'USD'}` : 'N/A'}
                            </div>
                            <div className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground font-medium whitespace-nowrap">
                              GPA: {uni.min_gpa || 'N/A'}
                            </div>
                            <div className={`px-3 py-1 rounded-full font-medium border whitespace-nowrap ${
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
