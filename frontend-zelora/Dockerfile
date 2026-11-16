# Multi-stage production build for ZELORA React 19 Frontend
FROM node:20-alpine

WORKDIR /app

# Install project dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source and build production bundle
COPY . .
RUN npm run build

# Expose internal preview port for the Nginx reverse proxy
EXPOSE 5173

# Serve production assets via Vite preview with host binding
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
