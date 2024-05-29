// app/page.tsx

"use client";

import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import { useEffect, useState } from "react";
import { RootState, AppDispatch } from "@/redux/store";
import {
  createDeployment,
  fetchDeployments,
} from "@/redux/slices/deploymentSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

export const formattedDate = (inputDate: string) => {
  const dateObject = new Date(inputDate);
  const day = dateObject.getDate().toString().padStart(2, "0");
  const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
  const year = dateObject.getFullYear().toString().slice(-2);

  const formattedDate = `${day}-${month}-${year}`;
  return formattedDate;
};

export default function HomePage() {
  const router = useRouter();

  const dispatch: AppDispatch = useDispatch();
  const deployments = useSelector(
    (state: RootState) => state.deployments.deployments
  );
  const [showModal, setShowModal] = useState<boolean>(false);
  const [chart, setChart] = useState("");
  const [appName, setAppName] = useState("");
  const [namespace, setNamespace] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filterProjects = (deployment) => {
    return (
      deployment?.appName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deployment?.namespace?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const user = useSelector((state: RootState) => state.auth.user);

  const handleDeploy = async () => {
    const result = await dispatch(
      createDeployment({ namespace, appName, chart })
    );
    if (result.meta.requestStatus === "fulfilled") {
      router.push(`/deployments/${result.payload._id}`);
    }
  };

  useEffect(() => {
    // if (user) {
    dispatch(fetchDeployments());
    // }
  }, [user, dispatch]);

  return (
    <>
      {/* {(status === "loading" || loading) && (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      )} */}
      {/* {!loading && !(status === "loading") && ( */}
      <>
        <div className="flex items-center justify-end w-full">
          <input
            type="text"
            placeholder="🔍  Search Apps or Namespaces"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-white bg-[#151313] px-4 py-2 rounded-md border focus:ring-1 focus:ring-white  focus:outline-none  mt-6 ml-10 mr-10"
          />
          <Button
            onClick={() => {
              setShowModal(true);
            }}
            className="mt-6 mr-10"
          >
            Add new Project
          </Button>
        </div>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 m-10">
          {deployments?.filter(filterProjects)?.map((deployment) => (
            <Card
              onClick={() => {
                // setLoading(true);
                router.push(`/deployments/${deployment?._id}`);
              }}
              key={deployment?.id}
              className="hover:ring-1 bg-[#151313] cursor-pointer hover:ring-white "
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex flex-col">
                  <CardTitle className="text-2xl font-medium">
                    {deployment?.appName}
                  </CardTitle>
                  {/* <a
                    href={`http://${deployment?.subDomain}.mukulyadav.com:8000`}
                    className="flex gap-2 text-[12px] hover:underline  align-middle mb-2"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link className="w-[12px]" />
                    {`${project?.subDomain}.mukulyadav.com:8000`}
                  </a> */}
                </div>
                {/* <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/${deployment?._id}`);
                  }}
                >
                  See Logs
                </Button> */}
                <div>{deployment?.namespace}</div>
              </CardHeader>
              <CardContent className="flex items-center justify-between mt-4">
                <div className="flex-col gap-y-4">
                  {/* <a
                    href={project?.gitURL.replace("git://", "https://")}
                    className="flex gap-2 text-[14px] hover:underline  align-middle mb-2 border-2 rounded-full py-1 px-2"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Github className="w-[12px]" />
                    {project?.gitURL.slice(17).replace(/\.git$/, "")}
                  </a> */}

                  <p className="text-xs text-muted-foreground">
                    {`Created at: ${formattedDate(deployment?.deployedAt)}`}
                  </p>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className=""
                  variant={"secondary"}
                >
                  <span className="text-xs mr-1">Status:</span>
                  <span>{deployment?.status}</span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {showModal && (
          <Dialog open={showModal}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogClose
                  className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                  onClick={() => setShowModal(false)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </DialogClose>
                <DialogTitle>Deploy</DialogTitle>
                <DialogDescription>
                  Deploy your project in one click{" "}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    App name
                  </Label>
                  <Input
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    type="text"
                    placeholder="App name"
                    className="col-span-3"
                  />

                  <Label htmlFor="name" className="text-right">
                    Chart
                  </Label>
                  <Input
                    value={chart}
                    onChange={(e) => setChart(e.target.value)}
                    type="text"
                    placeholder="Chart"
                    className="col-span-3"
                  />
                  <Label htmlFor="name" className="text-right">
                    Namespace
                  </Label>
                  <Input
                    value={namespace}
                    onChange={(e) => setNamespace(e.target.value)}
                    type="text"
                    placeholder="Namespace"
                    className="col-span-3"
                  />

                  {/* <div className="text-xs text-[#c08484] w-full col-span-3 ml-2">
                    {error}
                  </div> */}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleDeploy} type="submit">
                  Deploy
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </>
      {/* )} */}
    </>
  );
}
