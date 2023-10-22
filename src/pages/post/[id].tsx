import type { GetStaticProps, NextPage } from "next";
import PageLayout from "~/components/layout";
import Head from "next/head";
import { api } from "~/utils/api";
import getServerSideHelper from "~/server/helpers/SSHelper";
import { PostView } from "~/components/postview";
import Link from "next/link";

const OnePostPage: NextPage<{id:string}> = ({ id }) => {
  const { data } = api.post.getById.useQuery({ id });
  if(!data) { 
    return (<Link href="/" className="text-3xl font-bold absolute flex h-screen w-screen items-center justify-center">Post not found | Go home</Link>);
  }
  return (
    <>
      <Head>
        <title>{'@' + data.author.username + "'s post"}</title>
      </Head>
      <PageLayout>
        <PostView {...data}/>
      </PageLayout>
    </>
  );
}

// make sure this is get and NOT use or else usage of node.js packages that the browser doesn't know like "fs" will cause errors.
export const getStaticProps:GetStaticProps = async (context) => {
  const ssg = getServerSideHelper();
  const id = context.params?.id;
  if(typeof id !== "string") throw new Error("no id");
  await ssg.post.getById.prefetch({ id });
  return {
    props: {
      trpcState: ssg.dehydrate(),
      id
    }
  };
}

export const getStaticPaths = () => {
  return {paths: [], fallback: "blocking"};
}

export default OnePostPage;