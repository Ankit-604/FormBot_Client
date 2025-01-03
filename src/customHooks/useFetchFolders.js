import { useEffect, useState } from "react";
import { useUserContext } from "../Contexts/UserContext";
import { api } from "../api/api";

const useFetchFolders = () => {
  const { setFolders, setSelectedFolder } = useUserContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const selectedWorkspaceData = sessionStorage.getItem("selectedWorkspace");
  const selectedUserId = selectedWorkspaceData
    ? JSON.parse(selectedWorkspaceData)._id
    : null;
  let userId;
  if (!selectedUserId) {
    userId = localStorage.getItem("userId");
  } else {
    userId = selectedUserId;
  }
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/protected/user/${userId}`);
        const { user, folders } = response.data;
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
