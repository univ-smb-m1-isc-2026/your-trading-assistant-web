# ─── Image finale : Serve ──────────────────────────────────────────────────────
# Dockerfile minimal : on assume que npm run build a déjà été exécuté
# dans GitHub Actions (ou localement).
#
# On copie juste le dossier dist/ (bundle Vite déjà compilé) et on sert
# via nginx.

FROM nginx:alpine

COPY dist/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
