import { type GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { Sidebar } from "~/components/sidebar";

export default function Tasks() {
  return (
    <>
      <Head>
        <title>Tasks</title>
      </Head>
      <main>
        <Sidebar highlight="/tasks" />
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
