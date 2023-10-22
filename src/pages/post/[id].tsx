import Head from "next/head";
import PageLayout from "~/components/layout";

export default function PostPage() {
  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
      <PageLayout>
        <div>Post View</div>
      </PageLayout>
    </>
  );
}
