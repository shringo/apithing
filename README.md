# Precursor: WTF is an API?

APIs (Application Programming Interface), (in this context) simply put, allow the general public to call a URL and to submit or receive data from your database or backend. More generally, it implements calls to a library or a backend service.

For example, if you wanted to contact Twitter to see all your private tweets, you would send a `GET` request to a URL looking something like this:

```
twitter.com/api/paid/v2/users/<id>/tweets
```

...including credentials, so everyone can't freely access your tweets. The response would come back in a `JSON` object for webpages as it easily integrates into JavaScript. To determine if an API was written well, it a) comes with documentation, b) has consistency and c) has security (credentials) to access specific parts.

```json
[
    {
        "handler": "@mccafe",
        "content": "lol",

        "sent": 1697780425858,
        "likes": 69,
        "retweets": 420,
        "shares": 2,
        "views": 9
    },
    {
        "handler": "@mccafe",
        "content": "bruh",

        "sent": 1689680325725,
        "likes": 1,
        "retweets": 10,
        "shares": 5,
        "views": 3
    }
]
```

# "notes" from T3 3 hour video

## First, make a T3 App

Run the command: `npm create t3-app@latest`

You will be greeted with just about the fanciest UI in your terminal. 

Choose Typescript. Choosing Javascript will result in a big middle finger. See [this](https://github.com/t3-oss/create-t3-app/issues/117)

Use Tailwinds CSS

Use tRPC

Select None (for auth provider)

Select Prisma for the database ORM.

'No' for app router

Sure, initialize a git repo cuz ynot

Let it run npm install.

## MongoDB Setup

Do the steps listed on the Coding Prison Notes on how to make a MongoDB account & database.

Find the `./.env` file and replace it with the DB URL you copied. YOU NEED TO MAKE A DB ON MONGODB THAT HAS A TABLE CALLED `Posts`. It looks like this:

```
mongodb+srv://name:password@projectname.idk.mongodb.net/nameofdatabase
```

The password is not and needs to be substituted into the URL or you will get an authorization error when running.

Run `npx prisma studio` and a tab will be opened. Navigate to localhost:5555 if you were not automatically taken there. Click on "Posts".

**An error will be expected.** Stop the program, go to `./prisma/schema.prisma` and make the following change:

```diff
datasource db {
--    provider = "sqlite"
++    provider = "mongodb"
    url      = env("DATABASE_URL")
}

model Post {
--    id        Int      @id @default(autoincrement())
++    id        String   @id @default(auto()) @map("_id") @db.ObjectId
```

Because we switched from SQLite to MongoDB, the functions are different. Mongo does not know what `autoincrement` is, so a hacky change was made after looking at [Kobe's code](https://github.com/KobeUyeda/React-t3-trpc/blob/main/trpctest/prisma/schema.prisma).

If you did not make the changes, you will see this error:

```log
Error: Prisma schema validation - (get-config wasm)
Error code: P1012
error: Error validating datasource `db`: the URL must start with the protocol `file:`.
  -->  schema.prisma:10
   | 
 9 |     provider = "sqlite"
10 |     url      = env("DATABASE_URL")
   | 

Validation Error Count: 1
```

Run `npx prisma db push` so MongoDB can generate the schema based off of the Prisma schema. Now, running `npx prisma studio` will run without errors. You can also add entries from the GUI. 😃