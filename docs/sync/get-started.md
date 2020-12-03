# ⚡️ Get Started

Start querying your Airtable base with SQL in 2 minutes.

## Add your first base

First, let's connect your Airtable base to Sync Inc.

(_Note: There are tons of great sample bases you can use in the <a href="https://airtable.com/universe" target="_blank">Airtable Universe</a>_)

1. Create a new account at https://app.syncinc.so/login.

2. Once your logged in, click the **Add Base** button.

3. First, **name your resource**. To keep it simple, we suggest you reuse your base name from Airtable.

4. Provide us with your **Airtable API key**. You'll find your API key on your <a href="https://airtable.com/account" target="_blank">Airtable account page</a>. To get to your account page, login to Airtable, click on your thumbnail in the top right corner, and select **Account**. On your account page, you'll see a purple box in the middle of the page where you can click to reveal and then copy your API key. Paste the key back in Sync Inc.

5. Now, enter the **ID for your Airtable base**. You'll find the ID for your Airtable base on <a href="https://airtable.com/api" target="_blank">Airtable's REST API site</a>. Select the base you want to connect to then copy the base ID (it will be in green text in the middle of the page). Paste your base's ID back in Sync Inc.

6. Lastly, enter the names of the tables in the base. Do this for each and every table in your base. Please enter the name of the table exactly as it appears in Airtable.

7. Click the **Start Sync** button!

After clicking **Start Sync** we'll immediately connect to Airtable and begin syncing with your base.

For most Airtable bases, the sync will complete in a couple seconds. If you are working at Airtable's limit of 50,000 records, then the sync might take up to 3 minutes to complete.

## Connect to your database

Now, let's connect to your database.

You're Sync Inc database is a complete Postgres database hosted in AWS. [You can connect to your database in all sorts of ways](/connect). For this guide, we'll use TablePlus.

1. Download and install TablePlus from https://tableplus.com/

2. Open TablePlus and click **Create a new connection...**

3. Click the **Import from URL** button.

4. Copy and paste the **Connect URL** from Sync Inc into the **Connection URL** in TablePlus then click **Import**.

That's it!

## Query your base

You'll now see your entire Airtable base represented in Postgres tables!

You'll see that we convert your table names to `snake_case` (i.e lowercase with words delineated with an underscore). So what was `Product Inventory` in Airtable is now `product_inventory` in your database.

To start querying, click the **SQL** button and have it. For instance:

```
SELECT * FROM product_inventory LIMIT 10;
```

---

You can now query all your Airtable data with full fledged SQL. `SELECT`, `JOIN`, `UNION` and more.

With all your data synced to a AWS Postgres database, you can connect to your data in all sorts of ways.

From here, check out our [Cheat Sheet](/cheat-sheet) for quick tips on how to query your Airtable base in SQL.

Read our [Query](/query) docs to learn more about how we make Airtable work with SQL.
