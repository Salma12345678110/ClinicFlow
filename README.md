# ClinicFlow — Application de gestion de clinique

## 1. Présentation du projet

ClinicFlow est une application web de gestion de clinique développée avec React, Node.js, Express.js et PostgreSQL.

Elle permet de gérer les patients, les rendez-vous et les utilisateurs, avec un système d'authentification et de contrôle des autorisations.

## 2. Technologies utilisées

- **Frontend :** React et Vite
- **Backend :** Node.js et Express.js
- **Base de données :** PostgreSQL
- **Accès à la base de données :** pg
- **Authentification :** JWT
- **Hachage des mots de passe :** bcrypt
- **Validation des données :** Zod
- **Développement :** Nodemon
- **Conteneurisation :** Docker et Docker Compose

## 3. Fonctionnalités

- Authentification des utilisateurs.
- Gestion des rôles `admin` et `staff`.
- Gestion des patients : création, consultation, modification et suppression selon les autorisations.
- Recherche des patients par nom ou CIN et pagination.
- Création et consultation des rendez-vous.
- Filtrage des rendez-vous par date et statut.
- Modification du statut des rendez-vous.
- Prévention des conflits entre rendez-vous confirmés pour un même patient.
- Tableau de bord avec les principales statistiques de la clinique.



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

Pour utiliser l'application avec Docker :

- Git
- Docker Desktop
- Docker Compose

Node.js et PostgreSQL peuvent fonctionner dans les conteneurs, sans installation séparée sur l'ordinateur.

Pour une installation manuelle, Node.js, npm et PostgreSQL sont nécessaires.

## 6. Installation et lancement avec Docker

### Étape 1 : Cloner le dépôt

```bash
git clone https://github.com/Salma12345678110/ClinicFlow.git
cd ClinicFlow
```

### Étape 2 : Démarrer Docker Desktop

Lancer Docker Desktop et attendre que le moteur Docker soit opérationnel.

### Étape 3 : Démarrer l'application

Depuis la racine du projet, exécuter :

```bash
docker compose -f ./docker/docker-compose.yml up --build
```

Cette commande construit les images si nécessaire et démarre les services définis dans le fichier Docker Compose.

Selon la configuration du projet, les services peuvent inclure :

- PostgreSQL : serveur de base de données.
- Backend : API Node.js et Express.js.
- Frontend : interface React et Vite.

Le schéma SQL et les données de démonstration sont initialisés uniquement si la configuration Docker prévoit ces opérations.

### Étape 4 : Accéder à l'application

Si les ports indiqués dans la configuration sont ceux utilisés par défaut dans ce projet :

- **Frontend :** http://localhost:5173
- **Page de connexion :** http://localhost:5173/login
- **Backend :** http://localhost:5000

Les identifiants de démonstration sont définis dans le script de seed, si celui-ci est exécuté par la configuration.

### Étape 5 : Arrêter l'application

Pour arrêter les conteneurs :

```bash
docker compose -f ./docker/docker-compose.yml down
```

Pour supprimer également les volumes associés, notamment les données PostgreSQL :

```bash
docker compose -f ./docker/docker-compose.yml down -v
```

**Attention :** la seconde commande peut supprimer définitivement les données enregistrées dans les volumes concernés.

## 7. Installation manuelle

### Étape 1 : Créer la base de données

Créer une base PostgreSQL nommée `clinicflow`, puis exécuter le script SQL depuis la racine du projet :

```bash
psql -U postgres -d clinicflow -f backend/database/schema.sql
```

Cette commande crée les tables, les contraintes et les index définis dans le schéma.

### Étape 2 : Installer les dépendances du backend

```bash
cd backend
npm install
```

### Étape 3 : Configurer les variables d'environnement

Créer un fichier `.env` dans le dossier `backend`, en s'inspirant du fichier `.env.example`.

Exemple de configuration :

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clinicflow
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=your_long_random_secret
```

Remplacer les valeurs d'exemple par celles de votre environnement.

- `PORT` : port du serveur backend.
- `DB_HOST` : adresse du serveur PostgreSQL.
- `DB_PORT` : port PostgreSQL.
- `DB_NAME` : nom de la base de données.
- `DB_USER` : utilisateur PostgreSQL.
- `DB_PASSWORD` : mot de passe PostgreSQL.
- `JWT_SECRET` : secret utilisé pour signer les jetons JWT.

Ne jamais publier le fichier `.env` contenant des informations sensibles.

### Étape 4 : Lancer le backend

Depuis le dossier `backend` :

```bash
npm run dev
```

Pour un lancement standard, si le script correspondant existe :

```bash
npm start
```

### Étape 5 : Installer et lancer le frontend

Ouvrir un deuxième terminal, depuis la racine du projet :

```bash
cd frontend
npm install
npm run dev
```

Si nécessaire, configurer `VITE_API_URL` selon le mécanisme utilisé par le frontend. Pour une API accessible localement, l'URL de base peut être :

```env
VITE_API_URL=http://localhost:5000/api
```

Vérifier que le code frontend utilise bien cette variable et que le backend autorise les requêtes provenant de l'origine du frontend.

## 8. Base de données

La base de données comprend les tables suivantes :

- **users :** comptes utilisateurs, adresses email et rôles.
- **patients :** informations personnelles des patients.
- **appointments :** rendez-vous, dates, statuts et relations avec les patients et les utilisateurs.

Le script de création des tables est disponible dans `backend/database/schema.sql`.

Le diagramme entité-relation et la description des relations sont disponibles dans `docs/database-erd.md`.

Pour initialiser les données de démonstration, exécuter le script prévu à cet effet si nécessaire :

```bash
cd backend
node database/seed.js
```

Cette commande suppose que le fichier `.env` est correctement configuré et que PostgreSQL est accessible.

## 9. Sécurité

- Hachage des mots de passe avec bcrypt.
- Authentification par JWT.
- Contrôle des autorisations selon le rôle.
- Validation des données avec Zod.
- Contraintes SQL pour préserver l'intégrité des données.
- Utilisation de variables d'environnement pour les informations sensibles.

Les mots de passe et secrets de démonstration sont réservés au développement. Ils doivent être remplacés par des valeurs sécurisées avant toute mise en production.

## 10. Auteur

**ClinicFlow** — Projet de développement Full Stack pour la gestion d'une clinique.
