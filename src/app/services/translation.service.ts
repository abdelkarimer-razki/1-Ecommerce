import { Injectable, ApplicationRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private activeLang = new BehaviorSubject<'FR' | 'EN' | 'AR'>('FR');
  activeLang$ = this.activeLang.asObservable();

  private dictionary: { [key: string]: { FR: string; EN: string; AR: string } } = {
    // Top menu / navbar
    'COOPERATIVE': { FR: 'COOPÉRATIVE BAB MANSOUR', EN: 'BAB MANSOUR COOPERATIVE', AR: 'تعاونية باب منصور' },
    'ACCUEIL': { FR: 'À Propos', EN: 'About Us', AR: 'من نحن' },
    'SHOPPING': { FR: 'Shopping', EN: 'Shopping', AR: 'المتجر' },
    'DASHBOARD': { FR: 'Dashboard', EN: 'Dashboard', AR: 'لوحة التحكم' },
    'CONNEXION': { FR: 'Connexion', EN: 'Login', AR: 'تسجيل الدخول' },
    'INSCRIPTION': { FR: "S'inscrire", EN: 'Sign Up', AR: 'إنشاء حساب' },
    'MES_COMMANDES': { FR: 'Mes commandes', EN: 'My Orders', AR: 'طلباتي' },
    'DECONNEXION': { FR: 'Se déconnecter', EN: 'Logout', AR: 'تسجيل الخروج' },

    // Categories / filters
    'CATEGORIES': { FR: 'Catégories', EN: 'Categories', AR: 'الفئات' },
    'PRODUITS': { FR: 'Produits', EN: 'Products', AR: 'المنتجات' },
    'TOUS_PRODUITS': { FR: 'Tous les produits', EN: 'All Products', AR: 'جميع المنتجات' },
    'TOUTES_CATEGORIES': { FR: 'Toutes les catégories', EN: 'All Categories', AR: 'جميع الفئات' },
    'TYPE': { FR: 'Comestibilité', EN: 'Type', AR: 'النوع' },
    'TOUS_TYPES': { FR: 'Tous les types', EN: 'All Types', AR: 'جميع الأنواع' },
    'COMESTIBLE': { FR: 'Comestible / Alimentation', EN: 'Edible / Food', AR: 'غذائي' },
    'NON_COMESTIBLE': { FR: 'Non-comestible / Cosmétique', EN: 'Non-edible / Cosmetics', AR: 'تجميلي' },
    'PROMOTION': { FR: 'Promotion', EN: 'Promotion', AR: 'العروض' },
    'TOUS_STATUTS': { FR: 'Tous les statuts', EN: 'All Statuses', AR: 'جميع الحالات' },
    'EN_PROMO': { FR: 'En promotion', EN: 'On Promotion', AR: 'في العرض' },
    'HORS_PROMO': { FR: 'Prix normal', EN: 'Normal Price', AR: 'السعر العادي' },
    'PRIX': { FR: 'Prix (DH)', EN: 'Price (DH)', AR: 'السعر (درهم)' },
    'TRIER_PAR': { FR: 'Trier par', EN: 'Sort By', AR: 'ترتيب حسب' },
    'TRI_DEFAUT': { FR: 'Défaut (Pertinence)', EN: 'Default (Relevance)', AR: 'الافتراضي' },
    'PRIX_CROISSANT': { FR: 'Prix croissant', EN: 'Price: Low to High', AR: 'السعر: من الأقل للأعلى' },
    'PRIX_DECROISSANT': { FR: 'Prix décroissant', EN: 'Price: High to Low', AR: 'السعر: من الأعلى للأقل' },
    'NOM_AZ': { FR: 'Nom (A-Z)', EN: 'Name (A-Z)', AR: 'الاسم (أ-ي)' },
    'NOM_ZA': { FR: 'Nom (Z-A)', EN: 'Name (Z-A)', AR: 'الاسم (ي-أ)' },
    'REINITIALISER': { FR: 'Réinitialiser', EN: 'Reset', AR: 'إعادة تعيين' },
    'FILTRER_TRIER': { FR: 'Filtrer & Trier', EN: 'Filter & Sort', AR: 'تصفية وترتيب' },
    'RECHERCHER_PLACEHOLDER': { FR: 'Rechercher par nom ou description (ex: Miel...)', EN: 'Search by name or description (e.g. Honey...)', AR: 'ابحث بالاسم أو الوصف (مثال: عسل...)' },

    // Shopping List / Catalog
    'MISE_EN_AVANT': { FR: 'Mise en avant', EN: 'Featured', AR: 'مميز' },
    'DECOUVRIR': { FR: 'Découvrir', EN: 'Discover', AR: 'اكتشف المزيد' },
    'AUCUN_PRODUIT': { FR: "Aucun produit portant ce nom n'a été trouvé", EN: 'No product with this name was found', AR: 'لم يتم العثور على أي منتج بهذا الاسم' },
    'CHARGEMENT': { FR: 'Chargement...', EN: 'Loading...', AR: 'جاري التحميل...' },

    // Single Product Detail (BuyProduct)
    'QUANTITE': { FR: 'Quantité', EN: 'Quantity', AR: 'الكمية' },
    'AJOUTER_PANIER': { FR: 'Ajouter au Panier', EN: 'Add to Cart', AR: 'إضافة إلى السلة' },
    'ACHETER_MAINTENANT': { FR: 'Commander maintenant', EN: 'Order Now', AR: 'اطلب الآن' },
    'AJOUTE_PANIER_BADGE': { FR: 'Ajouté au panier !', EN: 'Added to cart!', AR: 'أضيف إلى السلة!' },
    'PRODUITS_SIMILAIRES': { FR: 'Produits similaires', EN: 'Similar Products', AR: 'منتجات مشابهة' },
    'DESCRIPTION': { FR: 'Description', EN: 'Description', AR: 'الوصف' },
    'VARIATIONS': { FR: 'Variations & Tailles', EN: 'Variations & Sizes', AR: 'الأحجام والأسعار' },
    'TAILLE': { FR: 'Taille :', EN: 'Size:', AR: 'الحجم:' },
    'LIVRAISON_GRATUITE': { FR: 'Livraison gratuite', EN: 'Free Delivery', AR: 'توصيل مجاني' },
    'VOIR_PANIER': { FR: 'Voir le panier', EN: 'View Cart', AR: 'عرض السلة' },

    // Checkout / Panier
    'VOTRE_PANIER': { FR: 'Votre Panier', EN: 'Your Cart', AR: 'سلة المشتريات' },
    'DETAILS_LIVRAISON': { FR: 'Détails de Livraison', EN: 'Delivery Details', AR: 'تفاصيل التوصيل' },
    'NOM_COMPLET': { FR: 'Nom complet', EN: 'Full Name', AR: 'الاسم الكامل' },
    'TELEPHONE': { FR: 'Téléphone', EN: 'Phone Number', AR: 'رقم الهاتف' },
    'ADRESSE': { FR: 'Adresse de livraison', EN: 'Delivery Address', AR: 'عنوان التوصيل' },
    'PASSER_COMMANDE': { FR: 'Passer la commande', EN: 'Place Order', AR: 'إتمام الطلب' },
    'PANIER_VIDE': { FR: 'Votre panier est vide.', EN: 'Your cart is empty.', AR: 'سلتك فارغة.' },
    'RETOUR_SHOPPING': { FR: 'Retourner au shopping', EN: 'Back to Shopping', AR: 'العودة للمتجر' },
    'TOTAL': { FR: 'Total', EN: 'Total', AR: 'المجموع' },
    'ARTICLES': { FR: 'Articles', EN: 'Articles', AR: 'المنتجات' },
    'PANIER_VIDE_TITLE': { FR: 'Votre panier est vide', EN: 'Your cart is empty', AR: 'سلة المشتريات فارغة' },
    'PANIER_VIDE_SUB': { FR: 'Ajoutez des produits depuis notre boutique pour passer commande.', EN: 'Add products from our shop to place an order.', AR: 'أضف منتجات من متجرنا لتتمكن من إتمام الطلب.' },
    'VOIR_BOUTIQUE': { FR: 'Voir la boutique', EN: 'View Shop', AR: 'تصفح المتجر' },
    'COMMANDE_CONFIRMEE': { FR: 'Commande confirmée !', EN: 'Order Confirmed!', AR: 'تم تأكيد الطلب!' },
    'COMMANDE_SUCCES_TEXT': { FR: 'Merci pour votre commande. Nous vous contacterons bientôt pour confirmer la livraison.', EN: 'Thank you for your order. We will contact you soon to confirm delivery.', AR: 'شكراً على طلبك. سنتصل بك قريباً لتأكيد التوصيل.' },
    'CONTINUER_ACHATS': { FR: 'Continuer mes achats', EN: 'Continue Shopping', AR: 'مواصلة التسوق' },
    'TOTAL_COMMANDE': { FR: 'Total de la commande', EN: 'Order Total', AR: 'إجمالي الطلب' },
    'VOS_COORDONNEES': { FR: 'Vos coordonnées', EN: 'Your Contact Details', AR: 'معلومات الاتصال الخاصة بك' },
    'FACULTATIF': { FR: 'facultatif', EN: 'optional', AR: 'اختياري' },
    'CONFIRMER_COMMANDE': { FR: 'Confirmer la commande', EN: 'Confirm Order', AR: 'تأكيد الطلب' },
    'SECURISE': { FR: 'Sécurisé', EN: 'Secure Connection', AR: 'آمن' },
    'LIVRAISON_RAPIDE': { FR: 'Livraison rapide', EN: 'Fast Delivery', AR: 'توصيل سريع' },
    'PRODUITS_NATURELS': { FR: 'Produits 100% naturels', EN: '100% Natural Products', AR: 'منتجات طبيعية 100%' },
    'TRAITEMENT': { FR: 'Traitement...', EN: 'Processing...', AR: 'جاري المعالجة...' },
    'FINALISER_COMMANDE': { FR: 'Finaliser ma commande', EN: 'Complete Order', AR: 'إتمام الطلب' },
    'CHECKOUT_REQUIRED_ERROR': { FR: 'Veuillez remplir votre nom complet et téléphone.', EN: 'Please fill in your full name and phone number.', AR: 'يرجى ملء الاسم الكامل ورقم الهاتف.' },
    'GENERIC_ERROR': { FR: "Une erreur s'est produite. Veuillez réessayer.", EN: 'An error occurred. Please try again.', AR: 'حدث خطأ. يرجى المحاولة مرة أخرى.' },
    'SUPPRIMER': { FR: 'Supprimer', EN: 'Delete', AR: 'حذف' },
    'UNIT': { FR: 'unité', EN: 'unit', AR: 'وحدة' },
    'ACHATS': { FR: 'Achats', EN: 'Purchases', AR: 'المشتريات' },
    'PANIER': { FR: 'Panier', EN: 'Cart', AR: 'السلة' },
    'TAILLE_LABEL': { FR: 'Taille :', EN: 'Size:', AR: 'الحجم:' },
    'QTE_LABEL': { FR: 'Qté :', EN: 'Qty:', AR: 'الكمية:' },
    'ACHETER': { FR: 'Acheter', EN: 'Buy', AR: 'شراء' },
    'RIEN_ACHETE': { FR: "Vous n'avez encore rien acheté !", EN: "You haven't bought anything yet!", AR: 'لم تقم بشراء أي شيء بعد!' },
    'PANIER_VIDE_TEXT': { FR: 'Votre panier ne contient aucun objet !', EN: 'Your cart contains no items!', AR: 'سلتك لا تحتوي على أي منتجات!' },
    'COMMENCER_ACHATS': { FR: 'Commencer vos achats', EN: 'Start Shopping', AR: 'العم البدء في التسوق' },
    'FACTURE': { FR: 'Facture', EN: 'Invoice', AR: 'الفاتورة' },
    'FINALISER_ACHAT': { FR: "Finaliser l'achat", EN: 'Complete Purchase', AR: 'إتمام الشراء' },
    'LOGIN_ERROR': { FR: 'E-mail/téléphone ou mot de passe incorrect.', EN: 'Incorrect email/phone or password.', AR: 'البريد الإلكتروني/الهاتف أو كلمة المرور غير صحيحة.' },
    'EMAIL_TEL_LABEL': { FR: 'E-mail ou Téléphone :', EN: 'Email or Phone:', AR: 'البريد الإلكتروني أو الهاتف:' },
    'PASSWORD_LABEL': { FR: 'Mot de passe :', EN: 'Password:', AR: 'كلمة المرور:' },
    'SE_CONNECTER': { FR: 'Se connecter', EN: 'Login', AR: 'تسجيل الدخول' },
    'NOUVEAU_CLIENT': { FR: 'Nouveau client ?', EN: 'New customer?', AR: 'عميل جديد؟' },
    'CREER_COMPTE': { FR: 'Créer un compte', EN: 'Create an account', AR: 'إنشاء حساب' },
    'REGISTRE_SUCCESS': { FR: 'Inscription réussie ! Redirection vers la page de connexion...', EN: 'Registration successful! Redirecting to login page...', AR: 'تم التسجيل بنجاح! جاري تحويلك لصفحة تسجيل الدخول...' },
    'NOM_LABEL': { FR: 'Nom :', EN: 'Last Name:', AR: 'النسب:' },
    'PRENOM_LABEL': { FR: 'Prénom :', EN: 'First Name:', AR: 'الاسم الأول:' },
    'TEL_EXIST_ERROR': { FR: 'Ce numéro de téléphone existe déjà.', EN: 'This phone number already exists.', AR: 'رقم الهاتف هذا مستخدم بالفعل.' },
    'EMAIL_EXIST_ERROR': { FR: 'Cet e-mail existe déjà.', EN: 'This email address already exists.', AR: 'البريد الإلكتروني هذا مستخدم بالفعل.' },
    'ADRESSE_LIVRAISON_LABEL': { FR: 'Adresse de livraison :', EN: 'Delivery Address:', AR: 'عنوان التوصيل:' },
    'DEJA_MEMBRE': { FR: 'Déjà membre ?', EN: 'Already a member?', AR: 'عضو بالفعل؟' },
    'NOS_PRINCIPES': { FR: 'Nos principes', EN: 'Our Principles', AR: 'مبادئنا' },
    'SORTES_MIELS': { FR: 'Sortes de miels', EN: 'Honey Varieties', AR: 'أنواع العسل' },
    'SORTES_HUILES': { FR: "Sortes d'huiles", EN: 'Oil Varieties', AR: 'أنواع الزيوت' },
    'MIEL': { FR: 'Miel', EN: 'Honey', AR: 'عسل' },
    'HUILE': { FR: 'Huile', EN: 'Oil', AR: 'زيت' },
    'SUIVEZ_NOUS': { FR: 'Suivez-nous sur nos plateformes :', EN: 'Follow us on our platforms:', AR: 'تابعونا على منصاتنا:' },
    'SORTES_MIELS_DESC': { FR: 'Variétés sélectionnées pour leur pureté et saveur unique.', EN: 'Varieties selected for their purity and unique flavor.', AR: 'أصناف مختارة بعناية لنقائها ونكهتها الفريدة.' },
    'SORTES_HUILES_DESC': { FR: 'Huiles vierges biologiques extraites à froid.', EN: 'Cold-pressed organic virgin oils.', AR: 'زيوت بكر عضوية معصورة على البارد.' },
    'SUIVEZ_NOUS_DESC': { FR: 'Découvrez nos actualités, coulisses et événements.', EN: 'Discover our news, behind-the-scenes and events.', AR: 'اكتشفوا آخر أخبارنا، كواليسنا وفعالياتنا.' },
    'CONTACTEZ_NOUS': { FR: 'Contactez-nous', EN: 'Contact Us', AR: 'اتصل بنا' },
    'NOM_PRENOM': { FR: 'Nom et prénom :', EN: 'Full Name:', AR: 'الاسم الكامل:' },
    'MESSAGE': { FR: 'Message :', EN: 'Message:', AR: 'الرسالة:' },
    'ENVOYER': { FR: 'Envoyer', EN: 'Send', AR: 'إرسال' },
    'DECOUVRIR_BOUTIQUE': { FR: 'Découvrir la boutique', EN: 'Discover Shop', AR: 'اكتشف المتجر' },
    'NOTRE_HISTOIRE': { FR: 'Notre Histoire', EN: 'Our Story', AR: 'قصتنا' },
    'NOTRE_HISTOIRE_TITLE': { FR: 'Depuis les Terroirs de Taroudant', EN: 'From the Lands of Taroudant', AR: 'من أراضي تارودانت' },
    'NOTRE_HISTOIRE_DESC1': { FR: "Fondée avec la vision de préserver le riche patrimoine naturel marocain, la Coopérative Bab Mansour regroupe des artisans passionnés de la région de Souss-Massa. Ce qui a commencé comme une petite initiative familiale s'est transformé en un modèle de solidarité locale.", EN: 'Founded with the vision of preserving the rich Moroccan natural heritage, the Bab Mansour Cooperative brings together passionate artisans from the Souss-Massa region. What started as a small family initiative has grown into a model of local solidarity.', AR: 'تأسست تعاونية باب منصور برؤية تهدف إلى الحفاظ على التراث الطبيعي المغربي الغني، وتضم حرفيين شغوفين من جهة سوس ماسة. ما بدأ كمبادرة عائلية صغيرة تطور ليصبح نموذجاً للتضامن المحلي.' },
    'NOTRE_HISTOIRE_DESC2': { FR: "Chaque produit que nous proposons porte en lui la chaleur du soleil marocain, le parfum des montagnes de l'Atlas et la fierté de nos coopératrices. En choisissant nos produits, vous soutenez directement une économie rurale équitable et respectueuse de l'environnement.", EN: 'Each product we offer carries with it the warmth of the Moroccan sun, the scent of the Atlas Mountains and the pride of our women members. By choosing our products, you directly support a fair rural economy that respects the environment.', AR: 'كل منتج نقدمه يحمل في طياته دفء الشمس المغربية، عبير جبال الأطلس، وفخر عضوات تعاونيتنا. باختياركم لمنتجاتنا، فإنكم تدعمون بشكل مباشر اقتصاداً قروياً عادلاً وصديقاً للبيئة.' },
    'NOS_ENGAGEMENTS': { FR: 'Nos Engagements', EN: 'Our Commitments', AR: 'التزاماتنا' },
    'ENGAGEMENT_SOCIAL_TITLE': { FR: 'Impact Social & Solidaire', EN: 'Social & Solidarity Impact', AR: 'الأثر الاجتماعي والتضامني' },
    'ENGAGEMENT_SOCIAL_DESC': { FR: 'Nous valorisons le travail des femmes rurales et garantissons une rémunération juste pour soutenir le développement communautaire.', EN: 'We value the work of rural women and guarantee fair compensation to support community development.', AR: 'نحن نثمن عمل النساء القرويات ونضمن لهن دخلاً عادلاً لدعم التنمية المجتمعية.' },
    'ENGAGEMENT_NATURAL_TITLE': { FR: 'Pureté 100% Garantie', EN: '100% Guaranteed Purity', AR: 'نقاء 100% مضمون' },
    'ENGAGEMENT_NATURAL_DESC': { FR: 'Aucun additif ni produit chimique. Nos miels et huiles conservent toutes leurs vertus nutritionnelles et gustatives.', EN: 'No additives or chemicals. Our honeys and oils preserve all their nutritional and taste benefits.', AR: 'بدون أي إضافات أو مواد كيميائية. عسلنا وزيوتنا تحافظ على كامل فوائدها الغذائية والمذاقية.' },
    'ENGAGEMENT_ECO_TITLE': { FR: 'Préservation de l’Écosystème', EN: 'Ecosystem Preservation', AR: 'الحفاظ على النظام البيئي' },
    'ENGAGEMENT_ECO_DESC': { FR: 'Pratiques agricoles et apicoles durables respectant le cycle de vie des abeilles et la biodiversité locale.', EN: 'Sustainable agricultural and beekeeping practices respecting the life cycle of bees and local biodiversity.', AR: 'ممارسات فلاحية وتربية نحل مستدامة تحترم دورة حياة النحل والتنوع البيولوجي المحلي.' },
    'LOCALISATION_COOPERATIVE': { FR: 'Localisation de la Coopérative', EN: 'Cooperative Location', AR: 'موقع التعاونية' },
    'DEFAULT_LOCATION': { FR: 'Taroudant, Maroc', EN: 'Taroudant, Morocco', AR: 'تارودانت، المغرب' },
    'NOTRE_LOCALISATION': { FR: 'Notre Localisation', EN: 'Our Location', AR: 'موقعنا' },
    'LIEN_LOCALISATION_COOPERATIVE': { FR: 'Lien Google Maps de la Coopérative', EN: 'Cooperative Google Maps Link', AR: 'رابط خرائط جوجل للتعاونية' },
    'HISTOIRE_PARAGRAPHE_1': { FR: 'Histoire (Paragraphe 1)', EN: 'Story (Paragraph 1)', AR: 'قصتنا (الفقرة 1)' },
    'HISTOIRE_PARAGRAPHE_2': { FR: 'Histoire (Paragraphe 2)', EN: 'Story (Paragraph 2)', AR: 'قصتنا (الفقرة 2)' },
    'TITRE_SECTION': { FR: 'Titre de la Section', EN: 'Section Title', AR: 'عنوان القسم' },

    // Admin Sidebar / General
    'ADMIN_PANEL': { FR: 'Administration', EN: 'Administration', AR: 'الإدارة' },
    'STATS': { FR: 'Statistiques', EN: 'Statistics', AR: 'الإحصائيات' },
    'CATEGORIES_SECTION': { FR: 'Section Catégories', EN: 'Categories Section', AR: 'قسم الفئات' },
    'COMMANDES': { FR: 'Commandes', EN: 'Orders', AR: 'الطلبـات' },
    'AJOUTER_PRODUIT': { FR: 'Ajouter un produit', EN: 'Add Product', AR: 'إضافة منتج' },
    'FILL_NAME_PHONE_ERROR': { FR: 'Veuillez remplir le nom et le téléphone du client.', EN: 'Please fill in the customer name and phone number.', AR: 'يرجى ملء اسم ورقم هاتف العميل.' },
    'ADD_PRODUCT_ERROR': { FR: 'Veuillez ajouter au moins un produit.', EN: 'Please add at least one product.', AR: 'يرجى إضافة منتج واحد على الأقل.' },
    'ADD_COMMAND_ERROR': { FR: "Erreur lors de l'ajout de la commande.", EN: 'Error adding the order.', AR: 'خطأ أثناء إضافة الطلب.' },
    'PANEL_ADMIN': { FR: 'Panel Admin', EN: 'Admin Panel', AR: 'لوحة الإدارة' },
    'PERSONNALISER': { FR: 'Personnaliser', EN: 'Customize', AR: 'تخصيص' },
    'CREER_COMMANDE_MANUELLE': { FR: 'Créer une commande manuelle', EN: 'Create manual order', AR: 'إنشاء طلب يدوي' },
    'NOUVELLE_COMMANDE_MANUELLE': { FR: 'Nouvelle commande manuelle', EN: 'New Manual Order', AR: 'طلب يدوي جديد' },
    'INFORMATIONS_CLIENT': { FR: 'Informations client', EN: 'Customer Information', AR: 'معلومات العميل' },
    'NOM_COMPLET_REQUIS': { FR: 'Nom complet *', EN: 'Full Name *', AR: 'الاسم الكامل *' },
    'TELEPHONE_REQUIS': { FR: 'Téléphone *', EN: 'Phone *', AR: 'الهاتف *' },
    'EMAIL_FACULTATIF': { FR: 'E-mail (facultatif)', EN: 'Email (optional)', AR: 'البريد الإلكتروني (اختياري)' },
    'ADRESSE_FACULTATIF': { FR: 'Adresse (facultatif)', EN: 'Address (optional)', AR: 'العنوان (اختياري)' },
    'STATUT_INITIAL': { FR: 'Statut initial', EN: 'Initial Status', AR: 'الحالة الأولية' },
    'EN_ATTENTE': { FR: 'En attente', EN: 'Pending', AR: 'في الانتظار' },
    'LIVREE_EFFECTUEE': { FR: 'Livrée / Effectuée', EN: 'Delivered / Completed', AR: 'تم التوصيل / مكتمل' },
    'AJOUTER_UN_PRODUIT': { FR: 'Ajouter un produit', EN: 'Add a product', AR: 'إضافة منتج' },
    'PRODUIT': { FR: 'Produit', EN: 'Product', AR: 'المنتج' },
    'CHOISIR_PRODUIT': { FR: '-- Choisir un produit --', EN: '-- Choose a product --', AR: '-- اختر المنتج --' },
    'TAILLE_ONLY': { FR: 'Taille', EN: 'Size', AR: 'الحجم' },
    'AJOUTER_PANIER_COMMANDE': { FR: 'Ajouter au panier de la commande', EN: 'Add to order cart', AR: 'إضافة إلى سلة الطلب' },
    'TOTAL_ESTIME': { FR: 'Total estimé', EN: 'Estimated Total', AR: 'المجموع التقديري' },
    'ANNULER': { FR: 'Annuler', EN: 'Cancel', AR: 'إلغاء' },
    'ENREGISTRER': { FR: 'Enregistrer', EN: 'Save', AR: 'حفظ' },
    'PRODUIT_HEADER': { FR: 'Produit', EN: 'Product', AR: 'المنتج' },
    'PRIX_HEADER': { FR: 'Prix (DH)', EN: 'Price (DH)', AR: 'السعر (درهم)' },
    'PROMO_HEADER': { FR: 'Promo', EN: 'Promo', AR: 'العرض' },
    'TYPE_HEADER': { FR: 'Comestibilité', EN: 'Type', AR: 'النوع' },
    'HIGHLIGHT_HEADER': { FR: 'Mise en avant', EN: 'Featured', AR: 'مميز' },
    'ACTIONS_HEADER': { FR: 'Actions', EN: 'Actions', AR: 'الإجراءات' },
    'OUI': { FR: 'Oui', EN: 'Yes', AR: 'نعم' },
    'NON': { FR: 'Non', EN: 'No', AR: 'لا' },
    'AJOUTER_CATEGORIE': { FR: 'Ajouter une catégorie', EN: 'Add Category', AR: 'إضافة فئة' },
    'CATEGORIES_DEJA_AJOUTEES': { FR: 'Catégories déjà ajoutées', EN: 'Already added categories', AR: 'الفئات المضافة بالفعل' },
    'CONFIRM_DELETE_CAT': { FR: 'Voulez-vous vraiment supprimer cette catégorie ?', EN: 'Are you sure you want to delete this category?', AR: 'هل أنت متأكد من حذف هذه الفئة؟' },
    'CONFIRM_DELETE_PROD': { FR: 'Voulez-vous vraiment supprimer ce produit ?', EN: 'Are you sure you want to delete this product?', AR: 'هل أنت متأكد من حذف هذا المنتج؟' },
    'APERCEVOIR': { FR: 'Aperçu', EN: 'Preview', AR: 'الصورة' },
    'NOM_PRODUIT': { FR: 'Nom du produit', EN: 'Product name', AR: 'اسم المنتج' },
    'PRIX_VARIATIONS': { FR: 'Prix & Variations', EN: 'Price & Variations', AR: 'السعر والأحجام' },
    'ADD_CAT_ERROR': { FR: "Erreur lors de l'ajout de la catégorie.", EN: 'Error adding category.', AR: 'خطأ أثناء إضافة الفئة.' },
    'DEFAULT_CAT_DELETE_ERROR': { FR: "Les catégories par défaut 'MIEL' et 'HUILE' ne peuvent pas être supprimées.", EN: "Default categories 'MIEL' and 'HUILE' cannot be deleted.", AR: "لا يمكن حذف الفئات الافتراضية 'MIEL' و 'HUILE'." },
    'CAT_HAS_PRODUCTS_ERROR': { FR: "Impossible de supprimer la catégorie car elle contient des produits. Veuillez d'abord modifier ou supprimer ces produits.", EN: "Cannot delete category because it contains products. Please modify or delete those products first.", AR: "لا يمكن حذف الفئة لأنها تحتوي على منتجات. يرجى تعديل أو حذف هذه المنتجات أولاً." },
    'DELETE_CAT_ERROR': { FR: "Erreur lors de la suppression de la catégorie.", EN: 'Error deleting category.', AR: 'خطأ أثناء حذف الفئة.' },
    'AJOUTER_NOUVELLE_CATEGORIE': { FR: 'Ajouter une nouvelle catégorie', EN: 'Add new category', AR: 'إضافة فئة جديدة' },
    'CREER_CATEGORIE': { FR: 'Créer la catégorie', EN: 'Create Category', AR: 'إنشاء الفئة' },
    'CATEGORIES_EXISTANTES': { FR: 'Catégories Existantes', EN: 'Existing Categories', AR: 'الفئات الموجودة' },
    'NOM_CATEGORIE_HEADER': { FR: 'Nom de la catégorie', EN: 'Category Name', AR: 'اسم الفئة' },
    'PRODUITS_ASSOCIES_HEADER': { FR: 'Produits associés', EN: 'Associated Products', AR: 'المنتجات المرتبطة' },
    'SYSTEME': { FR: 'Système', EN: 'System', AR: 'نظام' },
    'CONFIRMATION_SUPPRESSION': { FR: 'Confirmation de suppression', EN: 'Delete confirmation', AR: 'تأكيد الحذف' },
    'SUPPRIMER_CATEGORIE_QUESTION': { FR: 'Supprimer la catégorie ?', EN: 'Delete category?', AR: 'حذف الفئة؟' },
    'SUPPRIMER_CATEGORIE_WARN_START': { FR: 'Êtes-vous sûr de vouloir supprimer définitivement la catégorie ', EN: 'Are you sure you want to permanently delete the category ', AR: 'هل أنت متأكد من حذف الفئة ' },
    'SUPPRIMER_CATEGORIE_WARN_END': { FR: ' ? Cette action est irréversible.', EN: '? This action is irreversible.', AR: ' نهائياً؟ هذا الإجراء غير قابل للتراجع.' },
    'EFFECTUEE': { FR: 'Effectuées', EN: 'Completed', AR: 'مكتملة' },
    'MOIS_PRECEDENT': { FR: 'Mois précédent', EN: 'Previous Month', AR: 'الشهر السابق' },
    'MOIS_SUIVANT': { FR: 'Mois suivant', EN: 'Next Month', AR: 'الشهر التالي' },
    'EXPORTER_PDF': { FR: 'Exporter le Rapport PDF', EN: 'Export PDF Report', AR: 'تصدير تقرير PDF' },
    'TOUTES_COMMANDES_EFFECTUEES': { FR: 'Toutes les commandes ont été effectuées !', EN: 'All orders have been completed!', AR: 'تم إتمام جميع الطلبات!' },
    'CLIENT': { FR: 'Client', EN: 'Customer', AR: 'الزبون' },
    'DATE': { FR: 'Date', EN: 'Date', AR: 'التاريخ' },
    'SOURCE': { FR: 'Source', EN: 'Source', AR: 'المصدر' },
    'STATUT': { FR: 'Statut', EN: 'Status', AR: 'الحالة' },
    'MAGASIN': { FR: 'Magasin', EN: 'Store', AR: 'المحل' },
    'EN_LIGNE': { FR: 'En ligne', EN: 'Online', AR: 'عبر الإنترنت' },
    'NO_COMMANDE_MOIS': { FR: 'Aucune commande effectuée en ', EN: 'No orders completed in ', AR: 'لم يتم إتمام أي طلبات في ' },
    'COMMANDE': { FR: 'Commande', EN: 'Order', AR: 'طلب' },
    'PRODUITS_COMMANDES': { FR: 'Produits commandés', EN: 'Ordered Products', AR: 'المنتجات المطلوبة' },
    'FERMER': { FR: 'Fermer', EN: 'Close', AR: 'إغلاق' },
    'MARQUER_EFFECTUEE': { FR: 'Marquer effectuée', EN: 'Mark Completed', AR: 'تحديد كمكتمل' },
    'MARQUER_EN_ATTENTE': { FR: 'Marquer en attente', EN: 'Mark Pending', AR: 'تحديد كقيد الانتظار' },
    'SUPPRIMER_COMMANDE': { FR: 'Supprimer la commande', EN: 'Delete Order', AR: 'حذف الطلب' },
    'CONFIRM_DELETE_ORDER_START': { FR: 'Êtes-vous sûr de vouloir supprimer la commande ', EN: 'Are you sure you want to delete order ', AR: 'هل أنت متأكد من حذف الطلب ' },
    'CONFIRM_DELETE_ORDER_MID': { FR: ' de ', EN: ' of ', AR: ' الخاص بـ ' },
    'CONFIRM_DELETE_ORDER_END': { FR: ' ? Cette action est irréversible.', EN: '? This action is irreversible.', AR: '؟ هذا الإجراء غير قابل للتراجع.' },
    'SUPPRIMER_DEFINITIVEMENT': { FR: 'Supprimer définitivement', EN: 'Permanently Delete', AR: 'حذف نهائي' },
    'ENREGISTRER_COMMANDE': { FR: 'Enregistrer la commande', EN: 'Save Order', AR: 'حفظ الطلب' },
    'DETAILS': { FR: 'Détails', EN: 'Details', AR: 'التفاصيل' },

    // Dashboard Statistics Section
    'STATISTIQUES_GENERAL': { FR: 'Statistiques générales', EN: 'General Statistics', AR: 'الإحصائيات العامة' },
    'REVENU': { FR: 'Revenu', EN: 'Revenue', AR: 'الأرباح' },
    'MOIS_EN_COURS': { FR: 'Mois en cours', EN: 'Current Month', AR: 'الشهر الحالي' },
    'VISITEURS': { FR: 'Visiteurs', EN: 'Visitors', AR: 'الزوار' },
    'AUJOURDHUI': { FR: "Aujourd'hui", EN: 'Today', AR: 'اليوم' },
    'DES_LE_DEBUT': { FR: 'Dès le début', EN: 'From the beginning', AR: 'منذ البداية' },
    'REVENU_ANNUEL': { FR: 'Revenu annuel', EN: 'Annual Revenue', AR: 'الإيرادات السنوية' },
    'ANNEE_PRECEDENTE': { FR: 'Année précédente', EN: 'Previous Year', AR: 'السنة السابقة' },
    'ANNEE_SUIVANTE': { FR: 'Année suivante', EN: 'Next Year', AR: 'السنة التالية' },
    'REVENU_MENSUEL': { FR: 'Revenu mensuel', EN: 'Monthly Revenue', AR: 'الإيرادات الشهرية' },

    // Months
    'JANVIER': { FR: 'Janvier', EN: 'January', AR: 'يناير' },
    'FEVRIER': { FR: 'Février', EN: 'February', AR: 'فبراير' },
    'MARS': { FR: 'Mars', EN: 'March', AR: 'مارس' },
    'AVRIL': { FR: 'Avril', EN: 'April', AR: 'أبريل' },
    'MAI': { FR: 'Mai', EN: 'May', AR: 'مايو' },
    'JUIN': { FR: 'Juin', EN: 'June', AR: 'يونيو' },
    'JUILLET': { FR: 'Juillet', EN: 'July', AR: 'يوليو' },
    'AOUT': { FR: 'Août', EN: 'August', AR: 'أغسطس' },
    'SEPTEMBRE': { FR: 'Septembre', EN: 'September', AR: 'سبتمبر' },
    'OCTOBRE': { FR: 'Octobre', EN: 'October', AR: 'أكتوبر' },
    'NOVEMBRE': { FR: 'Novembre', EN: 'November', AR: 'نوفمبر' },
    'DECEMBRE': { FR: 'Décembre', EN: 'December', AR: 'ديسمبر' },

    // Settings Customization Section
    'PERSONNALISATION_SITE': { FR: 'Personnalisation', EN: 'Customization', AR: 'التخصيص' },
    'ENREGISTRER_MODIFICATIONS': { FR: 'Enregistrer les modifications', EN: 'Save Changes', AR: 'حفظ التغييرات' },
    'SECTION_ACCUEIL_HERO': { FR: 'Section Accueil (Hero Banner)', EN: 'Home Section (Hero Banner)', AR: 'قسم الصفحة الرئيسية (لافتة رئيسية)' },
    'TITRE_PRINCIPAL': { FR: 'Titre principal', EN: 'Main Title', AR: 'العنوان الرئيسي' },
    'SOUS_TITRE_COOP': { FR: 'Sous-titre / Coopérative', EN: 'Subtitle / Cooperative', AR: 'العنوان الفرعي / التعاونية' },
    'DESCRIPTION_MARKETING': { FR: 'Description marketing', EN: 'Marketing Description', AR: 'الوصف التسويقي' },
    'IMAGE_BG_HERO': { FR: "Image d'arrière-plan du Hero", EN: 'Hero Background Image', AR: 'صورة خلفية الواجهة' },
    'REMPLACER_IMAGE_HERO': { FR: "Remplacer l'image du Hero", EN: 'Replace Hero Image', AR: 'استبدال صورة الواجهة' },
    'PRINCIPE_1_TITRE': { FR: 'Principe 1 (Production & Méthodes)', EN: 'Principle 1 (Production & Methods)', AR: 'المبدأ 1 (الإنتاج والطرق)' },
    'TITRE': { FR: 'Titre', EN: 'Title', AR: 'العنوان' },
    'IMAGE_PRINCIPE_1': { FR: 'Image du Principe 1', EN: 'Principle 1 Image', AR: 'صورة المبدأ 1' },
    'REMPLACER_IMAGE_1': { FR: "Remplacer l'image 1", EN: 'Replace Image 1', AR: 'استبدال الصورة 1' },
    'PRINCIPE_2_TITRE': { FR: 'Principe 2 (Matières Premières & Qualité)', EN: 'Principle 2 (Raw Materials & Quality)', AR: 'المبدأ 2 (المواد الخام والجودة)' },
    'IMAGE_PRINCIPE_2': { FR: 'Image du Principe 2', EN: 'Principle 2 Image', AR: 'صورة المبدأ 2' },
    'REMPLACER_IMAGE_2': { FR: "Remplacer l'image 2", EN: 'Replace Image 2', AR: 'استبدال الصورة 2' },
    'ERR_LOAD_CONFIG': { FR: 'Impossible de charger la configuration.', EN: 'Unable to load configuration.', AR: 'تعذر تحميل الإعدادات.' },
    'SAVE_SUCCESS': { FR: 'Configuration enregistrée avec succès !', EN: 'Configuration saved successfully!', AR: 'تم حفظ الإعدادات بنجاح!' },
    'SAVE_ERROR': { FR: 'Erreur lors de la sauvegarde.', EN: 'Error saving configuration.', AR: 'خطأ أثناء حفظ الإعدادات.' },

    // Products Section Dialogs/Modals
    'HIGHLIGHT_ERROR': { FR: 'Erreur lors de la mise en avant du produit.', EN: 'Error highlighting product.', AR: 'خطأ أثناء تمييز المنتج.' },
    'REMOVE_HIGHLIGHT_TITLE': { FR: 'Retirer de la mise en avant (carrousel)', EN: 'Remove from featured (carousel)', AR: 'إزالة من الواجهة (المعرض)' },
    'ADD_HIGHLIGHT_TITLE': { FR: 'Mettre en avant (carrousel)', EN: 'Feature product (carousel)', AR: 'تمييز المنتج (المعرض)' },
    'MODIFIER_PRODUIT': { FR: 'Modifier le produit', EN: 'Edit Product', AR: 'تعديل المنتج' },
    'IMAGE_PRODUIT': { FR: 'Image du produit', EN: 'Product image', AR: 'صورة المنتج' },
    'SELECTIONNER_IMAGE': { FR: 'Sélectionner une image', EN: 'Select an image', AR: 'اختر صورة' },
    'IMAGE_FORMATS_LIMIT': { FR: 'Formats acceptés : PNG, JPG, JPEG (Max. 5 Mo)', EN: 'Accepted formats: PNG, JPG, JPEG (Max. 5 MB)', AR: 'الصيغ المقبولة: PNG, JPG, JPEG (بحد أقصى 5 ميجابايت)' },
    'SUPPRIMER_IMAGE': { FR: "Supprimer l'image", EN: 'Delete image', AR: 'حذف الصورة' },
    'DETOURAGE_INTELLIGENT': { FR: 'Détourage Intelligent', EN: 'Smart Background Removal', AR: 'إزالة الخلفية الذكية' },
    'RETIRER_FOND_SUB': { FR: 'Retirer le fond de votre image', EN: 'Remove the background of your image', AR: 'إزالة خلفية الصورة الخاصة بك' },
    'RETIRER_FOND': { FR: 'Retirer le fond', EN: 'Remove background', AR: 'إزالة الخلفية' },
    'RESTAURER': { FR: 'Restaurer', EN: 'Restore', AR: 'استعادة' },
    'SENSIBILITE_DETOURAGE': { FR: 'Sensibilité du détourage', EN: 'Removal sensitivity', AR: 'حساسية الإزالة' },
    'CREER_NOUVELLE_CATEGORIE_OPTION': { FR: '+ Créer une nouvelle catégorie...', EN: '+ Create new category...', AR: '+ إنشاء فئة جديدة...' },
    'NOM_CATEGORIE_PLACEHOLDER': { FR: 'Saisir la nouvelle catégorie (ex: AMLOU)', EN: 'Enter the new category (e.g. AMLOU)', AR: 'أدخل الفئة الجديدة (مثال: أملو)' },
    'DESCRIPTION_PRODUIT_LABEL': { FR: 'Description du produit', EN: 'Product description', AR: 'وصف المنتج' },
    'SAISIR_DESCRIPTION_PLACEHOLDER': { FR: 'Saisir la description...', EN: 'Enter the description...', AR: 'أدخل الوصف...' },
    'PRIX_BARRE_PROMO': { FR: 'Prix barré (Promo) - DH', EN: 'Strike Price (Promo) - DH', AR: 'السعر المشطوب (العرض) - درهم' },
    'VARIATIONS_TAILLE_PRIX': { FR: 'Variations (Taille & Prix)', EN: 'Variations (Size & Price)', AR: 'الأحجام والأسعار' },
    'VARIATION': { FR: 'Variation', EN: 'Variation', AR: 'الحجم' },
    'TAILLE_EXEMPLE_LABEL': { FR: 'Taille (ex: 250g, 500ml, 1L)', EN: 'Size (e.g. 250g, 500ml, 1L)', AR: 'الحجم (مثال: 250غ، 500مل، 1لتر)' },
    'DETAILS_PRODUIT': { FR: 'Détails du produit', EN: 'Product Details', AR: 'تفاصيل المنتج' },
    'AUCUNE_DESCRIPTION': { FR: 'Aucune description fournie.', EN: 'No description provided.', AR: 'لا يوجد وصف متاح.' },
    'VARIATIONS_PRIX': { FR: 'Variations & Prix', EN: 'Variations & Prices', AR: 'الأحجام والأسعار' },
    'PRIX_ORIGINAL_BARRE': { FR: 'Prix original (barré) :', EN: 'Original price (crossed):', AR: 'السعر الأصلي (المشطوب):' },
    'SUPPRIMER_PRODUIT_QUESTION': { FR: 'Supprimer le produit ?', EN: 'Delete product?', AR: 'حذف المنتج؟' },
    'SUPPRIMER_PRODUIT_WARN_START': { FR: 'Êtes-vous sûr de vouloir supprimer définitivement le produit ', EN: 'Are you sure you want to permanently delete the product ', AR: 'هل أنت متأكد من رغبتك في حذف المنتج ' },
    'SUPPRIMER_PRODUIT_WARN_END': { FR: ' ? Cette action est irréversible.', EN: ' ? This action is irreversible.', AR: ' نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.' },
    'MODIFIER': { FR: 'Modifier', EN: 'Edit', AR: 'تعديل' },
    'REQUIS': { FR: 'Requis', EN: 'Required', AR: 'مطلوب' },
    'OPTIONNEL': { FR: 'Optionnel', EN: 'Optional', AR: 'اختياري' },
    'CHAMP_REQUIS': { FR: 'Ce champ est requis.', EN: 'This field is required.', AR: 'هذا الحقل مطلوب.' },
    'RECLAMATION_ENVOYEE': { FR: 'Votre message a été envoyé avec succès !', EN: 'Your message has been sent successfully!', AR: 'تم إرسال رسالتك بنجاح!' },
    'RECLAMATION_ERROR': { FR: 'Veuillez remplir tous les champs requis.', EN: 'Please fill in all required fields.', AR: 'يرجى ملء جميع الحقول المطلوبة.' },
    'MESSAGES': { FR: 'Messages', EN: 'Messages', AR: 'الرسائل' },
    'AUCUN_MESSAGE': { FR: "Aucun message n'a été reçu.", EN: 'No messages received.', AR: 'لم يتم تلقي أي رسائل.' },
    
    // Dynamic content translations
    'PRODUIT_EXCEPTIONNEL_DEFAULT': {
      FR: "Produit d'exception, sélectionné avec soin par notre coopérative.",
      EN: "Exceptional product, carefully selected by our cooperative.",
      AR: "منتج استثنائي، تم اختياره بعناية من طرف تعاونيتنا."
    },
    'COSMETIQUES': { FR: 'Cosmétiques', EN: 'Cosmetics', AR: 'مستحضرات التجميل' },
    'AMLOU': { FR: 'Amlou', EN: 'Amlou', AR: 'أملو' },
    'SAVONS': { FR: 'Savons', EN: 'Soaps', AR: 'الصابون' },
    "MIEL D'EUCALYPTUS PREMIUM": {
      FR: "Miel d'Eucalyptus Premium",
      EN: "Premium Eucalyptus Honey",
      AR: "عسل الكالبتوس الممتاز"
    },
    "MIEL DE THYM PUR": {
      FR: "Miel de Thym Pur",
      EN: "Pure Thym Honey",
      AR: "عسل الزعتر الصافي"
    },
    "HUILE D'ARGAN ALIMENTAIRE": {
      FR: "Huile d'Argan Alimentaire",
      EN: "Culinary Argan Oil",
      AR: "زيت أركان للأكل"
    },
    "HUILE D'ARGAN COSMÉTIQUE": {
      FR: "Huile d'Argan Cosmétique",
      EN: "Cosmetic Argan Oil",
      AR: "زيت أركان للتجميل"
    },
    "HUILE D'ARGAN COSMETIQUE": {
      FR: "Huile d'Argan Cosmétique",
      EN: "Cosmetic Argan Oil",
      AR: "زيت أركان للتجميل"
    },
    "HUILE D'OLIVE EXTRA VIERGE": {
      FR: "Huile d'Olive Extra Vierge",
      EN: "Extra Virgin Olive Oil",
      AR: "زيت الزيتون البكر الممتاز"
    },
    "MIEL DE FLEURS D'EUCALYPTUS PUR RÉCOLTÉ À FROID DANS LES FORÊTS DU MOYEN ATLAS.": {
      FR: "Miel de fleurs d'Eucalyptus pur récolté à froid dans les forêts du Moyen Atlas.",
      EN: "Pure Eucalyptus honey cold-harvested in the Middle Atlas forests.",
      AR: "عسل أزهار الكالبتوس الطبيعي المستخلص على البارد من غابات الأطلس المتوسط."
    },
    "MIEL DE THYM SAUVAGE RÉPUTÉ POUR SA SAVEUR AROMATIQUE FORTE ET SES PROPRIÉTÉS ANTISEPTIQUES.": {
      FR: "Miel de thym sauvage réputé pour sa saveur aromatique forte et ses propriétés antiseptiques.",
      EN: "Wild thyme honey renowned for its strong aroma and antiseptic properties.",
      AR: "عسل الزعتر البري المعروف بنكهته العطرية القوية وخصائصه المطهرة."
    },
    "HUILE D'ARGAN TORRÉFIÉE TRADITIONNELLE BIO, AU GOÛT SUBTIL DE NOISETTE.": {
      FR: "Huile d'argan torréfiée traditionnelle bio, au goût subtil de noisette.",
      EN: "Traditional organic culinary argan oil, with a subtle hazelnut taste.",
      AR: "زيت الأركان العضوي المحمص التقليدي، بنكهة البندق الخفيفة."
    },
    "HUILE D'ARGAN PURE DE PREMIÈRE PRESSION À FROID, IDÉALE POUR L'HYDRATATION DE LA PEAU ET DES CHEVEUX.": {
      FR: "Huile d'argan pure de première pression à froid, idéale pour l'hydratation de la peau et des cheveux.",
      EN: "Pure cosmetic cold-pressed argan oil, ideal for skin and hair hydration.",
      AR: "زيت الأركان النقي من العصرة الأولى على البارد، مثالي لترطيب البشرة والشعر."
    },
    "HUILE D'OLIVE VIERGE EXTRA PRESSÉE À FROID DE LA RÉGION DE MEKNÈS.": {
      FR: "Huile d'olive vierge extra pressée à froid de la région de Meknès.",
      EN: "Extra virgin olive oil cold-pressed from the Meknes region.",
      AR: "زيت زيتون بكر ممتاز معصور على البارد من منطقة مكناس."
    },
    "250G": { FR: "250g", EN: "250g", AR: "250 غرام" },
    "500G": { FR: "500g", EN: "500g", AR: "500 غرام" },
    "1KG": { FR: "1kg", EN: "1kg", AR: "1 كيلوغرام" },
    "2KG": { FR: "2kg", EN: "2kg", AR: "2 كيلوغرام" },
    "50ML": { FR: "50ml", EN: "50ml", AR: "50 ملل" },
    "100ML": { FR: "100ml", EN: "100ml", AR: "100 ملل" },
    "250ML": { FR: "250ml", EN: "250ml", AR: "250 ملل" },
    "500ML": { FR: "500ml", EN: "500ml", AR: "500 ملل" },
    "1L": { FR: "1L", EN: "1L", AR: "1 لتر" },
    "2L": { FR: "2L", EN: "2L", AR: "2 لتر" },

    // Arabic specific styles
    'DIR_AR': { FR: 'ltr', EN: 'ltr', AR: 'rtl' },
    'ALIGN_AR': { FR: 'left', EN: 'left', AR: 'right' },
    'STATS_PRODUITS': { FR: 'Statistiques', EN: 'Statistics', AR: 'الإحصائيات' },
    'ACTUALISER': { FR: 'Actualiser', EN: 'Refresh', AR: 'تحديث' },
    'TOTAL_PRODUITS': { FR: 'Total Produits', EN: 'Total Products', AR: 'إجمالي المنتجات' },
    'ARTICLES_VENDUS': { FR: 'Articles Vendus', EN: 'Articles Sold', AR: 'السلع المباعة' },
    'TOTAL_REVENUS': { FR: "Chiffre d'Affaires", EN: 'Total Revenue', AR: 'إجمالي الإيرادات' },
    'PRODUITS_LES_PLUS_VENDUS': { FR: 'Produits les plus vendus (Top 5)', EN: 'Most Sold Products (Top 5)', AR: 'المنتجات الأكثر مبيعاً (أعلى 5)' },
    'PRODUITS_LES_PLUS_VISITES': { FR: 'Produits les plus populaires (Top 5)', EN: 'Most Visited Products (Top 5)', AR: 'المنتجات الأكثر زيارة (أعلى 5)' },
    'PRODUITS_LES_MOINS_VENDUS': { FR: 'Produits les moins vendus (Top 5)', EN: 'Least Sold Products (Top 5)', AR: 'المنتجات الأقل مبيعاً (أعلى 5)' },
    'QTE_VENDUE': { FR: 'Quantité vendue', EN: 'Quantity Sold', AR: 'الكمية المباعة' },
    'VUES': { FR: 'Vues / Clics', EN: 'Views / Clicks', AR: 'المشاهدات / النقرات' },
    'VUES_COUNT': { FR: 'vues', EN: 'views', AR: 'مشاهدة' },
    'AUCUNE_DONNEE': { FR: 'Aucune donnée disponible', EN: 'No data available', AR: 'لا توجد بيانات متاحة' },
    'PART_REVENUS_CATEGORIE': { FR: 'Répartition des Revenus par Catégorie', EN: 'Revenue Share by Category', AR: 'توزيع الإيرادات حسب الفئة' },
    'TENDANCES_VENTES_SAISONNIERES': { FR: 'Saisonnalité & Ventes Mensuelles', EN: 'Seasonality & Monthly Sales Trends', AR: 'الموسمية واتجاهات المبيعات الشهرية' },
    'TENDANCES_VENTES_7_JOURS': { FR: 'Tendances des 7 Derniers Jours', EN: 'Trends over Last 7 Days', AR: 'اتجاهات آخر 7 أيام' },
    'TENDANCES_VENTES_MOIS': { FR: 'Tendances du Mois en Cours', EN: 'Current Month Trends', AR: 'اتجاهات الشهر الحالي' },
    'CE_MOIS': { FR: 'Ce mois-ci', EN: 'This Month', AR: 'هذا الشهر' },
    'DEPUIS_DEBUT': { FR: 'Tout', EN: 'All-Time', AR: 'منذ البداية' },
    'PAGE_NON_TROUVEE': { FR: 'Oups ! Page non trouvée', EN: 'Oops! Page not found', AR: 'عذراً! الصفحة غير موجودة' },
    'PAGE_NON_TROUVEE_DESC': { FR: "La page que vous recherchez semble avoir été déplacée, supprimée ou n'existe pas.", EN: 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.', AR: 'الصفحة التي تبحث عنها قد تكون تمت إزالتها، أو تم تغيير اسمها، أو أنها غير متاحة مؤقتاً.' },
    'RETOUR_BOUTIQUE_404': { FR: 'Retourner à la boutique', EN: 'Go back to Shop', AR: 'العودة إلى المتجر' },
    'DETAILS_TARIFS': { FR: 'Détails & Tarifs', EN: 'Details & Prices', AR: 'التفاصيل والأسعار' },
    'STATISTIQUES_INDIVIDUELLES': { FR: 'Statistiques', EN: 'Statistics', AR: 'الإحصائيات' },
    'DATE_AJOUT': { FR: "Date d'ajout", EN: 'Date Added', AR: 'تاريخ الإضافة' },
    'TOTAL_VUES': { FR: 'Total des vues', EN: 'Total Views', AR: 'إجمالي المشاهدات' },
    'TOTAL_VENTES': { FR: 'Total des ventes', EN: 'Total Units Sold', AR: 'إجمالي المبيعات' },
    'REVENU_GENERE': { FR: 'Revenus générés', EN: 'Revenue Generated', AR: 'الإيرادات المحققة' },
    'VENTES_PAR_TAILLE': { FR: 'Ventes par Déclinaison', EN: 'Sales by Size', AR: 'المبيعات حسب الحجم' },
    'CONSULTATIONS_7J': { FR: 'Visites (7 derniers jours)', EN: 'Visits (Last 7 Days)', AR: 'الزيارات (آخر 7 أيام)' },
    'VUES_TODAY': { FR: "Aujourd'hui", EN: 'Today', AR: 'اليوم' },
    'VUES_MONTH': { FR: 'Ce mois', EN: 'This Month', AR: 'هذا الشهر' },
    'ONSSA_CERTIFIED': { FR: 'Certifié ONSSA', EN: 'ONSSA Certified', AR: 'مرخص من طرف أونسا' },
    'ONSSA_NUMBER': { FR: "Numéro d'autorisation ONSSA", EN: 'ONSSA Authorization Number', AR: 'رقم ترخيص أونسا' },
    'ONSSA_LABEL': { FR: 'Agrément / Autorisation ONSSA', EN: 'ONSSA Approval / Authorization', AR: 'ترخيص أونسا' },
    'ONSSA_CERTIFICATE': { FR: 'Agrément ONSSA', EN: 'ONSSA Approval', AR: 'ترخيص أونسا' },
    'ORIGINE_GARANTIE': { FR: 'Origine Garantie', EN: 'Guaranteed Origin', AR: 'أصل مضمون' },
    'ORIGINE_GARANTIE_SUB': { FR: 'Terroirs de Taroudant, Maroc', EN: 'Lands of Taroudant, Morocco', AR: 'أراضي تارودانت، المغرب' },
    'PURETE_100': { FR: '100% Naturel', EN: '100% Natural', AR: 'طبيعي 100%' },
    'PURETE_100_SUB': { FR: 'Sans aucun additif chimique', EN: 'No chemical additives', AR: 'بدون إضافات كيميائية' },
    'IMPACT_SOLIDAIRE': { FR: 'Impact Solidaire', EN: 'Social Impact', AR: 'أثر تضامني' },
    'IMPACT_SOLIDAIRE_SUB': { FR: 'Soutient les femmes rurales', EN: 'Supports rural women artisans', AR: 'يدعم النساء في العالم القروي' },
    'LIVRAISON_TRUST': { FR: 'Livraison & Paiement', EN: 'Delivery & Payment', AR: 'التوصيل والدفع' },
    'LIVRAISON_TRUST_SUB': { FR: 'Paiement cash à la livraison', EN: 'Cash on delivery payment', AR: 'الدفع عند الاستلام' },
    'ARTISANAL': { FR: 'Production Artisanale', EN: 'Artisanal Production', AR: 'إنتاج تقليدي' },
    'BOUTIQUE': { FR: 'Boutique', EN: 'Shop', AR: 'المتجر' },
    'GESTION': { FR: 'Gestion', EN: 'Management', AR: 'إدارة المتجر' },
    'RAPPORTS_STATS': { FR: 'Analyses & Rapports', EN: 'Analytics & Reports', AR: 'التقارير والإحصائيات' },
    'PARAMETRES_APP': { FR: 'Paramètres Généraux', EN: 'General Settings', AR: 'الإعدادات العامة' },
    'SETTINGS': { FR: 'Paramètres', EN: 'Settings', AR: 'الإعدادات' },
    'CHOISIR_LANGUE': { FR: 'Langue de l’interface', EN: 'Interface Language', AR: 'لغة الواجهة' },
    'SESSION_ADMIN': { FR: 'Session Administrateur', EN: 'Administrator Session', AR: 'جلسة المسؤول' },
    'DISCONNECT_WARN': { FR: 'Pour quitter le panneau d’administration en toute sécurité, cliquez sur le bouton de déconnexion.', EN: 'To securely log out of the administration panel, click the button below.', AR: 'لتسجيل الخروج بأمان من لوحة التحكم، انقر على زر تسجيل الخروج.' },
    'NOTIFICATIONS_EMAIL_COMMANDES': { FR: 'Notifications', EN: 'Notifications', AR: 'الإشعارات' },
    'ACTIVER_NOTIFICATIONS': { FR: 'Activer les alertes de nouvelle commande', EN: 'Enable New Order Alerts', AR: 'تفعيل تنبيهات الطلبات الجديدة' },
    'ACTIVER_NOTIFICATIONS_DESC': { FR: 'Recevez un e-mail instantané dès qu’un client passe une commande sur le site.', EN: 'Receive an instant email as soon as a customer places an order on the site.', AR: 'تلقي بريد إلكتروني فوري بمجرد أن يضع الزبون طلباً في الموقع.' },
    'ACTIVER': { FR: 'Activer', EN: 'Enable', AR: 'تفعيل' },
    'EMAIL_DESTINATAIRE_ADMIN': { FR: 'Email du destinataire (Admin)', EN: 'Recipient Email (Admin)', AR: 'البريد الإلكتروني للمستلم (المسؤول)' },
    'EMAIL_DESTINATAIRE_HINT': { FR: "C'est à cette adresse que le résumé de chaque commande sera envoyé.", EN: 'This is the address where each order summary will be sent.', AR: 'سيتم إرسال ملخص كل طلب إلى هذا العنوان.' },
    'CONFIGURATION_SERVEUR_SMTP': { FR: "Configuration du serveur d'envoi (SMTP Optionnel)", EN: 'Sending Server Configuration (Optional SMTP)', AR: 'إعدادات خادم الإرسال (SMTP اختياري)' },
    'INFOS_GENERALES_COOP': { FR: 'Informations Générales', EN: 'General Information', AR: 'معلومات عامة' },
    'NOM_COOPERATIVE': { FR: 'Nom de la Coopérative', EN: 'Cooperative Name', AR: 'اسم التعاونية' },
    'REMPLACER_LOGO': { FR: 'Remplacer le Logo', EN: 'Replace Logo', AR: 'استبدال الشعار' },
    'LOGO_COOPERATIVE': { FR: 'Logo de la Coopérative', EN: 'Cooperative Logo', AR: 'شعار التعاونية' }
  };


  constructor(private appRef: ApplicationRef) {
    const saved = localStorage.getItem('active_lang');
    if (saved === 'EN' || saved === 'AR' || saved === 'FR') {
      this.activeLang.next(saved);
    }
  }

  getLang(): 'FR' | 'EN' | 'AR' {
    return this.activeLang.value;
  }

  setLang(lang: 'FR' | 'EN' | 'AR') {
    this.activeLang.next(lang);
    localStorage.setItem('active_lang', lang);
    // Reload page to apply changes uniformly across all components and change page layout direction
    window.location.reload();
  }

  t(key: string): string {
    if (!key) return '';
    const lang = this.getLang();
    
    // 1. Check static dictionary
    if (this.dictionary[key] && this.dictionary[key][lang]) {
      return this.dictionary[key][lang];
    }
    const upperKey = key.trim().toUpperCase();
    if (this.dictionary[upperKey] && this.dictionary[upperKey][lang]) {
      return this.dictionary[upperKey][lang];
    }

    // If key is an uppercase flag, return empty string so template fallbacks (|| 'Default') work cleanly
    if (/^[A-Z0-9_]+$/.test(key.trim())) {
      return '';
    }

    return key;
  }

  pName(product: any): string {
    if (!product) return '';
    const lang = this.getLang();
    if (lang === 'EN') return product.name_en || product.name;
    if (lang === 'AR') return product.name_ar || product.name;
    return product.name;
  }

  pDesc(product: any): string {
    if (!product) return '';
    const lang = this.getLang();
    if (lang === 'EN') return product.description_en || product.description;
    if (lang === 'AR') return product.description_ar || product.description;
    return product.description || '';
  }

  translateText(text: string, targetLang: string): Promise<string> {
    if (!text || text.trim() === '') return Promise.resolve('');
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=fr&tl=${targetLang.toLowerCase()}&dt=t&q=${encodeURIComponent(text)}`;
    return fetch(url)
      .then(res => res.json())
      .then(json => {
        try {
          if (json && json[0]) {
            return json[0].map((item: any) => item[0]).join('') || text;
          }
          return text;
        } catch (e) {
          return text;
        }
      })
      .catch(() => text);
  }

  isRtl(): boolean {
    return this.getLang() === 'AR';
  }
}
