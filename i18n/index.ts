import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Common
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',
      'common.cancel': 'Cancel',
      'common.confirm': 'Confirm',
      'common.save': 'Save',
      'common.edit': 'Edit',
      'common.delete': 'Delete',
      'common.search': 'Search',
      'common.filter': 'Filter',
      'common.reset': 'Reset',
      'common.back': 'Back',
      'common.next': 'Next',
      'common.previous': 'Previous',
      
      // Navigation
      'nav.dashboard': 'Dashboard',
      'nav.profile': 'Profile',
      'nav.notifications': 'Notifications',
      'nav.logout': 'Logout',
      'nav.login': 'Login',
      'nav.register': 'Register',
      
      // Job Request Form
      'job.title': 'Post a New Job',
      'job.category': 'Service Category',
      'job.description': 'Describe the problem',
      'job.location': 'Location',
      'job.budget': 'Proposed Budget (MAD)',
      'job.urgency': 'Urgency Level',
      'job.urgency.low': 'Low - Flexible timing',
      'job.urgency.medium': 'Medium - Within a week',
      'job.urgency.high': 'High - ASAP',
      'job.notes': 'Additional Notes (Optional)',
      'job.upload': 'Upload a Photo/Video (optional)',
      'job.submit': 'Submit Job Request',
      'job.creating': 'Creating...',
      
      // Validation Messages
      'validation.required': 'This field is required',
      'validation.email': 'Please enter a valid email address',
      'validation.phone': 'Please enter a valid Moroccan phone number',
      'validation.minLength': 'Must be at least {{min}} characters',
      'validation.maxLength': 'Cannot exceed {{max}} characters',
      'validation.minPrice': 'Minimum price is {{min}} MAD',
      'validation.maxPrice': 'Maximum price is {{max}} MAD',
      
      // Search & Filters
      'search.title': 'Search Filters',
      'search.location': 'Location',
      'search.priceRange': 'Price Range',
      'search.rating': 'Minimum Rating',
      'search.availability': 'Availability',
      'search.distance': 'Max Distance',
      'search.categories': 'Service Categories',
      'search.verifiedOnly': 'Show only verified artisans',
      'search.moreFilters': 'More Filters',
      'search.lessFilters': 'Less Filters',
      'search.searchArtisans': 'Search Artisans',
      'search.searching': 'Searching...',
      
      // Artisan Dashboard
      'artisan.dashboard.title': 'Artisan Dashboard',
      'artisan.availableJobs': 'Available Jobs',
      'artisan.myBids': 'My Bids',
      'artisan.inProgress': 'In Progress',
      'artisan.completed': 'Completed',
      'artisan.disputed': 'Disputed',
      
      // Customer Dashboard
      'customer.dashboard.title': 'Customer Dashboard',
      'customer.myJobs': 'My Jobs',
      'customer.createJob': 'Create New Job',
      
      // Notifications
      'notification.newBid': 'New bid received: {{amount}} MAD',
      'notification.jobUpdated': 'Job status updated: {{status}}',
      'notification.paymentCompleted': 'Payment completed',
      'notification.jobCreated': 'Job request created successfully!',
      'notification.profileUpdated': 'Profile updated successfully!',
      
      // Error Messages
      'error.jobCreateFailed': 'Failed to create job request. Please try again.',
      'error.connectionFailed': 'Connection failed',
      'error.somethingWrong': 'Something went wrong',
      'error.tryAgain': 'Try Again',
      'error.reloadPage': 'Reload Page',
      'error.unexpected': 'We\'re sorry, but something unexpected happened. Please try again.',
    },
  },
  fr: {
    translation: {
      // Common
      'common.loading': 'Chargement...',
      'common.error': 'Erreur',
      'common.success': 'Succès',
      'common.cancel': 'Annuler',
      'common.confirm': 'Confirmer',
      'common.save': 'Sauvegarder',
      'common.edit': 'Modifier',
      'common.delete': 'Supprimer',
      'common.search': 'Rechercher',
      'common.filter': 'Filtrer',
      'common.reset': 'Réinitialiser',
      'common.back': 'Retour',
      'common.next': 'Suivant',
      'common.previous': 'Précédent',
      
      // Navigation
      'nav.dashboard': 'Tableau de bord',
      'nav.profile': 'Profil',
      'nav.notifications': 'Notifications',
      'nav.logout': 'Se déconnecter',
      'nav.login': 'Se connecter',
      'nav.register': 'S\'inscrire',
      
      // Job Request Form
      'job.title': 'Publier un nouveau travail',
      'job.category': 'Catégorie de service',
      'job.description': 'Décrivez le problème',
      'job.location': 'Localisation',
      'job.budget': 'Budget proposé (MAD)',
      'job.urgency': 'Niveau d\'urgence',
      'job.urgency.low': 'Faible - Timing flexible',
      'job.urgency.medium': 'Moyen - Dans une semaine',
      'job.urgency.high': 'Élevé - ASAP',
      'job.notes': 'Notes supplémentaires (Optionnel)',
      'job.upload': 'Télécharger une photo/vidéo (optionnel)',
      'job.submit': 'Soumettre la demande',
      'job.creating': 'Création...',
      
      // Validation Messages
      'validation.required': 'Ce champ est requis',
      'validation.email': 'Veuillez entrer une adresse email valide',
      'validation.phone': 'Veuillez entrer un numéro de téléphone marocain valide',
      'validation.minLength': 'Doit contenir au moins {{min}} caractères',
      'validation.maxLength': 'Ne peut pas dépasser {{max}} caractères',
      'validation.minPrice': 'Le prix minimum est {{min}} MAD',
      'validation.maxPrice': 'Le prix maximum est {{max}} MAD',
      
      // Search & Filters
      'search.title': 'Filtres de recherche',
      'search.location': 'Localisation',
      'search.priceRange': 'Gamme de prix',
      'search.rating': 'Note minimale',
      'search.availability': 'Disponibilité',
      'search.distance': 'Distance maximale',
      'search.categories': 'Catégories de service',
      'search.verifiedOnly': 'Afficher seulement les artisans vérifiés',
      'search.moreFilters': 'Plus de filtres',
      'search.lessFilters': 'Moins de filtres',
      'search.searchArtisans': 'Rechercher des artisans',
      'search.searching': 'Recherche...',
      
      // Artisan Dashboard
      'artisan.dashboard.title': 'Tableau de bord artisan',
      'artisan.availableJobs': 'Travaux disponibles',
      'artisan.myBids': 'Mes offres',
      'artisan.inProgress': 'En cours',
      'artisan.completed': 'Terminé',
      'artisan.disputed': 'Contesté',
      
      // Customer Dashboard
      'customer.dashboard.title': 'Tableau de bord client',
      'customer.myJobs': 'Mes travaux',
      'customer.createJob': 'Créer un nouveau travail',
      
      // Notifications
      'notification.newBid': 'Nouvelle offre reçue: {{amount}} MAD',
      'notification.jobUpdated': 'Statut du travail mis à jour: {{status}}',
      'notification.paymentCompleted': 'Paiement terminé',
      'notification.jobCreated': 'Demande de travail créée avec succès!',
      'notification.profileUpdated': 'Profil mis à jour avec succès!',
      
      // Error Messages
      'error.jobCreateFailed': 'Échec de la création de la demande. Veuillez réessayer.',
      'error.connectionFailed': 'Échec de la connexion',
      'error.somethingWrong': 'Quelque chose s\'est mal passé',
      'error.tryAgain': 'Réessayer',
      'error.reloadPage': 'Recharger la page',
      'error.unexpected': 'Nous sommes désolés, mais quelque chose d\'inattendu s\'est produit. Veuillez réessayer.',
    },
  },
  ar: {
    translation: {
      // Common
      'common.loading': 'جاري التحميل...',
      'common.error': 'خطأ',
      'common.success': 'نجح',
      'common.cancel': 'إلغاء',
      'common.confirm': 'تأكيد',
      'common.save': 'حفظ',
      'common.edit': 'تعديل',
      'common.delete': 'حذف',
      'common.search': 'بحث',
      'common.filter': 'فلتر',
      'common.reset': 'إعادة تعيين',
      'common.back': 'رجوع',
      'common.next': 'التالي',
      'common.previous': 'السابق',
      
      // Navigation
      'nav.dashboard': 'لوحة التحكم',
      'nav.profile': 'الملف الشخصي',
      'nav.notifications': 'الإشعارات',
      'nav.logout': 'تسجيل الخروج',
      'nav.login': 'تسجيل الدخول',
      'nav.register': 'إنشاء حساب',
      
      // Job Request Form
      'job.title': 'نشر عمل جديد',
      'job.category': 'فئة الخدمة',
      'job.description': 'وصف المشكلة',
      'job.location': 'الموقع',
      'job.budget': 'الميزانية المقترحة (درهم)',
      'job.urgency': 'مستوى الأولوية',
      'job.urgency.low': 'منخفض - توقيت مرن',
      'job.urgency.medium': 'متوسط - خلال أسبوع',
      'job.urgency.high': 'عالي - عاجل',
      'job.notes': 'ملاحظات إضافية (اختياري)',
      'job.upload': 'رفع صورة/فيديو (اختياري)',
      'job.submit': 'إرسال طلب العمل',
      'job.creating': 'جاري الإنشاء...',
      
      // Validation Messages
      'validation.required': 'هذا الحقل مطلوب',
      'validation.email': 'يرجى إدخال عنوان بريد إلكتروني صالح',
      'validation.phone': 'يرجى إدخال رقم هاتف مغربي صالح',
      'validation.minLength': 'يجب أن يكون {{min}} أحرف على الأقل',
      'validation.maxLength': 'لا يمكن أن يتجاوز {{max}} حرف',
      'validation.minPrice': 'الحد الأدنى للسعر {{min}} درهم',
      'validation.maxPrice': 'الحد الأقصى للسعر {{max}} درهم',
      
      // Search & Filters
      'search.title': 'فلاتر البحث',
      'search.location': 'الموقع',
      'search.priceRange': 'نطاق السعر',
      'search.rating': 'أقل تقييم',
      'search.availability': 'التوفر',
      'search.distance': 'أقصى مسافة',
      'search.categories': 'فئات الخدمة',
      'search.verifiedOnly': 'عرض الحرفيين المؤكدين فقط',
      'search.moreFilters': 'المزيد من الفلاتر',
      'search.lessFilters': 'فلاتر أقل',
      'search.searchArtisans': 'البحث عن حرفيين',
      'search.searching': 'جاري البحث...',
      
      // Artisan Dashboard
      'artisan.dashboard.title': 'لوحة تحكم الحرفي',
      'artisan.availableJobs': 'الأعمال المتاحة',
      'artisan.myBids': 'عروضي',
      'artisan.inProgress': 'قيد التنفيذ',
      'artisan.completed': 'مكتمل',
      'artisan.disputed': 'متنازع عليه',
      
      // Customer Dashboard
      'customer.dashboard.title': 'لوحة تحكم العميل',
      'customer.myJobs': 'أعمالي',
      'customer.createJob': 'إنشاء عمل جديد',
      
      // Notifications
      'notification.newBid': 'عرض جديد: {{amount}} درهم',
      'notification.jobUpdated': 'تم تحديث حالة العمل: {{status}}',
      'notification.paymentCompleted': 'تم الدفع',
      'notification.jobCreated': 'تم إنشاء طلب العمل بنجاح!',
      'notification.profileUpdated': 'تم تحديث الملف الشخصي بنجاح!',
      
      // Error Messages
      'error.jobCreateFailed': 'فشل في إنشاء طلب العمل. يرجى المحاولة مرة أخرى.',
      'error.connectionFailed': 'فشل في الاتصال',
      'error.somethingWrong': 'حدث خطأ ما',
      'error.tryAgain': 'حاول مرة أخرى',
      'error.reloadPage': 'إعادة تحميل الصفحة',
      'error.unexpected': 'نعتذر، لكن حدث شيء غير متوقع. يرجى المحاولة مرة أخرى.',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
