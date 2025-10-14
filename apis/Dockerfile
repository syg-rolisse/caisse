# FICHIER: ./apis/Dockerfile (Version Définitive)

# ===================================================================
#  ÉTAPE 1, 2, 3 : Build de l'application (ne changent pas)
# ===================================================================
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build --production

# ===================================================================
#  ÉTAPE 4 : Image finale (adaptée à votre structure de build)
# ===================================================================
FROM base
ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# === MODIFICATION CLÉ ===
# On copie le CONTENU de /app/build directement à la racine /app
# Le point "." signifie "dans le répertoire de travail actuel" (/app)
COPY --from=build /app/build .

# On copie les assets publics
COPY --from=build /app/public ./public

# On intègre le script d'entrypoint
COPY entrypoint.sh .
ENTRYPOINT ["./entrypoint.sh"]

EXPOSE 3333

# La CMD pointe vers le serveur à la racine, car il n'y a pas de dossier 'build'
CMD ["node", "bin/server.js"]

# # Utilisation de l'image de base
# FROM node:22.17.0-alpine AS base

# # Stage de dépendances (installation de toutes les dépendances)
# FROM base AS deps
# WORKDIR /app
# ADD package.json package-lock.json ./
# RUN npm ci

# # Stage de dépendances de production uniquement
# FROM base AS production-deps
# WORKDIR /app
# ADD package.json package-lock.json ./
# RUN npm ci --omit=dev

# # Stage de build (inclut tsconfig et autres fichiers nécessaires)
# FROM base AS build
# WORKDIR /app
# COPY --from=deps /app/node_modules /app/node_modules
# ADD . .  
# RUN npm run build

# # Stage de production
# FROM base
# ENV NODE_ENV=production
# WORKDIR /app

# # Copie uniquement les dépendances de production
# COPY --from=production-deps /app/node_modules /app/node_modules
# # Copie uniquement les fichiers compilés (pas les fichiers .ts)
# COPY --from=build /app/build /app

# COPY public/. /app/public/

# EXPOSE 3333
# CMD ["node", "ace", "serve", "--watch"]