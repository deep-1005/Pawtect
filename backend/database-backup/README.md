# 📦 Database Backup & Restore

This folder contains JSON exports of your MongoDB database collections.

## 📋 Collections Included

- `animals.json` - All rescued animals data
- `shelters.json` - Shelter information
- `ngos.json` - NGO details
- `users.json` - User accounts
- `crueltyReports.json` - Cruelty reports
- `donations.json` - Donation records

## 🔄 How to Use

### Export Current Database

Run this to backup your current database:

```bash
cd backend
node exportDatabase.js
```

This will create/update all JSON files in this folder.

### Import Database (Restore)

Run this to restore database from JSON files:

```bash
cd backend
node importDatabase.js
```

⚠️ **Warning:** This will **DELETE** all existing data and replace it with the backup!

## 🚀 First Time Setup for New Users

When someone clones your GitHub repo:

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Install MongoDB locally:
   - Download: https://www.mongodb.com/try/download/community
   - Install with default settings
   - MongoDB will run on `mongodb://127.0.0.1:27017`

3. Import the database:
   ```bash
   node importDatabase.js
   ```

4. Start the server:
   ```bash
   node server.js
   ```

## 📊 Data Contents

The backup includes:
- Sample rescued dogs with PAW IDs
- Demo shelters across Bangalore
- Test user accounts
- Sample cruelty reports
- Donation records

## 🔒 Security Note

**Passwords in users.json are hashed** - they're safe to commit to GitHub.

**Never commit:**
- `.env` files with MongoDB Atlas credentials
- API keys
- Real user personal information

## 💡 Tips

- Run `exportDatabase.js` before pushing important changes
- Keep backups updated when adding demo data
- Test `importDatabase.js` on a fresh MongoDB installation
- Use this for development/demo data only

---

**Last Updated:** November 2025
