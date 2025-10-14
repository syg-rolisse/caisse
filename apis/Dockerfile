# FICHIER: ./apis/Dockerfile (Version unique et optimisée pour la production)

# ===================================================================
#  ÉTAPE 1 : Base commune
# ===================================================================
FROM node:20-alpine AS base
WORKDIR /app

# ===================================================================
#  ÉTAPE 2 : Installation des dépendances (y compris dev) pour le build
# ===================================================================
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ===================================================================
#  ÉTAPE 3 : Build de l'application
# ===================================================================
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# S'assure que le build est fait en mode production pour les optimisations
RUN npm run build --production

# ===================================================================
#  ÉTAPE 4 : Image finale de production (légère et sécurisée)
# ===================================================================
FROM base
ENV NODE_ENV=production

# Installation des dépendances de production UNIQUEMENT
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copie du code compilé depuis l'étape de build
# CORRECTION IMPORTANTE : On copie le dossier build dans un dossier build
COPY --from=build /app/build ./build

# Copie des assets publics
COPY --from=build /app/public ./public

EXPOSE 3333

# --- COMMANDE FINALE CORRIGÉE POUR LA PRODUCTION ---
# Lance le serveur de production via le script compilé
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