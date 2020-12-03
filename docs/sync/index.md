# What is Sync Inc?

Sync Inc allows you to query Airtable using SQL.

## How Sync Inc works

You might be asking, "what does _sync_ have to do with SQL?"

Well, we _sync_ your entire Airtable base to a [Postgres](https://www.postgresql.org/) _follower_ database.

Then, behind the scenes, we do all the hard work to keep all your Airtable data in sync with your database in real time.

For now, your data is **read only**. No `inserts` or `updates` just yet.

## Getting started resources

Start querying your Airtable base with SQL in 2 minutes with our [getting started guide](/get-started).

1. Add your Airtable base
2. [Connect](/connect) to your database
3. [Query](/query) your Airtable data.

## Support

Our docs won't be able to cover everything, so if you have any issues, don't hesitate to reach out through intercom on the bottom left. We'd love to hear what you are building.

## Why sync

Syncing your data to a follower database has several benefits:

1. **All your data:** In one database, you'll have access to all the data in your Airtable base (it's yours after all!).
2. **Uncompromising SQL:** Access all the power of SQL running directly on a Postgres database. No brittle interpreter in the middle.
3. **Ready to integrate:** With a standard Postgres database hosted in AWS you can connect to your data in many ways.

## Our mission

Data syncing is a very [challenging problem](<https://en.wikipedia.org/wiki/Synchronization_(computer_science)>).

Our entire mission, so help us, is to solve the sync problem.

We're starting with Airtable today, with more APIs and platforms soon.
