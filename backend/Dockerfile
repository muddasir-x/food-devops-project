# Roman Urdu: Node.js image use karo
FROM node:18-alpine

# Roman Urdu: Working directory set karo
WORKDIR /usr/src/app

# Roman Urdu: Package files copy karo
COPY package*.json ./

# Roman Urdu: Dependencies install karo
RUN npm ci --only=production

# Roman Urdu: Source code copy karo
COPY . .

# Roman Urdu: Non-root user create karo (security ke liye)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /usr/src/app

# Roman Urdu: User switch karo
USER nodejs

# Roman Urdu: Port expose karo
EXPOSE 5000

# Roman Urdu: Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

# Roman Urdu: App start karo
CMD ["node", "app.js"]
