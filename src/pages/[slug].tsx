import Head from "next/head";
import toast from "react-hot-toast";
import { LoadingPage } from "~/components/loading";
import { api } from "~/utils/api";

export default function ProfilePage() {
  const { data, isLoading } = api.profile.getProfileByname.useQuery({ username: "test" });
  console.log(data);
  if(isLoading) return <LoadingPage/>;
  if(!data) { 
    toast.error("User not found.");
    return;
  }
  return (
    <>
      <Head>
        <title>Profile</title>
      </Head>
      <main className="flex h-screen justify-center">
        <div>User View</div>
      </main>
    </>
  );
}
