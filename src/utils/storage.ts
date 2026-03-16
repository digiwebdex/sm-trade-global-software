// Storage utility - kept minimal for localStorage session management only

export const storage = {
  getSettings: () => {
    try {
      const item = localStorage.getItem('companySettings');
      return item ? JSON.parse(item) : {
        name: 'S. M. Trade International',
        tagline: '1st Class Govt. Contractor, Supplier & Importer',
        address: 'House # 7, Road # 19/A, Sector # 4, Uttara, Dhaka-1230',
        phone: '+8801886766688',
        email: 'info@smtradeint.com',
        website: 'www.smtradeint.com',
        logo: '',
      };
    } catch {
      return {};
    }
  },
  saveSettings: (settings: any) => localStorage.setItem('companySettings', JSON.stringify(settings)),
};
