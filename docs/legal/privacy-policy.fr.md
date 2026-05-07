# Politique de confidentialité

**Date d'effet :** 6 mai 2026
**Dernière mise à jour :** 6 mai 2026

## 1. Qui nous sommes

Cette politique de confidentialité s'applique à **Dirham**, une application
mobile de suivi des finances personnelles (« l'application », « nous »).
Dirham est éditée par [Raison sociale à compléter], immatriculée au Maroc,
contact : `privacy@dirham.app`.

Dirham est un outil de saisie manuelle des dépenses. Elle **ne** déplace
**pas** d'argent, ne fait pas d'opérations boursières, ne prête pas
d'argent et ne se connecte pas à vos comptes bancaires.

## 2. Données collectées

Nous collectons uniquement les données nécessaires au fonctionnement de
l'application.

| Catégorie | Exemples | Finalité |
|---|---|---|
| Compte | Adresse e-mail, mot de passe (haché), langue préférée, devise préférée | Authentification et personnalisation |
| Données financières | Transactions, catégories, comptes, budgets, factures récurrentes (saisies manuellement) | Fonctionnement principal |
| Diagnostics | Journaux de plantage, métriques de performance | Stabilité et débogage |
| Données d'usage | Événements d'interaction anonymes (ex. « transaction_created ») | Amélioration de l'app |
| Appareil | Modèle, version OS, version app, langue, fuseau horaire | Compatibilité et localisation |

Nous **ne collectons pas** : contacts, position, photos, microphone,
biométrie, identifiant publicitaire, historique de navigation, données
provenant d'autres applications.

## 3. Utilisation de vos données

Nous utilisons vos données uniquement pour :

- Fournir les fonctionnalités principales (suivi, budgets, rappels) ;
- Générer des insights IA hebdomadaires (voir §4) ;
- Diagnostiquer les plantages et améliorer la fiabilité ;
- Vous communiquer des avis de sécurité ou de service critiques.

Nous **ne vendons pas** vos données, ne les partageons pas avec des
annonceurs et ne les utilisons pas à des fins de publicité comportementale.

## 4. Insights générés par IA (information sur l'IA tierce)

Si vous activez les insights IA, nous envoyons un **résumé hebdomadaire
agrégé** de vos transactions à l'**API Gemini de Google**. Ce résumé
contient :

- Totaux par catégorie (ex. « Alimentation : 1 240 DH ce mois ») ;
- Plages de dates ;
- Devise.

Ce résumé **n'inclut pas** : noms de marchands, notes de transaction, votre
e-mail, votre nom ou tout texte libre saisi.

Google traite les données pour générer le texte de l'insight, puis le
renvoie à notre backend. Conformément aux
[Conditions supplémentaires d'IA générative](https://policies.google.com/terms/generative-ai)
de Google, les données envoyées via l'API Gemini payante **ne sont pas
utilisées pour entraîner** les modèles de Google.

Vous pouvez désactiver les insights IA à tout moment dans **Réglages →
Insights IA**, ce qui interrompt l'envoi de toute nouvelle donnée.

## 5. Tiers avec qui nous partageons des données

| Tiers | Finalité | Données partagées | Politique |
|---|---|---|---|
| Railway (hébergeur) | Hébergement du backend en Europe | Toutes les données, chiffrées au repos et en transit | https://railway.app/legal/privacy |
| PostHog | Analytique produit et suivi des erreurs | Événements anonymes, journaux de plantage, métadonnées appareil | https://posthog.com/privacy |
| Google (Gemini) | Génération hebdomadaire d'insights IA (opt-in) | Agrégats de transactions par catégorie | https://policies.google.com/privacy |
| Apple | Distribution, notifications push | Token de l'appareil, métadonnées App Store | https://www.apple.com/legal/privacy/ |

Nous exigeons de chaque tiers une protection au moins équivalente à celle
de la présente politique.

## 6. Conservation des données

- **Comptes actifs :** conservées pendant la durée de vie du compte.
- **Comptes supprimés :** toutes vos données personnelles sont **supprimées
  définitivement dans un délai de 30 jours** après suppression depuis
  l'application.
- **Analytique agrégée non identifiante :** conservée jusqu'à 24 mois.
- **Sauvegardes :** sauvegardes chiffrées tournantes conservées jusqu'à
  30 jours.

## 7. Vos droits

Vous avez le droit de :

- **Accéder** à vos données — visibles dans l'application ;
- **Rectifier** vos données — éditez n'importe quelle ligne dans l'app ;
- **Exporter** vos données — bientôt disponible ; nous contacter en
  attendant ;
- **Supprimer** votre compte et toutes les données associées — **Réglages
  → Supprimer le compte**, ou par e-mail à `privacy@dirham.app` ;
- **Retirer votre consentement** aux insights IA — **Réglages → Insights
  IA** ;
- **Déposer une réclamation** auprès de la CNDP (https://www.cndp.ma) au
  titre de la loi 09-08.

Nous répondons aux demandes vérifiées dans les 30 jours.

## 8. Sécurité

- Tout le trafic utilise HTTPS (TLS 1.2+).
- Les mots de passe sont hachés avec PBKDF2-SHA256.
- L'authentification utilise des jetons JWT à courte durée de vie
  (15 min) et des refresh tokens rotatifs stockés dans le Keychain iOS via
  `expo-secure-store`.
- La base de données est chiffrée au repos par Railway.
- L'admin Django est restreint au personnel interne avec MFA obligatoire.

## 9. Enfants

Dirham n'est pas destinée aux enfants de moins de 13 ans et nous ne
collectons pas sciemment leurs données. Si vous pensez qu'un enfant a créé
un compte, contactez-nous et nous le supprimerons.

## 10. Transferts internationaux

Vos données peuvent être traitées par Google aux États-Unis et par
PostHog aux États-Unis ou dans l'UE. Les transferts s'appuient sur les
clauses contractuelles types (ou garanties équivalentes) lorsque requis.

## 11. Modifications

Nous notifierons les utilisateurs des changements importants dans
l'application et mettrons à jour la date « Dernière mise à jour »
ci-dessus. Toute utilisation continue après modification vaut acceptation.

## 12. Contact

Questions, demandes ou réclamations :

- E-mail : `privacy@dirham.app`
- Postal : [Adresse à compléter], Maroc
