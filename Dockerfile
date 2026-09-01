FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=/api
ARG VITE_LEGAL_OPERATOR_NAME="LifeOS private operator"
ARG VITE_LEGAL_CONTACT_EMAIL=""

ENV VITE_API_URL=$VITE_API_URL \
    VITE_LEGAL_OPERATOR_NAME=$VITE_LEGAL_OPERATOR_NAME \
    VITE_LEGAL_CONTACT_EMAIL=$VITE_LEGAL_CONTACT_EMAIL

RUN npm run build

FROM caddy:2-alpine

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv

EXPOSE 8080
