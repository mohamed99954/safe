
import { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DriverSidebar from '@/components/driver/DriverSidebar';
import { UserIcon, FileTextIcon, ShieldIcon } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const DriverProfileContent = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  });
  const [documentData, setDocumentData] = useState({
    nationalId: '',
    licenseNumber: '',
    nationalIdExpiry: '',
    licenseExpiry: ''
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) return;
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) throw profileError;

        const { data: driverData, error: driverError } = await supabase
          .from('drivers')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (driverError) throw driverError;
        
        setProfileData({
          firstName: profileData.first_name || '',
          lastName: profileData.last_name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          address: profileData.address || ''
        });
        
        setDocumentData({
          nationalId: driverData.national_id || '',
          licenseNumber: driverData.license_number || '',
          nationalIdExpiry: '',
          licenseExpiry: ''
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error(t('errorLoadingProfile'));
      }
    };
    
    fetchProfileData();
  }, [user, t]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          phone: profileData.phone,
          address: profileData.address
        })
        .eq('id', user?.id);
      
      if (profileError) throw profileError;
      toast.success(t('profileUpdatedSuccessfully'));
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('errorUpdatingProfile'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success(t('documentsUploadedSuccessfully'));
    }, 1500);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <DriverSidebar />
      
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-xl font-bold text-gray-900">{t('profile')}</h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="w-full grid grid-cols-2 mb-6">
                <TabsTrigger value="profile">
                  <UserIcon className="h-4 w-4 mr-2" />
                  {t('personalInformation')}
                </TabsTrigger>
                <TabsTrigger value="documents">
                  <FileTextIcon className="h-4 w-4 mr-2" />
                  {t('documents')}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('personalInformation')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">{t('firstName')}</Label>
                          <Input 
                            id="firstName" 
                            value={profileData.firstName} 
                            onChange={e => setProfileData({
                              ...profileData,
                              firstName: e.target.value
                            })} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">{t('lastName')}</Label>
                          <Input 
                            id="lastName" 
                            value={profileData.lastName} 
                            onChange={e => setProfileData({
                              ...profileData,
                              lastName: e.target.value
                            })} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">{t('email')}</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={profileData.email} 
                            onChange={e => setProfileData({
                              ...profileData,
                              email: e.target.value
                            })} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">{t('phone')}</Label>
                          <Input 
                            id="phone" 
                            value={profileData.phone} 
                            onChange={e => setProfileData({
                              ...profileData,
                              phone: e.target.value
                            })} 
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="address">{t('address')}</Label>
                          <Input 
                            id="address" 
                            value={profileData.address} 
                            onChange={e => setProfileData({
                              ...profileData,
                              address: e.target.value
                            })} 
                          />
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="bg-safedrop-gold hover:bg-safedrop-gold/90 mt-4" 
                        disabled={isLoading}
                      >
                        {isLoading ? t('savingChanges') : t('saveChanges')}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="documents" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('documents')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleDocumentUpload} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nationalId">{t('nationalId')}</Label>
                          <Input 
                            id="nationalId" 
                            value={documentData.nationalId} 
                            onChange={e => setDocumentData({
                              ...documentData,
                              nationalId: e.target.value
                            })} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="nationalIdExpiry">{t('nationalIdExpiry')}</Label>
                          <Input 
                            id="nationalIdExpiry" 
                            type="date" 
                            value={documentData.nationalIdExpiry} 
                            onChange={e => setDocumentData({
                              ...documentData,
                              nationalIdExpiry: e.target.value
                            })} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="licenseNumber">{t('licenseNumber')}</Label>
                          <Input 
                            id="licenseNumber" 
                            value={documentData.licenseNumber} 
                            onChange={e => setDocumentData({
                              ...documentData,
                              licenseNumber: e.target.value
                            })} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="licenseExpiry">{t('licenseExpiry')}</Label>
                          <Input 
                            id="licenseExpiry" 
                            type="date" 
                            value={documentData.licenseExpiry} 
                            onChange={e => setDocumentData({
                              ...documentData,
                              licenseExpiry: e.target.value
                            })} 
                          />
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="bg-safedrop-gold hover:bg-safedrop-gold/90 mt-6" 
                        disabled={isLoading}
                      >
                        {isLoading ? t('uploadingDocuments') : t('uploadDocuments')}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">{t('documentStatus')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-md border border-green-200">
                        <div className="flex items-center gap-2">
                          <ShieldIcon className="h-5 w-5 text-green-600" />
                          <span>{t('nationalId')}</span>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">{t('approved')}</span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-md border border-green-200">
                        <div className="flex items-center gap-2">
                          <ShieldIcon className="h-5 w-5 text-green-600" />
                          <span>{t('licenseNumber')}</span>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">{t('approved')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

const DriverProfile = () => {
  return (
    <LanguageProvider>
      <DriverProfileContent />
    </LanguageProvider>
  );
};

export default DriverProfile;
