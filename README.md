# ClinicFlow — Application de gestion de clinique

## 1. Présentation du projet

ClinicFlow est une application web de gestion de clinique développée avec React, Node.js, Express.js et PostgreSQL.

Elle permet de gérer les patients, les rendez-vous et les utilisateurs, tout en assurant l'authentification et le contrôle des autorisations.

## 2. Technologies utilisées

- **Frontend :** React et Vite
- **Backend :** Node.js et Express.js
- **Base de données :** PostgreSQL
- **Connexion à la base de données :** pg
- **Authentification :** JWT
- **Hachage des mots de passe :** bcrypt
- **Validation des données :** Zod
- **Développement :** Nodemon
- **Conteneurisation :** Docker et Docker Compose

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

*Remarque : seules les fonctionnalités effectivement implémentées et testées sont considérées comme disponibles.*

## 4. Structure du projet

```text
ClinicFlow/
├── backend/
│   ├── database/
│   │   ├── schema.sql
│   │   └── seed.js
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
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
├── docs/
│   └── database-erd.md
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## 5. Prérequis

Pour lancer l'application avec Docker, il faut :

- Git
- Docker Desktop avec Docker Compose

Node.js et PostgreSQL ne doivent pas être installés séparément sur l'ordinateur pour le lancement avec Docker.

## 6. Installation et lancement avec Docker

### Étape 1 : Cloner le dépôt

```bash
git clone https://github.com/Salma12345678110/ClinicFlow.git
cd ClinicFlow
```

### Étape 2 : Démarrer l'application

Démarrer Docker Desktop, puis exécuter la commande suivante depuis la racine du projet :

```bash
docker compose -f ./docker/docker-compose.yml up --build
```

Docker Compose démarre automatiquement les services suivants :

- **PostgreSQL :** création de la base de données `clinicflow`.
- **Schéma SQL :** création des tables à partir de `backend/database/schema.sql` lors de la première initialisation de la base.
- **Seed :** création du compte administrateur de démonstration.
- **Backend :** démarrage de l'API Node.js et Express.js.
- **Frontend :** démarrage de l'interface React.

Aucune création manuelle de la base de données n'est nécessaire pour ce lancement.

### Étape 3 : Accéder à l'application

- **Frontend :** http://localhost:5173
- **Page de connexion :** http://localhost:5173/login
- **Backend :** http://localhost:5000

Les identifiants de démonstration sont ceux configurés dans `backend/database/seed.js`.

### Étape 4 : Arrêter l'application

Dans un autre terminal, depuis la racine du projet, exécuter :

```bash
docker compose -f ./docker/docker-compose.yml down
```

Cette commande arrête et supprime les conteneurs du projet, mais conserve les données enregistrées dans le volume PostgreSQL.

Pour supprimer également les données de la base Docker :

```bash
docker compose -f ./docker/docker-compose.yml down -v
```

**Attention :** cette dernière commande supprime le volume de données associé à cette configuration.

## 7. Installation manuelle (alternative)

### Étape 1 : Créer la base de données

Installer PostgreSQL, créer une base nommée `clinicflow`, puis exécuter :

```bash
psql -U postgres -d clinicflow -f backend/database/schema.sql
```

### Étape 2 : Installer les dépendances du backend

```bash
cd backend
npm install
```

### Étape 3 : Configurer les variables d'environnement

Créer un fichier `.env` dans le dossier `backend` à partir de `.env.example`, puis renseigner les paramètres de connexion à PostgreSQL et le secret JWT.

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

### Étape 4 : Lancer le backend

Depuis le dossier `backend` :

```bash
npm run dev
```

Pour lancer le serveur en mode standard :

```bash
npm start
```

### Étape 5 : Lancer le frontend

Dans un autre terminal :

```bash
cd frontend
npm install
npm run dev
```

Si nécessaire, configurer `VITE_API_URL` dans l'environnement du frontend pour pointer vers `http://localhost:5000/api`.

## 8. Base de données

Le projet utilise les tables suivantes :

- **users :** comptes utilisateurs et rôles.
- **patients :** informations des patients.
- **appointments :** rendez-vous et statuts.

Le script de création se trouve dans `backend/database/schema.sql`.

La documentation du schéma et le diagramme entité-relation sont disponibles dans `docs/database-erd.md`.

## 9. Sécurité

- Hachage des mots de passe avec bcrypt.
- Authentification par JWT.
- Contrôle des autorisations selon le rôle.
- Validation des données avec Zod.
- Contraintes de base de données pour préserver l'intégrité des données.
- Utilisation de variables d'environnement pour les informations sensibles.

Les secrets et mots de passe de démonstration doivent être réservés au développement et sécurisés avant toute mise en production.

## 10. Auteur

**ClinicFlow** — Projet de développement Full Stack pour la gestion d'une clinique.
