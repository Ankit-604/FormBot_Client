import { useEffect } from "react";
import { api } from "../api/api";
import { useUserContext } from "../Contexts/UserContext";

const useFetchFlowData = (id) => {
  const { userData, selectedFolder, selectedForm, flowData, setFlowData } =
    useUserContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        let userId;
        if (!id) {
          if (sessionStorage.getItem("selectedWorkspace")) {
            userId = JSON.parse(
              sessionStorage.getItem("selectedWorkspace")
            )._id;
          } else {
            userId = userData._id;
          }
        } else {
          userId = id;
        }

        const response = await api.get(`/protected/form/${userId}`, {
          params: {
            formName: selectedForm,
            folderName: selectedFolder,
          },
        });
        if (response.status === 200) {
          const data = response.data;

          sessionStorage.setItem("flowData", JSON.stringify(data.elements));
          setFlowData(data.elements);
        } else {
          console.error("Failed to fetch flow data");
        }
      } catch (error) {
        console.error("Error fetching flow data:", error);
      }
    };

    fetchData();
  }, [userData]);

  return flowData;
};

export default useFetchFlowData;
