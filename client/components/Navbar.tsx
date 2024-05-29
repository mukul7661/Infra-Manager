"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";

import { checkTokenValidity, logout } from "@/redux/slices/authSlice";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const path = usePathname();
  const router = useRouter();

  const user = useSelector((state: RootState) => state.auth.isUserLoggedIn);

  if (!user) {
    router.push(path);
  } else if (path === "/login" || path === "/signup") {
    router.push("/");
  }

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkTokenValidity());
  }, [dispatch]);
  const [navbarValue, setNavbarValue] = useState("projects");
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6 p-4", className)}
      {...props}
    >
      {user && (
        <>
          <Link
            href="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              path === "/" ? "text-primary" : "text-muted-foreground"
            )}
          >
            Home
          </Link>
          <Link
            href="/"
            onClick={() => dispatch(logout())}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              path === "/" ? "text-primary" : "text-muted-foreground"
            )}
          >
            Sign out
          </Link>
        </>
      )}
      {!user && (
        <>
          <Link
            href="/signup"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              path === "/signup" ? "text-primary" : "text-muted-foreground"
            )}
          >
            Sign up
          </Link>
          <Link
            href="/login"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              path === "/login" ? "text-primary" : "text-muted-foreground"
            )}
          >
            Sign in
          </Link>
        </>
      )}
    </nav>
    // <Tabs defaultValue="projects">
    //   <TabsList className="w-full">
    //     <TabsTrigger value={value}>Projects</TabsTrigger>
    //     <TabsTrigger value={value}>Projects</TabsTrigger>
    //   </TabsList>
    // </Tabs>
  );
}
