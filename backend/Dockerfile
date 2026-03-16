# Node.js image use karo
FROM node:18-alpine

# Working directory set karo
WORKDIR /usr/src/app

# Package files copy karo
COPY package*.json ./

# ⚠️ IMPORTANT: `npm ci` ki jagah `npm install` use karo
# Ya phir pehle package-lock.json generate karo
RUN npm install --production

# Source code copy karo
COPY . .

# Non-root user create karo
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /usr/src/app

# User switch karo
USER nodejs

# Port expose karo
EXPOSE 5000

# App start karo
CMD ["node", "app.js"]
