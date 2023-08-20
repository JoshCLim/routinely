import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
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

const Navbar = () => {
  const session = useSession();
  const router = useRouter();

  return (
    <div className="fixed top-0 flex w-full flex-row items-center justify-end p-10">
      <NavigationMenu className="flex w-full flex-row justify-between">
        <NavigationMenuList>
          {/* <NavigationMenuItem>
            <NavigationMenuTrigger>Features</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                <li className="row-span-3">
                  <NavigationMenuLink asChild>
                    <a
                      className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                      href="/"
                    >
                      <div className="mb-2 mt-4 text-lg font-medium">
                        shadcn/ui
                      </div>
                      <p className="text-sm leading-tight text-muted-foreground">
                        Beautifully designed components built with Radix UI and
                        Tailwind CSS.
                      </p>
                    </a>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem> */}
        </NavigationMenuList>
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

export { Navbar };
