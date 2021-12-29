# syntax=docker/dockerfile:1

FROM node:16-alpine
ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json", "./"]

RUN npm install --production && npm cache clean --force

COPY ["src", "./"]

STOPSIGNAL SIGTERM
ENV DISCORD_CLIENT_ID=your-discord-client-id DISCORD_CLIENT_SECRET=your-discord-client-secret DISCORD_INTENTS=calculate-intents-on-https://discord-intents-calculator.vercel.app DISCORD_PUBLIC_KEY=your-discord-public-key-here DISCORD_TOKEN=your-discord-token-here NODE_ENV=production NODE_MODULES_CACHE=false NPM_CONFIG_PRODUCTION=true YARN_PRODUCTION=true

CMD [ "node", "index.js" ]
