FROM node:18-alpine

WORKDIR /app

# Copier les fichiers package d'abord
COPY backend/package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code backend
COPY backend/ .

EXPOSE 3000

CMD ["npm", "start"]