import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../Contexts/UserContext";
import { api } from "../api/api";

const useAuth = () => {
  const { setUserData, setUserId, setIsLoggedIn } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    const authenticateUser = async () => {
      try {
        const userId = localStorage.getItem("userId");

        if (!userId) {
          navigate("/login");
          return;
        }

        const userResponse = await api.get(`/protected/user/${userId}`);
        if (userResponse.data) {
          setUserId(userResponse.data.user._id);
          setUserData({
            ...userResponse.data.user,
            userId: userResponse.data.user._id,
          });
          setIsLoggedIn(true);
        } else {
          console.error("User data not found");
          navigate("/login");
        }
      } catch (error) {
        console.error("Error during authentication:", error);
        navigate("/login");
      }
    };

    authenticateUser();
  }, [navigate, setUserData, setUserId]);
};

export default useAuth;
