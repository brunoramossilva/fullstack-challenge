FROM node:20-slim

WORKDIR /app

# Required so Prisma generate has a valid datasource value during image build.
ENV DATABASE_URL=postgresql://postgres:postgres@localhost:5432/challenge_db

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/src/main"]
