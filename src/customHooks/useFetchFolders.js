import { useEffect, useState } from "react";
import { useUserContext } from "../Contexts/UserContext";
import {api} from "../api/api";

const useFetchFolders = () => {
  console.log("Im runni")
  const { setFolders,setSelectedFolder } = useUserContext(); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 

  const selectedWorkspaceData = sessionStorage.getItem("selectedWorkspace");
  const selectedUserId = selectedWorkspaceData ? JSON.parse(selectedWorkspaceData)._id: null;
  console.log("selectedUserId", selectedUserId);
  let userId;
  if(!selectedUserId){
    userId = localStorage.getItem("userId");
    console.log("userId", userId);
  }else{
    userId = selectedUserId;
  }
  useEffect(() => {


    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("reached")
        const response = await api.get(`/protected/user/${userId}`);
        console.log("response", response);
        const { user, folders } = response.data;
        console.log("user and folders", user, folders);
        setFolders(folders);
        setSelectedFolder("");
        sessionStorage.setItem("selectedFolder", "");
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user and folder data:", err);
        setError(err.message || "Failed to fetch data.");
        setLoading(false);
      }
    };

    if (userId) fetchData(); 
  }, [setFolders]);

  return { loading, error };
};

export default useFetchFolders;
