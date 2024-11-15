FROM ghcr.io/puppeteer/puppeteer:21.9.0

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY . .
# Temporarily switch to the root user to modify permissions
USER root

# Ensure the 'data' folder is writable
RUN chmod -R 777 /usr/src/app/data

# Switch back to the non-root user for security
USER node

CMD [ "node", "routes.js" ]
