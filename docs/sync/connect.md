# 🔌 Connecting to your Sync Inc Database

Sync Inc syncs your Airtable base with a Postgres database hosted by Amazon Web Services (AWS). This highly reliable and standard database allows you to connect to your data from any typical SQL client.

Here is a guide to connecting your Sync Inc database to several popular tools, applications, and programming libraries.

## Standard connection options

### Manual

We'll provide you with the credentials you need to connect to your Sync Inc database:

- **Host:** The URL for reaching your database.
- **Port:** For Sync Inc Postgres databases, this will always be port `5432`.
- **User:** The username for your database.
- **Password:** The password for your database.
- **Database:** The name of your database.

With these credentials, you can connect to a whole host of tools, applications and ORMs.

### Connection URL

We'll also provide you with a Connection URL. This URL combines all the information to connect your Sync Inc database in one easy to copy and paste line of text text.

## [psql](https://www.postgresql.org/docs/10/app-psql.html)

psql allows you to interactively query your Sync Inc Postgres database in your terminal.

To connect to your Sync Inc database using `psql`:

1. Copy the **Connection URL** for your database.
2. Open your terminal.
3. Connect to your database by running the following `psql` command:

```
$ psql -d {paste_your_connection_url_here}
```

4. That's it. You're now connected to your database and are ready to query.

We provide first class support for psql. On the connect screen we'll generate the psql command to connect your Sync Inc database. Just copy and paste this command into terminal and you'll be ready to write your first query.

## SQL Tools

There are more and more fabulous SQL tools being built every day. These tools make it easy to use SQL. Below are instructions for connecting to your Sync Inc database from some popular tools.

### TablePlus

### SequelPro

### PopSQL

### SQLPro

## Retool

## BI Tools

### Tableau

### Lookr

## Airtable Apps and Scripts

## Libraries

### Node.js

- **[node-postgres](https://node-postgres.com/)** (pg)
- **Sequelize**
- **TypeORM**
- **objection**

### Ruby

### Python
