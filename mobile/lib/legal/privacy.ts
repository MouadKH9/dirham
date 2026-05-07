import type { LocalizedContent } from './types';

const en = `Effective date: 6 May 2026

1. Who we are
Dirham is a manual personal-finance tracking app published by [Legal entity to be filled in], registered in Morocco. Contact: privacy@dirham.app. Dirham does not move money, trade securities, lend money, or connect to your bank accounts.

2. What data we collect
- Account: email, hashed password, preferred language, preferred currency.
- Financial data: transactions, categories, accounts, budgets, bills (manually entered).
- Diagnostics: crash logs, performance metrics.
- Usage: anonymous product-interaction events.
- Device: model, OS version, app version, language, timezone.

We do NOT collect: contacts, location, photos, microphone, biometrics, advertising identifier, browsing history, or data from other apps.

3. How we use your data
To provide core features, generate weekly AI insights (opt-in), diagnose crashes, and send security or service notices. We do not sell your data, do not share with advertisers, and do not use it for behavioural advertising.

4. AI insights (third-party AI disclosure)
If you opt in, we send a weekly aggregated summary of your transactions to Google's Gemini API. The summary contains category-level totals, date ranges and currency. It does NOT include merchant names, transaction notes, your email, name, or any free-text. Per Google's Generative AI Additional Terms, paid Gemini API data is not used to train Google's models. You can disable AI insights at any time in Settings.

5. Third parties
- Railway (hosting): all app data, encrypted in transit and at rest.
- PostHog (analytics): anonymous events, crash logs, device metadata.
- Google (AI insights, opt-in): category-level transaction aggregates.
- Apple: device token, App Store metadata.

6. Data retention
- Active accounts: while active.
- Deleted accounts: permanently deleted within 30 days.
- Aggregated analytics: up to 24 months.
- Backups: rotating encrypted backups up to 30 days.

7. Your rights
Access, correct, export, delete your account, withdraw AI consent, lodge a complaint with the CNDP (Morocco). We respond within 30 days. Email privacy@dirham.app.

8. Security
HTTPS only (TLS 1.2+). PBKDF2-SHA256 password hashing. Short-lived JWT (15 min) and rotating refresh tokens stored in iOS Keychain. Database encrypted at rest.

9. Children
Not directed at children under 13.

10. International transfers
Data may be processed by Google in the US and PostHog in the US/EU under standard contractual clauses where required.

11. Changes
Material changes are announced in-app.

12. Contact
privacy@dirham.app`;

const fr = `Date d'effet : 6 mai 2026

1. Qui nous sommes
Dirham est une application de suivi des finances personnelles éditée par [Raison sociale à compléter], au Maroc. Contact : privacy@dirham.app. Dirham ne transfère pas d'argent, ne fait pas de trading, ne prête pas et ne se connecte pas à vos comptes bancaires.

2. Données collectées
- Compte : e-mail, mot de passe haché, langue, devise préférée.
- Données financières : transactions, catégories, comptes, budgets, factures (saisies manuellement).
- Diagnostics : journaux de plantage, performance.
- Usage : événements d'interaction anonymes.
- Appareil : modèle, OS, version app, langue, fuseau horaire.

Nous NE collectons PAS : contacts, position, photos, microphone, biométrie, identifiant publicitaire, historique de navigation, ni données d'autres apps.

3. Utilisation
Fournir les fonctionnalités, générer des insights IA hebdomadaires (opt-in), diagnostiquer les plantages, envoyer des avis de sécurité. Nous ne vendons pas vos données et ne les partageons pas avec des annonceurs.

4. Insights IA (information sur l'IA tierce)
Si vous activez les insights IA, nous envoyons un résumé hebdomadaire agrégé à l'API Gemini de Google. Ce résumé contient les totaux par catégorie, les plages de dates et la devise. Il n'inclut PAS les noms de marchands, les notes, votre e-mail, votre nom ou tout texte libre. Selon les conditions supplémentaires d'IA générative de Google, les données envoyées via l'API Gemini payante ne servent pas à entraîner les modèles de Google. Vous pouvez désactiver à tout moment dans Réglages.

5. Tiers
- Railway (hébergeur) : toutes les données, chiffrées.
- PostHog (analytique) : événements anonymes, journaux de plantage.
- Google (insights IA, opt-in) : agrégats de transactions par catégorie.
- Apple : token appareil, métadonnées App Store.

6. Conservation
- Comptes actifs : pendant la durée de vie du compte.
- Comptes supprimés : effacement définitif en moins de 30 jours.
- Analytique agrégée : jusqu'à 24 mois.
- Sauvegardes : sauvegardes chiffrées rotatives jusqu'à 30 jours.

7. Vos droits
Accès, rectification, export, suppression du compte, retrait du consentement IA, plainte auprès de la CNDP (Maroc). Réponse sous 30 jours. E-mail privacy@dirham.app.

8. Sécurité
HTTPS (TLS 1.2+). PBKDF2-SHA256. JWT court (15 min) et refresh tokens rotatifs dans le Keychain iOS. Base de données chiffrée au repos.

9. Enfants
Non destinée aux enfants de moins de 13 ans.

10. Transferts internationaux
Google aux États-Unis, PostHog aux États-Unis ou UE, sous clauses contractuelles types lorsque requis.

11. Modifications
Annoncées dans l'application.

12. Contact
privacy@dirham.app`;

const ar = `تاريخ السريان: 6 ماي 2026

1. شكون احنا
درهم تطبيق لتتبع المصاريف الشخصية تابع لـ [اسم الشركة يتحط من بعد]، بالمغرب. التواصل: privacy@dirham.app. درهم ما كيحركش الفلوس، ما كيدير شي عمليات بورصية، ما كيسلفش، وما كيتصلش بحساباتك البنكية.

2. شنو كنجمعو
- الحساب: الإيميل، كلمة السر المشفرة، اللغة، العملة.
- المعطيات المالية: المعاملات، الأصناف، الحسابات، الميزانيات، الفواتير (يدوية).
- التشخيص: سجلات الأعطال، الأداء.
- الاستعمال: أحداث مجهولة الهوية.
- الجهاز: النوع، النظام، نسخة التطبيق، اللغة، التوقيت.

ما كنجمعوش: جهات الاتصال، الموقع، الصور، الميكروفون، البصمة، معرف الإعلانات، تاريخ التصفح، ولا معطيات من تطبيقات أخرى.

3. كيفاش كنستعملوها
نوفرو الميزات، نوليدو ملاحظات ذكية كل أسبوع (اختياري)، نشخصو الأعطال، نبعتو إخطارات أمنية. ما كنبيعوش معطياتك وما كنعطيوهاش للمعلنين.

4. الملاحظات الذكية (إفصاح الذكاء الاصطناعي)
ايلا فعّلتي الملاحظات، كنبعتو خلاصة أسبوعية مجمعة لـ Gemini ديال Google. كتشمل المجاميع حسب الصنف، مجالات التواريخ، والعملة. ما كتشملش أسماء التجار، الملاحظات، إيميلك، اسمك، ولا أي نص حر. حسب الشروط الإضافية للذكاء الاصطناعي التوليدي ديال Google، معطيات Gemini API المدفوعة ما كتستعملش لتدريب النماذج. تقدر تطفي فأي وقت من الإعدادات.

5. الأطراف الثالثة
- Railway (الاستضافة): جميع المعطيات، مشفرة.
- PostHog (التحليلات): أحداث مجهولة، سجلات الأعطال.
- Google (الملاحظات الذكية، اختياري): مجاميع المعاملات حسب الصنف.
- Apple: رمز الجهاز، بيانات App Store.

6. الاحتفاظ
- الحسابات النشيطة: ما دامت نشيطة.
- الحسابات المحيدة: حذف نهائي فأقل من 30 يوم.
- التحليلات المجمعة: حتى 24 شهر.
- النسخ الاحتياطية: مشفرة دوّارة حتى 30 يوم.

7. حقوقك
الوصول، التصحيح، التصدير، حيد الحساب، سحب موافقة الذكاء الاصطناعي، تقديم شكاية للـ CNDP (المغرب). الجواب فأقل من 30 يوم. الإيميل: privacy@dirham.app.

8. الأمان
HTTPS فقط (TLS 1.2+). تشفير PBKDF2-SHA256. JWT قصير المدى (15 دقيقة) و refresh tokens دوّارين فالـ iOS Keychain. قاعدة المعطيات مشفرة.

9. الأطفال
ماشي موجه للأطفال أقل من 13 سنة.

10. النقل الدولي
Google فالولايات المتحدة، PostHog فالولايات المتحدة ولا الاتحاد الأوروبي، تحت الشروط التعاقدية الموحدة.

11. التعديلات
كتعلن داخل التطبيق.

12. التواصل
privacy@dirham.app`;

export const privacyContent: LocalizedContent = { en, fr, ar };
