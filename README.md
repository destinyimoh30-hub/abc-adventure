# 🌈 ABC Adventure

Free web version of the children's alphabet game.

## Deploy on Render

1. Create/connect your Render account to GitHub.
2. Choose **New → Web Service**.
3. Select the `abc-adventure` GitHub repository.
4. Runtime: **Node**
5. Build command: `npm install`
6. Start command: `npm start`
7. Choose **Free**.
8. Deploy.

Render gives the service an `onrender.com` URL. Free web services may spin down after 15 minutes without traffic and their local filesystem is ephemeral, so the included SQLite database is suitable for testing/demo use, not permanent production data.

## Local

```bash
npm install
npm start
```

Open http://localhost:3000
Admin: http://localhost:3000/admin

## Important for future production use

Before public launch with real player data:
- protect admin/write endpoints with authentication;
- use HTTPS;
- move persistent player/score data to a managed database;
- add a proper privacy policy and support contact;
- review Google Play Families requirements if publishing as an Android app.

## GitHub

Upload the contents of this folder to:
https://github.com/destinyimoh30-hub/abc-adventure
