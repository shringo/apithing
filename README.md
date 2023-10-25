# video notes

Comments on each commit after watching video to sorta explain what's going on in each change:

[click here](https://github.com/shringo/apithing/commits)

### external libs & purpose
* upstash - ratelimiter when needed
* ClerkJS - auth library
* tRPC - helps with API calls
* zod - validation library for arguments * passed through API calls
* MongoDB - db
* Prisma - helps with schema for mongodb
* hot-react-toast - lil' pop-up notifications
* dayjs - formatting times

## What is tRPC?

tRPC is the library we use to create our own API. It relies on TypeScript so your IDE can tell you what endpoints you have on your backend that you want the general user to be able to call in something like a web browser.

## Glossy

What is a..:
* Router: Hosts procedures relating to the name of the router. e.g. `/messages/getAll` : messages is the 'router'
* Procedure: The equivalent of an endpoint in terms of REST. e.g. `/messages/getAll` : getAll is the endpoint.

Make the procedure:

```ts
// pretend this is a new file under /src/server/api/routers called messages.ts

// the export variable can be anything, just make sure you know how to import it in your api/root.ts file.
export const messageRouter = createTRPCRouter({
  // getAll has to be named getAll if you want to use this name on the frontend side.
  // publicProcedure is a function that should already be here inside your T3 app.
  // query - a 'GET' in REST terms. (this means we aren't trying to modify the database (you can but you shouldn't))
  // async - because we make a call to the database that returns a promise (requires await)
  getAll: publicProcedure.query(async ({ ctx }) => {
    // call to prisma, first 100 messages with the newest first
    const messages = await ctx.db.messages.findMany({
      take: 100,
      orderBy: [
        {
          createdAt: "desc"
        }
      ]
    });
    // cant do return await coz javascript is a weird language
    return messages;
  }),

  // glaring security feature: WHY the hell is this a publicProcedure?? (a procedure that at least makes sure the user is logged in should be needed)
  // z is an import from zod used to validate tRPC input. no extra work is needed besides npm i zod, which is already done upon running `npm i`. An awesome library. inside your mutation or query code, it's implied that the input is sanitized.
  // mutation - a 'POST' or ANYTHING else in REST terms. (modifies the database, delete a message, edit a message, etc.)
  // .input - can be fed like publicProcedure.input() which accepts arguments. can be accessed by including ({ ctx, input }) inside the query func.
  // different types: strings, with a min and max length.
  edit: publicProcedure.input(z.object({ id: z.string(), newContent: z.string().min(1).max(2000) })).mutation(async ({ ctx, input }) => {
    // theoretically, idk never tried this
    const message = await ctx.db.messages.update({
      where: {
        id: input.id
      },
      data: {
        content: input.newContent
      }
    });

    // ???
    if(!message) throw new TRPCError({ code: "NOT_FOUND", message: "bro ur msg id is bad" });
    // return the edited message, if you want to reflect it on the frontend
    return message;
  })
});
```

Now, we have to define the router in `./src/server/api/root.ts`. Easy as making this edit:

```ts
// note how the same createrouter func was used. technically, you could have an endpoint in this file.
export const appRouter = createTRPCRouter({
  // dont forget to import the router
  messages: messageRouter
});
```

How would you call it on the frontend?

```tsx
import { api } from "~/utils/api";
// ...
// because the func is async it will also return a promise that needs to be awaited
export default async function hahauqheofd8yeghfuyirgf() {
  // returns an object as such:
  // { data: [messages], isLoading: true, /* other stuff */ }
  const { data, isLoading } = await api.messages.getAll.useQuery();

  // show ugly load screen
  if(isLoading) return <div>fetching posts</div>;
  if(data === undefined || data === null) return <div>no data wtf?</div>;
  if(data.length === 0) return <div>No data</div>;

  //show messages pretend these properties exist
  // map - give me an array by running the procedure i feed you. in this case it returns a list of divs with the message content
  return (
    <div>
      {data.map((m) => (<div key={m.id}>{m.content}</div>))}
    </div>
  )
};
```

# Below: Incomplete stuff on t3 stack

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

# Setting up

## Lang: TypeScript

We will be using tRPC, Next.js, Prisma, and MongoDB. You are required to use TypeScript. It's the same as JavaScript, but introduces types. Simply put, you can do this in JavaScript:

```js
var a = 69;

a = "69";
```

But do it in TypeScript and you will get an error! TypeScript essentially enforces type checking, so you can't say a function that returns the addition of two numbers returns a string. TS gets compiled to JS code.

## Will not be showing 'hosting' for the actual site

The tutorial shows services like Axiom and Vercel, which essentially host the website for you.

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

## Clerk.dev - Implementing a login screen

Clerk is an authentication library. They claim *Clerk is more than a "sign-in box." Integrate complete user management UIs and APIs, purpose-built for React, Next.js, and the Modern Web.*

First, install clerk: `npm i @clerk/nextjs`

Navigate to their [website](https://clerk.dev) and make an account. Make a new application and enable the 'username' option. Then, make a dummy account with a weak password. Go to API Keys and copy the two secret codes, pasting it into your `.env`.

Go to your `_app.tsx` file and surround the `<Component>...` as such: (You need to import @clerk/nextjs as well)

```tsx
const MyApp: AppType = ({ Component, pageProps }) => {
  return <ClerkProvider {...pageProps}>
    <Component {...pageProps} />
  </ClerkProvider>;
};
```

Add a middleware file, so we can intercept every request made to our website and show the login screen when needed

```tsx
// Location: ./src/middleware.ts
// MUST BE NAMED MIDDLEWARE.TS
import { authMiddleware } from "@clerk/nextjs";
 
// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
export default authMiddleware({});
 
export const config = {
      matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

Let's make sure it works. Run the project and go to `localhost:3000`, you will be redirected to clerk's account sign-in. Log in, then you will be shown the content.

We can also add a sign-in button (though clerk seems to automatically force me to sign in):

```tsx
// In ./src/index.tsx
export default function Home() {
  const user = useUser();
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div>
          {user.isSignedIn ? <SignOutButton></SignOutButton> : <SignInButton></SignInButton>}
        </div>
      </main>
    </>
  );
}
```

The button will probably look like black text on a dark purple background.

# Writing Twitter ripoff code: blaze your glory 🔥😂😭

Think about the key parts to a Twitter post...

Add it to your schema, then `npx prisma db push` to update.

`npm i` to refresh the TypeScript code.

# NPM Package Hell

From the tutorial, we install a few more packages to carry out some tasks for us.