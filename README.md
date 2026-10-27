# ClinicFlow — Backend API

## 1. Présentation du projet

ClinicFlow est une API REST de gestion de clinique développée avec Node.js, Express.js et PostgreSQL.

Le projet a pour objectif de faciliter la gestion des patients, des rendez-vous et des utilisateurs, tout en assurant l'authentification et le contrôle des autorisations.

## 2. Technologies utilisées

- **Node.js** : environnement d'exécution JavaScript.
- **Express.js** : création de l'API REST.
- **PostgreSQL** : gestion de la base de données.
- **pg** : connexion à PostgreSQL.
- **JWT** : authentification des utilisateurs.
- **bcrypt** : hachage des mots de passe.
- **Zod** : validation des données.
- **Nodemon** : redémarrage automatique du serveur en développement.

## 3. Fonctionnalités attendues

- Authentification des utilisateurs.
- Gestion des rôles `admin` et `staff`.
- Création, consultation, modification et suppression des patients selon les autorisations.
- Recherche des patients par nom ou CIN avec pagination.
- Création et consultation des rendez-vous.
- Filtrage des rendez-vous par date et statut.
- Modification du statut des rendez-vous.
- Prévention des conflits entre rendez-vous confirmés pour un même patient.
- Statistiques pour le tableau de bord.

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
├── docs/
│   └── database-erd.md
├── .gitignore
└── README.md
```

## 5. Prérequis

- Node.js et npm
- PostgreSQL
- Git

## 6. Installation

### Étape 1 : Récupérer le projet

```bash
git clone <URL_DU_DEPOT>
cd ClinicFlow
```

### Étape 2 : Créer la base de données

Créer une base de données PostgreSQL nommée `clinicflow`.

Exécuter ensuite le script SQL depuis la racine du projet :

```bash
psql -U postgres -d clinicflow -f backend/database/schema.sql
```

Ce script crée les tables, les relations, les contraintes et les index définis dans le schéma.

### Étape 3 : Installer les dépendances du backend

```bash
cd backend
npm install
```

### Étape 4 : Configurer les variables d'environnement

Créer un fichier `.env` dans le dossier `backend` et renseigner les informations de connexion à PostgreSQL ainsi que le secret JWT.

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

Remplacer les valeurs d'exemple par les informations de votre environnement.


## 7. Lancement du backend

Depuis le dossier `backend`, exécuter :

### Mode développement

```bash
npm run dev
```

Cette commande utilise Nodemon pour redémarrer automatiquement le serveur lors des modifications.

### Mode standard

```bash
npm start
```

Cette commande lance le serveur avec Node.js.

Ces commandes nécessitent que le fichier `src/app.js` existe et que le serveur soit correctement configuré.

## 8. Base de données

Le projet utilise les tables principales suivantes :

- **users** : comptes utilisateurs et rôles.
- **patients** : informations des patients.
- **appointments** : rendez-vous et statuts.

Le script de création de la base de données se trouve dans `backend/database/schema.sql`.

Le diagramme entité-relation et la documentation du schéma sont disponibles dans `docs/database-erd.md`.

## 9. Sécurité

Le projet prévoit les mécanismes suivants :

- Hachage des mots de passe avec bcrypt.
- Authentification par JWT.
- Contrôle des autorisations selon le rôle.
- Validation des données avec Zod.
- Contraintes de base de données pour préserver l'intégrité des données.
- Utilisation de variables d'environnement pour les informations sensibles.

## 10. Auteur

**ClinicFlow** — Projet de développement backend avec Node.js, Express.js et PostgreSQL.
