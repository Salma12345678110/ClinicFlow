# ClinicFlow — Backend API

## 1. Présentation du projet

ClinicFlow est une API REST de gestion de clinique développée avec Node.js, Express.js et PostgreSQL.

Le projet vise à faciliter la gestion des patients, des rendez-vous et des utilisateurs, tout en assurant l'authentification et le contrôle des autorisations.

## 2. Technologies utilisées

- **Node.js** : environnement d'exécution JavaScript.
- **Express.js** : création de l'API REST.
- **PostgreSQL** : gestion de la base de données.
- **pg** : connexion à PostgreSQL.
- **JWT** : authentification des utilisateurs.
- **bcrypt** : hachage des mots de passe.
- **Zod** : validation des données.
- **Nodemon** : redémarrage automatique du serveur en développement.

## 3. Fonctionnalités

- Authentification des utilisateurs.
- Gestion des rôles `admin` et `staff`.
- Gestion des patients : création, consultation, modification et suppression selon les autorisations.
- Recherche des patients par nom ou CIN avec pagination.
- Création et consultation des rendez-vous.
- Filtrage des rendez-vous par date et statut.
- Modification du statut des rendez-vous.
- Prévention des conflits entre rendez-vous confirmés pour un même patient.
- Statistiques pour le tableau de bord.

*Remarque : conserver uniquement les fonctionnalités effectivement implémentées et tester.*

## 4. Structure du projet

```text
ClinicFlow/
├── backend/
│   ├── database/
│   │   └── schema.sql
│   ├── src/
│   │   ├── app.js
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── services/
│   ├── .env.example
│   └── package.json
├── frontend/
├── docs/
│   └── database-erd.md
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## 5. Prérequis

- Node.js et npm
- PostgreSQL
- Git

## 6. Installation

### Étape 1 : Cloner le dépôt

```bash
git clone https://github.com/Salma12345678110/ClinicFlow.git
cd ClinicFlow
```

### Étape 2 : Créer la base de données

Créer une base de données PostgreSQL nommée `clinicflow`, puis exécuter le script SQL :

```bash
psql -U postgres -d clinicflow -f backend/database/schema.sql
```

Cette commande exécute le script de création du schéma de la base de données.

### Étape 3 : Installer les dépendances

```bash
cd backend
npm install
```

### Étape 4 : Configurer les variables d'environnement

Créer un fichier `.env` dans le dossier `backend` à partir de `.env.example`, puis renseigner les informations de connexion à PostgreSQL et le secret JWT.

Exemple :

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clinicflow
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=your_long_random_secret
```

Remplacer les valeurs d'exemple par celles de votre environnement. Ne jamais publier le fichier `.env` réel.

## 7. Lancement du backend

Depuis le dossier `backend` :

### Mode développement

```bash
npm run dev
```

### Mode standard

```bash
npm start
```

Ces commandes supposent que les scripts correspondants sont définis dans `backend/package.json`.

## 8. Base de données

Le projet utilise principalement les tables suivantes :

- **users** : comptes utilisateurs et rôles.
- **patients** : informations des patients.
- **appointments** : rendez-vous et statuts.

Le script de création se trouve dans `backend/database/schema.sql`.

La documentation du schéma et le diagramme entité-relation sont disponibles dans `docs/database-erd.md`.

## 9. Sécurité

Les mécanismes de sécurité comprennent, selon les fonctionnalités implémentées :

- Hachage des mots de passe avec bcrypt.
- Authentification par JWT.
- Contrôle des autorisations selon le rôle.
- Validation des données avec Zod.
- Contraintes de base de données pour préserver l'intégrité des données.
- Utilisation de variables d'environnement pour les informations sensibles.

## 10. Auteur

**ClinicFlow** — Projet de développement d'une application de gestion de clinique avec Node.js, Express.js et PostgreSQL.