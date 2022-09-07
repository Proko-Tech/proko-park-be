# Proko Park Backend


![Lint](https://github.com/Proko-Tech/proko-park-be/actions/workflows/lint.yml/badge.svg)
![Build](https://github.com/Proko-Tech/proko-park-be/actions/workflows/node.js.yml/badge.svg)

## Project Description

This repository is the rest api for the the mobile application. The REST API allows each each users
to access availability information, reserve parking lot, and supports to most features on the
ProkoPark Mobile App.

### Setup:

```
git clone https://github.com/Proko-Tech/proko-park-be.git
cd proko-park-be
npm install
npm start
```

## Testing:

Visit `localhost:3000` for testing any routes.

## Production:

To test production functionalities run the following commands:

`docker-compose build`<br>
`docker-compose up` or `docker-compose up -d` (to run in detached mode)

## Tech Overview

This app is running using NodeJS with ExpressJS, and knex as query builder for mysql connection.

## Contributions

Before pushing any changes to the main branch, please discuss with the
fellow developers with the change and the issues. Design doc is required before any development takes place.
Code reviews will be enforce throughout the entire project
and a feature will not be merged into the main stream until every developers
have done their code reviews.
