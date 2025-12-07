import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  Calculator,
  ClipboardList,
  FolderOpen,
  Search,
  ArrowRight,
  Sparkles,
  TrendingUp
} from 'lucide-react';

const quickActions = [
  {
    icon: MessageSquare,
    title: 'ИИ-консультант',
    description: 'Задайте вопрос о поступлении',
    path: '/dashboard/ai',
    gradient: 'gradient-hero'
  },
  {
    icon: Calculator,
    title: 'Калькулятор GPA',
    description: 'Рассчитайте средний балл',
    path: '/dashboard/gpa',
    gradient: 'gradient-accent'
  },
  {
    icon: Search,
    title: 'Поиск университетов',
    description: 'Найдите подходящий вуз',
    path: '/dashboard/universities',
    gradient: 'bg-warning'
  }
];

const tools = [
  { icon: ClipboardList, title: 'Экзамены', path: '/dashboard/exams', count: 0 },
  { icon: FolderOpen, title: 'Проекты', path: '/dashboard/projects', count: 0 },
];

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Пользователь';

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto animate-fade-in">
        {/* Welcome section */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">
            Привет, {firstName}! 👋
          </h1>
          <p className="text-muted-foreground">
            Продолжайте подготовку к поступлению. Вот что можно сделать сегодня.
          </p>
        </div>

        {/* Quick actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.path}
              className="group relative overflow-hidden rounded-2xl p-6 text-primary-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`absolute inset-0 ${action.gradient}`} />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <action.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-1">{action.title}</h3>
                <p className="text-primary-foreground/80 text-sm">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* AI Tip */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-lg mb-1">Совет от ИИ</h3>
              <p className="text-muted-foreground mb-4">
                Начните с определения своих сильных сторон и интересов. 
                Это поможет выбрать подходящую программу обучения и университет.
              </p>
              <Link to="/dashboard/ai">
                <Button variant="accent" size="sm">
                  Обсудить с консультантом
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Tools grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {tools.map((tool, index) => (
            <Link
              key={index}
              to={tool.path}
              className="bg-card rounded-xl border border-border p-5 hover:border-primary/30 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <tool.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-2xl font-display font-bold text-muted-foreground">{tool.count}</span>
              </div>
              <h3 className="font-medium">{tool.title}</h3>
              <p className="text-sm text-muted-foreground">Нажмите, чтобы добавить</p>
            </Link>
          ))}
        </div>

        {/* Progress section placeholder */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="font-display font-semibold">Ваш прогресс</h3>
              <p className="text-sm text-muted-foreground">Заполните профиль для отслеживания</p>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-[15%] gradient-hero rounded-full" />
          </div>
          <p className="text-sm text-muted-foreground mt-2">15% выполнено</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
