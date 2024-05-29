// app/page.tsx

"use client";

import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import { useState, useEffect } from "react";
import { RootState, AppDispatch } from "@/redux/store";
import { deleteDeployment } from "@/redux/slices/deploymentSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { Fira_Code } from "next/font/google";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

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
const firaCode = Fira_Code({ subsets: ["latin"] });

export const formattedDate = (inputDate: string) => {
  const dateObject = new Date(inputDate);
  const day = dateObject.getDate().toString().padStart(2, "0");
  const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
  const year = dateObject.getFullYear().toString().slice(-2);

  const formattedDate = `${day}-${month}-${year}`;
  return formattedDate;
};

export default function DeploymentsPage() {
  const dispatch: AppDispatch = useDispatch();
  // const deployments = useSelector(
  //   (state: RootState) => state.deployments.deployments
  // );

  const router = useRouter();
  const path = usePathname();
  const pathArray = path.split("/");
  const deploymentId = pathArray[pathArray.length - 1];

  const user = useSelector((state: RootState) => state.auth.user);

  const [deployment, setDeployment] = useState(null);
  const [logs, setLogs] = useState(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [error, setError] = useState("");

  async function fetchDeploymentById() {
    if (deploymentId) {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/apps/${deploymentId}`,
          {
            withCredentials: true,
          }
        );
        setDeployment(response.data);
      } catch (err) {
        console.error(err);
      }
    }
  }

  async function fetchLogs() {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/apps/${deploymentId}/logs`,
        {
          withCredentials: true,
        }
      );
      setLogs(response.data?.logs);
    } catch (err) {
      console.error(err);
    }
  }

  const handleDelete = async () => {
    if (confirmationText !== deployment?.appName) {
      setError("Invalid confirmation text");
      return;
    }
    const result = await dispatch(deleteDeployment(deploymentId));
    if (result.meta.requestStatus === "fulfilled") {
      router.push("/");
    }
  };

  socket.on("deploymentStatus", (deployment) => {
    console.log("Deployment status updated:", deployment);
    setDeployment(deployment);
  });

  useEffect(() => {
    // if (user) {
    fetchDeploymentById();
    fetchLogs();

    const fetchLogsInterval = setInterval(() => {
      fetchLogs();
    }, parseInt(process.env.NEXT_PUBLIC_LOG_REFRESH_TIME as string));

    return () => {
      clearInterval(fetchLogsInterval);
    };

    // }
  }, [user, dispatch, deploymentId]);

  return (
    <>
      {/* {(status === "loading" || loading) && (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      )} */}
      {/* {!loading && !(status === "loading") && ( */}
      <>
        <Card className=" bg-[#151313] w-[800px] m-auto mt-20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex flex-col">
              <CardTitle className="text-2xl font-medium">
                {deployment?.appName}
              </CardTitle>
              {/* <a
                href={`http://${project?.subDomain}.mukulyadav.com:8000`}
                className="flex gap-2 text-[14px] hover:underline  align-middle mb-2"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <Link className="w-[14px]" />
                {`${project?.subDomain}.mukulyadav.com:8000`}
              </a> */}
            </div>
            {/* <Button className="ml-20" onClick={handleCreateDeployment}>
              Create deployment
            </Button> */}

            {/* <Button
              onClick={(e) =>
                router.push(
                  `/projects/${project?.id}/${project?.Deployment[0]?.id}`
                )
              }
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
                <Github className="w-[14px]" />
                {project?.gitURL.slice(17).replace(/\.git$/, "")}
              </a> */}

              <p className="text-xs text-muted-foreground">
                {`Last Updated at: ${formattedDate(deployment?.deployedAt)}`}
              </p>
            </div>
            <Button
              onClick={(e) => {
                e.stopPropagation();
              }}
              className=""
              variant={"secondary"}
            >
              <span className="text-xs mr-1"> Current Status:</span>
              <span>{deployment?.status}</span>
            </Button>

            <Button onClick={() => setShowModal(true)}>Delete</Button>
          </CardContent>
        </Card>

        <div className="w-[800px] m-auto mt-5">
          <div
            className={`${firaCode.className} text-sm text-green-500 logs-container mt-10 border-green-500 border-2 rounded-lg p-4 h-[400px] overflow-y-auto`}
          >
            <pre className="flex flex-col gap-1">
              {logs?.map((log, i) => (
                <code key={i}>{`> ${log?.message}`}</code>
              ))}
            </pre>
          </div>
        </div>
      </>
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
              <DialogTitle>Delete your project</DialogTitle>
              <DialogDescription className="text-red-400">
                This step is irrversible
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-rows-4 items-center gap-4">
                <div className="flex">
                  <Label htmlFor="name" className="text-right">
                    Enter{" "}
                    <span className="font-bold text-red-400">
                      {deployment?.appName}
                    </span>{" "}
                    to delete
                  </Label>
                </div>
                <Input
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  type="text"
                  placeholder="App name"
                  className="col-span-3"
                />

                <div className="text-xs text-[#c08484] w-full col-span-3 ml-2">
                  {error}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleDelete} type="submit">
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {/* )} */}
    </>
  );
}
