FROM node:22-alpine
WORKDIR /app

# No dependencies needed.
RUN adduser -D -H appuser

COPY . ./
EXPOSE 80

USER appuser

CMD ["node", "index.mjs"]