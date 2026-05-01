# Guide de Configuration du Système d'Authentification

## Installation et Configuration

### 1. Variables d'Environnement (.env)

Le fichier `.env` a été créé. Configurez votre base de données :

```env
DATABASE_URL="file:./dev.db"  # Pour SQLite (développement)
# OU
DATABASE_URL="postgresql://user:password@localhost:5432/maraudhelper"  # Pour PostgreSQL

JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NODE_ENV="development"
```

### 2. Prisma Migration

Pour initialiser la base de données avec le schéma mis à jour :

```bash
# Générer les migrations
npx prisma migrate dev

# Ou forcer la création depuis zéro
npx prisma migrate resolve --rolled-back add_token_to_user
npx prisma migrate dev --name add_token_to_user
```

### 3. Structure du Système d'Authentification

#### Routes API Créées:
- **POST /api/auth/login** - Connexion utilisateur
  - Body: `{ username: string, password: string }`
  - Response: `{ message: string, user: { id, name, mail } }` + Cookie `authToken`

- **POST /api/auth/register** - Inscription utilisateur
  - Body: `{ username: string, email: string, password: string, confirmPassword: string, name: string }`
  - Response: `{ message: string, user: { id, name, mail } }`

- **POST /api/auth/logout** - Déconnexion
  - Response: Supprime le cookie `authToken`

#### Pages Créées:
- **/login** - Page de connexion
- **/register** - Page d'inscription

#### Middleware de Protection:
- **middleware.ts** - Protège toutes les routes sauf:
  - `/login`
  - `/register`
  - `/api/auth/login`
  - `/api/auth/register`

### 4. Couleurs Utilisées

Les couleurs du Design System ont été intégrées dans `app/colors.css` :
- Backgrounds: --bg, --bg-2, --bg-3, --bg-4, --bg-5
- Texts: --text-main, --text-secondary
- Colors: Main (rouge), Secondary, Violet, Green, Blue, Orange, Pink

### 5. Notes de Sécurité

⚠️ **À faire avant la production:**
1. Changer la valeur de `JWT_SECRET` dans le .env
2. Activer HTTPS (secure: true dans les cookies)
3. Configurer une base de données PostgreSQL
4. Ajouter la validation CSRF
5. Implémenter la limite de taux (rate limiting)

### 6. Dépendances Installées

- `bcryptjs` - Hachage des mots de passe
- `jsonwebtoken` - Gestion des tokens JWT
- `@types/bcryptjs` - Types TypeScript
- `@types/jsonwebtoken` - Types TypeScript

