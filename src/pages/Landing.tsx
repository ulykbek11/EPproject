import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  MessageSquare, 
  Calculator, 
  Trophy, 
  FolderOpen, 
  Search,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Globe2
} from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const features = [
  {
    icon: MessageSquare,
    title: 'ИИ-консультант',
    description: 'Персональные советы по поступлению, экзаменам и стипендиям от умного помощника'
  },
  {
    icon: Calculator,
    title: 'Калькулятор GPA',
    description: 'Рассчитайте средний балл и отслеживайте академическую успеваемость'
  },
  {
    icon: Trophy,
    title: 'Достижения',
    description: 'Ведите учёт олимпиад, конкурсов и сертификатов в одном месте'
  },
  {
    icon: FolderOpen,
    title: 'Портфолио проектов',
    description: 'Собирайте проекты и работы для подачи в университеты'
  },
  {
    icon: Search,
    title: 'Поиск университетов',
    description: 'Находите подходящие вузы и программы обучения'
  },
  {
    icon: GraduationCap,
    title: 'Экзамены',
    description: 'Отслеживайте результаты ЕГЭ, SAT, IELTS и других тестов'
  }
];

const benefits = [
  'Бесплатный старт',
  'Персонализированные рекомендации',
  'Все данные в одном месте',
  'ИИ-помощник 24/7'
];

export default function Landing() {
  const { user } = useAuth();
  const [selectedRegion, setSelectedRegion] = useState('');
  const [isRegionDialogOpen, setIsRegionDialogOpen] = useState(false);

  const handleRegionSave = async () => {
    if (!user) {
      toast.error('Пожалуйста, войдите в систему, чтобы сохранить регион');
      return;
    }
    if (!selectedRegion) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ region: selectedRegion })
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success('Регион успешно сохранен!');
      setIsRegionDialogOpen(false);
    } catch (error) {
      console.error('Error saving region:', error);
      toast.error('Ошибка при сохранении региона');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">EduPath</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost">Войти</Button>
            </Link>
            <Link to="/auth?mode=register">
              <Button variant="hero">Начать бесплатно</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 overflow-hidden">
        <div className="container mx-auto text-center relative">
          {/* Decorative elements */}
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              Твой путь к мечте начинается здесь
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
              Умный помощник для{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                поступления
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              EduPath помогает выбрать университет, подготовиться к экзаменам и собрать 
              идеальное портфолио с помощью персонального ИИ-консультанта
            </p>

            {/* Region Selection CTA */}
            <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.15s' }}>
               <Dialog open={isRegionDialogOpen} onOpenChange={setIsRegionDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2 rounded-full border-primary/20 hover:border-primary/50 bg-background/50 backdrop-blur-sm">
                    <Globe2 className="w-4 h-4 text-primary" />
                    <span className="text-sm">Выберите ваш регион для точных рекомендаций ИИ</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Выберите ваш регион</DialogTitle>
                    <DialogDescription>
                      Это поможет ИИ-консультанту давать более точные советы, учитывая специфику поступления из вашего региона.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите регион" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CIS">СНГ (Россия, Казахстан, Узбекистан и др.)</SelectItem>
                        <SelectItem value="Europe">Европа</SelectItem>
                        <SelectItem value="Asia">Азия</SelectItem>
                        <SelectItem value="North America">Северная Америка</SelectItem>
                        <SelectItem value="Other">Другой</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleRegionSave} className="w-full" disabled={!selectedRegion}>
                      Сохранить и продолжить
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/auth?mode=register">
                <Button variant="hero" size="xl">
                  Начать бесплатно
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="xl">
                  У меня есть аккаунт
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground animate-slide-up" style={{ animationDelay: '0.3s' }}>
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Всё для успешного поступления
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Инструменты, которые помогут организовать подготовку и не упустить важное
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-card rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
                <MessageSquare className="w-4 h-4" />
                ИИ-консультант
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                Персональный помощник по поступлению
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Наш ИИ-консультант знает всё о поступлении: требования вузов, сроки подачи, 
                подготовка к экзаменам, написание эссе и получение стипендий.
              </p>
              <ul className="space-y-4">
                {[
                  'Советы по выбору университета и программы',
                  'Помощь в подготовке к ЕГЭ, SAT, IELTS',
                  'Рекомендации по написанию мотивационного письма',
                  'Информация о стипендиях и грантах'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="bg-card rounded-2xl border border-border p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                  <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold">ИИ-консультант</p>
                    <p className="text-xs text-muted-foreground">Онлайн</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-muted rounded-xl p-4 max-w-[80%]">
                    <p className="text-sm">Привет! Я помогу тебе с поступлением. Какой вопрос тебя интересует?</p>
                  </div>
                  <div className="bg-primary text-primary-foreground rounded-xl p-4 max-w-[80%] ml-auto">
                    <p className="text-sm">Какие документы нужны для поступления в МГУ?</p>
                  </div>
                  <div className="bg-muted rounded-xl p-4 max-w-[80%]">
                    <p className="text-sm">Для поступления в МГУ понадобятся: результаты ЕГЭ, аттестат, паспорт, фотографии 3x4...</p>
                  </div>
                </div>
              </div>
              <div className="absolute -z-10 top-4 left-4 right-4 bottom-4 bg-primary/20 rounded-2xl blur-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="gradient-hero rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-6">
                Готов начать свой путь?
              </h2>
              <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-8">
                Присоединяйся к тысячам абитуриентов, которые уже используют EduPath 
                для подготовки к поступлению
              </p>
              <Link to="/auth?mode=register">
                <Button size="xl" className="bg-background text-foreground hover:bg-background/90">
                  Создать аккаунт бесплатно
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold">EduPath</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 EduPath. Все права защищены.
          </p>
        </div>
      </footer>
    </div>
  );
}
