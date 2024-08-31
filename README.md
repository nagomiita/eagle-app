# Eagle App

## 概要

[Eagle](https://jp.eagle.cool/)で管理している画像をスマホやタブレットから見ることができるようにするための Web アプリです。  
Eagle をインストールできる Windows でホストし、ローカルネットワーク内の iPhone や iPad のブラウザでアクセスすることを想定しています。
[Eagle 公式](https://jp.eagle.cool/article/1081-will-eagle-have-a-mobile-version-in-the-future)はモバイル版の開発や Apple Store でのリリースを検討していないようです。
公式が公開している[Eagle_API](https://api.eagle.cool/)を利用して、Eagle で管理しているリソースにアクセスしています。タグ管理を利用して、目的の画像を即座に探せることを目的としています。

## 開発環境

- FastAPI
- React
