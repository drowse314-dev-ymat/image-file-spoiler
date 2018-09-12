オニオンアーキテクチャの実験のために書かれたアプリケーション。

ネットワーク環境の悪い人向けに(?)、Slackに添付された画像の内容をすかさずコメントするBot。

として使えるAWS Lambda関数の実装。

- http://ymat.hatenablog.com/entry/step-by-step-onion-architecture

Image File Spoiler
==================

## Prerequisites

- NVM
- Yarn

## Build

```sh
$ nvm use
$ yarn install
$ yarn test
$ yarn run build
```

## Run

### Run Local App

```sh
$ node ./dist/image-file-spoiler.js
$ # input local image paths...
```

## Package

### Package AWS Lambda App

```sh
$ make
$ # --> ./dist/package/lambda-image-file-spoiler.zip
```
