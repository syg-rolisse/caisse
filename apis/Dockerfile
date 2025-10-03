# Utilisation de l'image de base
FROM node:22.17.0-alpine AS base

# Stage de dépendances (installation de toutes les dépendances)
FROM base AS deps
WORKDIR /app
ADD package.json package-lock.json ./
RUN npm ci

# Stage de dépendances de production uniquement
FROM base AS production-deps
WORKDIR /app
ADD package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage de build (inclut tsconfig et autres fichiers nécessaires)
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
ADD . .  
RUN npm run build

# Stage de production
FROM base
ENV NODE_ENV=production
WORKDIR /app

# Copie uniquement les dépendances de production
COPY --from=production-deps /app/node_modules /app/node_modules
# Copie uniquement les fichiers compilés (pas les fichiers .ts)
COPY --from=build /app/build /app

COPY public/. /app/public/

EXPOSE 3333
CMD ["node", "ace", "serve", "--watch"]