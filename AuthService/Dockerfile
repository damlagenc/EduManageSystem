# Node.js resmi imajından başla
FROM node:21.6.0

# Çalışma dizinini ayarla
WORKDIR /usr/src/app

# Uygulama bağımlılıklarını yükle
# package.json VE package-lock.json'ı kopyala
COPY package*.json ./

RUN npm install

# Uygulama kaynak kodunu kopyala
COPY . .

# Uygulama bağlantı noktasını belirt
EXPOSE 3001

# Uygulamayı çalıştır
CMD ["npm", "start"]
