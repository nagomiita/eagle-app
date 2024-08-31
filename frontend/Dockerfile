# ビルドステージ
FROM node:20 AS build-stage

# 作業ディレクトリの設定
WORKDIR /app

# パッケージファイルをコピーして依存関係をインストール
COPY package*.json /app/
RUN npm install

# アプリケーションソースをコピーしてビルド
COPY ./ /app/
RUN npm run build

# サーブステージ
FROM nginx:1

# Nginxのデフォルト設定を削除してビルド成果物をコピー
COPY --from=build-stage /app/dist/ /usr/share/nginx/html
# Nginxの設定をコンテナ内にコピー
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY ./nginx-backend-not-found.conf /etc/nginx/extra-conf.d/backend-not-found.conf
