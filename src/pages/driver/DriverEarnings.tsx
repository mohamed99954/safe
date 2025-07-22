
import { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DriverSidebar from '@/components/driver/DriverSidebar';
import { DollarSign, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

const DriverEarningsContent = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    today: 0,
    weekly: 0,
    monthly: 0
  });

  useEffect(() => {
    const fetchEarnings = async () => {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from('driver_earnings')
          .select('*')
          .eq('driver_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setEarnings(data || []);

        // Calculate summaries
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const weekStart = new Date(now.setDate(now.getDate() - 7)).toISOString();
        const monthStart = new Date(now.setDate(now.getDate() - 30)).toISOString();
        
        const todayEarnings = data?.filter(e => e.created_at.startsWith(today)).reduce((sum, e) => sum + Number(e.amount), 0);
        const weeklyEarnings = data?.filter(e => e.created_at >= weekStart).reduce((sum, e) => sum + Number(e.amount), 0);
        const monthlyEarnings = data?.filter(e => e.created_at >= monthStart).reduce((sum, e) => sum + Number(e.amount), 0);
        
        setSummary({
          today: todayEarnings,
          weekly: weeklyEarnings,
          monthly: monthlyEarnings
        });
      } catch (error) {
        console.error('Error fetching earnings:', error);
      }
    };
    
    fetchEarnings();
  }, [user]);

  // Prepare chart data
  const chartData = earnings.slice(0, 7).map(earning => ({
    name: format(new Date(earning.created_at), 'dd/MM'),
    amount: Number(earning.amount)
  })).reverse();

  const currencySymbol = t('currency');
  
  return (
    <div className="flex h-screen bg-gray-50">
      <DriverSidebar />
      
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-xl font-bold text-gray-900">{t('earnings')}</h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{t('todayEarnings')}</p>
                      <p className="text-2xl font-bold mt-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {summary.today} {currencySymbol}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{t('weeklyEarnings')}</p>
                      <p className="text-2xl font-bold mt-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {summary.weekly} {currencySymbol}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{t('monthlyEarnings')}</p>
                      <p className="text-2xl font-bold mt-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {summary.monthly} {currencySymbol}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-center">{t('earningsAnalysis')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} ${currencySymbol}`, t('totalEarnings')]} />
                      <Line type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              {/* Additional earnings information could go here */}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

const DriverEarnings = () => {
  return (
    <LanguageProvider>
      <DriverEarningsContent />
    </LanguageProvider>
  );
};

export default DriverEarnings;
