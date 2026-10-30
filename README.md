# ClinicFlow — Gestion de clinique

## 1. Présentation du projet

ClinicFlow est une application web de gestion de clinique développée avec la stack PERN : PostgreSQL, Express.js, React et Node.js.

Elle permet de gérer les patients, les rendez-vous et les utilisateurs, ainsi que de consulter les principales statistiques de la clinique.

## 2. Technologies utilisées

| Technologie | Utilisation |
|---|---|
| React et Vite | Développement du frontend |
| Node.js | Environnement d'exécution backend |
| Express.js | Création de l'API REST |
| PostgreSQL | Gestion de la base de données |
| pg | Connexion à PostgreSQL |
| JWT | Authentification |
| bcrypt | Hachage des mots de passe |
| Zod | Validation des données |
| Jest | Tests automatisés |
| Supertest | Tests des routes HTTP |
| Docker | Conteneurisation de l'application |
| Docker Compose | Gestion des services conteneurisés |
| Git et GitHub | Gestion de versions et hébergement du code |

## 3. Fonctionnalités principales

### Authentification et gestion des utilisateurs

- Connexion avec email et mot de passe.
- Authentification avec JWT.
- Gestion des rôles `admin` et `staff`.
- Protection des routes selon les autorisations.

### Gestion des patients

- Ajouter un patient.
- Consulter les informations d'un patient.
- Modifier les informations d'un patient.
- Supprimer un patient avec les droits administrateur.
- Rechercher les patients par nom ou CIN.
- Afficher les patients avec pagination.

### Gestion des rendez-vous

- Créer un rendez-vous.
- Consulter la liste des rendez-vous.
- Filtrer les rendez-vous par date et par statut.
- Modifier le statut d'un rendez-vous : `pending`, `confirmed` ou `cancelled`.
- Empêcher deux rendez-vous confirmés pour un même patient lorsque leurs horaires sont espacés de moins de 30 minutes.

### Tableau de bord

- Nombre total de patients.
- Nombre de rendez-vous du jour.
- Nombre de rendez-vous en attente.
- Nombre de rendez-vous confirmés.

## 4. Structure du projet

```text
ClinicFlow/
├── backend/
│   ├── database/
│   │   ├── schema.sql
│   │   └── seed.js
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   └── app.js
│   ├── tests/
│   ├── .env.example
│   └── package.json
├── frontend/
├── docker/
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
├── docs/
│   └── database-erd.md
├── .gitignore
├── package.json
└── README.md
```

## 5. Prérequis

Avant d'installer le projet, assurez-vous d'avoir :

- Node.js et npm.
- PostgreSQL.
- Git.
- Docker Desktop avec Docker Compose.

## 6. Installation du projet

### Étape 1 : Récupérer le projet

Cloner le dépôt GitHub :

```bash
git clone https://github.com/Salma12345678110/ClinicFlow.git
cd ClinicFlow
```

### Étape 2 : Créer la base de données

Créer une base de données PostgreSQL nommée `clinicflow`.

Depuis la racine du projet, exécuter le script SQL :

```bash
psql -U postgres -d clinicflow -f backend/database/schema.sql
```

Ce script permet de créer les tables, les relations, les contraintes et les index nécessaires au fonctionnement de l'application.

### Étape 3 : Installer et configurer le backend

Accéder au dossier backend :

```bash
cd backend
```

Installer les dépendances :

```bash
npm install
```

Créer un fichier `.env` à partir du fichier `.env.example`, puis renseigner les informations de connexion à PostgreSQL et le secret JWT.

### Étape 4 : Insérer les données de test

Depuis le dossier `backend`, exécuter :

```bash
node database/seed.js
```

Ce script insère les données de démonstration :

- Un administrateur.
- Deux utilisateurs staff.
- Cinq patients.
- Dix rendez-vous avec différents statuts.

Les mots de passe sont hachés avec bcrypt avant leur enregistrement dans la base de données.

### Étape 5 : Installer le frontend

Ouvrir un nouveau terminal et accéder au dossier frontend depuis la racine du projet :

```bash
cd frontend
```

Installer les dépendances :

```bash
npm install
```

## 7. Variables d'environnement

Le backend utilise les variables d'environnement suivantes :

| Variable | Description |
|---|---|
| `PORT` | Port du serveur backend |
| `DB_HOST` | Adresse du serveur PostgreSQL |
| `DB_PORT` | Port PostgreSQL |
| `DB_NAME` | Nom de la base de données |
| `DB_USER` | Utilisateur PostgreSQL |
| `DB_PASSWORD` | Mot de passe PostgreSQL |
| `JWT_SECRET` | Secret utilisé pour signer les jetons JWT |

Le fichier `.env.example` fournit un modèle de configuration sans informations confidentielles.


## 8. Lancement de l'application

### Lancement avec Docker Compose

Docker Compose permet de construire et de lancer les services définis dans le fichier `docker-compose.yml`.

Depuis la racine du projet, exécuter :

```bash
docker compose -f docker/docker-compose.yml up --build
```

Pour arrêter les services :

```bash
docker compose -f docker/docker-compose.yml down
```

### Lancement sans Docker

Le frontend et le backend peuvent également être lancés séparément dans deux terminaux.

**Lancer le backend :**

Depuis le dossier `backend` :

```bash
npm run dev
```

**Lancer le frontend :**

Depuis le dossier `frontend` :

```bash
npm run dev
```

Les adresses d'accès dépendent des ports configurés dans le projet.

## 9. Principales routes API

Les routes protégées nécessitent un token JWT valide.

| Méthode | Route | Description | Autorisation |
|---|---|---|---|
| POST | `/api/auth/login` | Connexion | Public |
| GET | `/api/auth/me` | Informations de l'utilisateur connecté | Authentifié |
| POST | `/api/patients` | Ajouter un patient | Authentifié |
| GET | `/api/patients` | Lister les patients | Authentifié |
| GET | `/api/patients/:id` | Consulter un patient | Authentifié |
| PUT | `/api/patients/:id` | Modifier un patient | Authentifié |
| DELETE | `/api/patients/:id` | Supprimer un patient | Admin uniquement |
| POST | `/api/appointments` | Créer un rendez-vous | Authentifié |
| GET | `/api/appointments` | Lister les rendez-vous | Authentifié |
| PATCH | `/api/appointments/:id/status` | Modifier le statut d'un rendez-vous | Authentifié |

## 10. Documentation de la base de données

Le fichier `docs/database-erd.md` contient :

- Le diagramme entité-association (ERD).
- La description des tables.
- Les relations entre les tables.
- Les contraintes d'intégrité.
- Les règles de gestion des données.

La base de données comprend trois tables principales :

- `users` : informations des utilisateurs et leurs rôles.
- `patients` : informations des patients.
- `appointments` : rendez-vous associés aux patients et aux utilisateurs.

Les relations entre les tables permettent de garantir la cohérence des données.

## 11. Tests

Les tests automatisés du backend sont réalisés avec Jest et Supertest.

Pour exécuter les tests, depuis le dossier `backend` :

```bash
npm test
```

La suite de tests actuelle comprend :

- 12 suites de tests réussies.
- 59 tests réussis.

Les tests couvrent notamment l'authentification, la gestion des patients, les rendez-vous et la règle métier des 30 minutes.

## 12. Sécurité

L'application intègre plusieurs mécanismes de sécurité :

- Les mots de passe sont hachés avec bcrypt.
- Les routes protégées utilisent JWT.
- Les autorisations sont contrôlées selon le rôle de l'utilisateur.
- Les données reçues sont validées avec Zod.
- Les clés étrangères et les contraintes SQL protègent l'intégrité des données.
- Les informations sensibles sont conservées dans des variables d'environnement.

## 13. Auteur

**Projet :** ClinicFlow — Gestion de clinique  
**Type :** Test technique de développement Full Stack