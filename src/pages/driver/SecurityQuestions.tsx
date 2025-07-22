
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import DriverSidebar from '@/components/driver/DriverSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldQuestion, Mail } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const SecurityQuestionsContent = () => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { data: profileData } = useProfile();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [questions, setQuestions] = useState({
    question1: '',
    answer1: '',
    question2: '',
    answer2: '',
    question3: '',
    answer3: ''
  });

  const [hasExistingQuestions, setHasExistingQuestions] = useState(false);
  const userEmail = profileData?.email || user?.email || '';

  useEffect(() => {
    const fetchSecurityQuestions = async () => {
      if (!isLoggedIn || !user) {
        navigate('/login');
        return;
      }

      try {
        // Check if the user already has security questions
        const { data, error } = await supabase
          .from('security_questions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setQuestions({
            question1: data.question_1,
            answer1: data.answer_1,
            question2: data.question_2,
            answer2: data.answer_2,
            question3: data.question_3,
            answer3: data.answer_3
          });
          setHasExistingQuestions(true);
        }
      } catch (error) {
        console.error('Error fetching security questions:', error);
        toast.error(t('errorFetchingSecurityQuestions'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSecurityQuestions();
  }, [user, isLoggedIn, navigate, t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuestions(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // Validate all fields are filled
    if (!questions.question1 || !questions.answer1 || 
        !questions.question2 || !questions.answer2 || 
        !questions.question3 || !questions.answer3) {
      toast.error(t('allFieldsRequired'));
      setIsSaving(false);
      return;
    }

    try {
      // Get the user's email from profile
      const email = profileData?.email || user?.email;
      
      if (!email) {
        toast.error('Email address not found');
        setIsSaving(false);
        return;
      }

      if (hasExistingQuestions) {
        // Update existing questions
        const { error } = await supabase
          .from('security_questions')
          .update({
            question_1: questions.question1,
            answer_1: questions.answer1,
            question_2: questions.question2,
            answer_2: questions.answer2,
            question_3: questions.question3,
            answer_3: questions.answer3,
            email: email,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) throw error;
        toast.success(t('securityQuestionsUpdated'));
      } else {
        // Insert new questions
        const { error } = await supabase
          .from('security_questions')
          .insert({
            user_id: user.id,
            email: email,
            question_1: questions.question1,
            answer_1: questions.answer1,
            question_2: questions.question2,
            answer_2: questions.answer2,
            question_3: questions.question3,
            answer_3: questions.answer3
          });

        if (error) throw error;
        setHasExistingQuestions(true);
        toast.success(t('securityQuestionsCreated'));
      }
    } catch (error) {
      console.error('Error saving security questions:', error);
      toast.error(t('errorSavingSecurityQuestions'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <DriverSidebar />
        <main className="flex-1 p-6 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-safedrop-primary"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DriverSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-safedrop-primary">{t('securityQuestions')}</h1>
        
        <Card className="bg-white rounded-lg shadow-md max-w-2xl mb-6">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t('emailForRecovery')}
            </CardTitle>
            <CardDescription>
              {t('emailForRecoveryDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Alert className="mb-4">
              <AlertTitle className="font-semibold">{t('importantNote')}</AlertTitle>
              <AlertDescription>
                {t('useThisEmailForRecovery')}
              </AlertDescription>
            </Alert>
            <div className="border p-4 rounded-md bg-gray-50">
              <Label htmlFor="email">{t('email')}</Label>
              <div className="flex items-center mt-2">
                <Input
                  id="email"
                  name="email"
                  value={userEmail}
                  readOnly
                  className="bg-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white rounded-lg shadow-md max-w-2xl">
          <CardHeader>
            <CardTitle>{t('setupSecurityQuestions')}</CardTitle>
            <CardDescription>
              {t('securityQuestionsDescription')}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="question1">{t('securityQuestion')} 1</Label>
                  <Input
                    id="question1"
                    name="question1"
                    value={questions.question1}
                    onChange={handleChange}
                    placeholder={t('securityQuestionPlaceholder')}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="answer1">{t('securityAnswer')} 1</Label>
                  <Input
                    id="answer1"
                    name="answer1"
                    value={questions.answer1}
                    onChange={handleChange}
                    placeholder={t('securityAnswerPlaceholder')}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="question2">{t('securityQuestion')} 2</Label>
                  <Input
                    id="question2"
                    name="question2"
                    value={questions.question2}
                    onChange={handleChange}
                    placeholder={t('securityQuestionPlaceholder')}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="answer2">{t('securityAnswer')} 2</Label>
                  <Input
                    id="answer2"
                    name="answer2"
                    value={questions.answer2}
                    onChange={handleChange}
                    placeholder={t('securityAnswerPlaceholder')}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="question3">{t('securityQuestion')} 3</Label>
                  <Input
                    id="question3"
                    name="question3"
                    value={questions.question3}
                    onChange={handleChange}
                    placeholder={t('securityQuestionPlaceholder')}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="answer3">{t('securityAnswer')} 3</Label>
                  <Input
                    id="answer3"
                    name="answer3"
                    value={questions.answer3}
                    onChange={handleChange}
                    placeholder={t('securityAnswerPlaceholder')}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="bg-safedrop-gold hover:bg-safedrop-gold/90"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('saving')}
                  </>
                ) : hasExistingQuestions ? t('updateSecurityQuestions') : t('saveSecurityQuestions')}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
};

const SecurityQuestions = () => {
  return (
    <LanguageProvider>
      <SecurityQuestionsContent />
    </LanguageProvider>
  );
};

export default SecurityQuestions;
