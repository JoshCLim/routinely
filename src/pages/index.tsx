import Head from "next/head";
import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Button } from "~/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuList,
  NavigationMenuContent,
  NavigationMenuLink,
} from "~/components/ui/navigation-menu";

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

const Navbar = () => {
  const session = useSession();
  const router = useRouter();

  return (
    <div className="fixed top-0 flex w-full flex-row items-center justify-end p-10">
      <NavigationMenu className="flex w-full flex-row justify-between">
        <NavigationMenuList>
          {session.status !== "authenticated" && (
            <NavigationMenuLink>
              <Button onClick={() => void signIn("google")}>Login</Button>
            </NavigationMenuLink>
          )}
          {session.status === "authenticated" && session.data.user?.image && (
            <>
              <NavigationMenuLink>
                <Button onClick={() => void router.push("/dashboard")}>
                  Go to dashboard
                </Button>
              </NavigationMenuLink>
              <NavigationMenuItem>
                <NavigationMenuTrigger>
                  <Image
                    src={session.data.user.image}
                    alt=""
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuLink asChild className="justify-end">
                    <Button onClick={() => void signOut()}>Logout</Button>
                  </NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </>
          )}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};
