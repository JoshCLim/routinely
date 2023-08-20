import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { api } from "~/utils/api";
import { Navbar } from "./navbar";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Head>
        <title>Routinely</title>
        <meta name="description" content="Live you life with purpose." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-start bg-white">
        <Navbar />
        <header className="flex h-screen max-h-[800px] w-full flex-row justify-center gap-24">
          <div className="flex flex-col items-start justify-center">
            <p className="text-3xl font-extralight">welcome to</p>
            <h1 className="text-8xl font-extralight">routinely</h1>
            {/* <p className="text-3xl font-extralight">
              where your todo list meets your calendar
            </p> */}
          </div>
          <div className="flex items-center justify-center">
            <Image src="/calendar3d.jpg" alt="" width={400} height={400} />
          </div>
        </header>
        <footer className="w-full bg-[#eee] p-12"></footer>
      </main>
    </>
  );
}
