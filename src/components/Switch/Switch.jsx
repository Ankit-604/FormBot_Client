import { useState, useEffect } from "react";
import { useUserContext } from "../../Contexts/UserContext";
import styles from "./Switch.module.css";
import { api, fetchUserData } from "../../api/api";

const Switch = () => {
  const { theme, setTheme } = useUserContext();
  const userData = JSON.parse(localStorage.getItem("userData"));

  const [checked, setChecked] = useState(
    userData?.theme === "dark" ? true : false
  );

  useEffect(() => {
    const getTheme = async () => {
      const userId = JSON.parse(localStorage.getItem("userId"));
      if (userId) {
        try {
          const response = await fetchUserData(userId);
          console.log("User data fetched:", response.data);

          setTheme(response.data.user.theme);
          localStorage.setItem("theme", response.data.user.theme);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    getTheme();
  }, []);

  useEffect(() => {
    setChecked(theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const updateTheme = async () => {
      const userId = localStorage.getItem("userId");
      if (userId) {
        try {
          const response = await api.put(`/user/${userId}`, {
            theme,
          });
          await fetchUserData(userData._id);
        } catch (error) {
          console.error("Error updating theme:", error);
        }
      }
    };
    updateTheme();
  }, [theme]);

  const handleSwitchToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  return (
    <div className={styles.switch}>
      <button
        id="basic-switch"
        className={`${styles.switchMDA} ${
          checked ? styles.switchSelectedMDA : ""
        }`}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={handleSwitchToggle}
      >
        <div className={styles.mdcSwitchTrack}></div>
        <div className={styles.switchHandleTrackMDA}>
          <div className={styles.switchHandleMDA}>
            <div className={styles.mdcSwitchShadow}>
              <div className={styles.mdcElevationOverlay}></div>
            </div>
            <div className={styles.mdcSwitchRipple}></div>
            <div className={styles.mdcSwitchIcons}>
              <svg
                className={`${styles.switchIconMDA} ${
                  checked ? "" : styles.mdcSwitchIconHidden
                }`}
                viewBox="0 0 24 24"
              >
                <path d="M19.69,5.23L8.96,15.96l-4.23-4.23L2.96,13.5l6,6L21.46,7L19.69,5.23z" />
              </svg>
              <svg
                className={`${styles.switchIconMDA} ${
                  !checked ? "" : styles.mdcSwitchIconHidden
                }`}
                viewBox="0 0 24 24"
              >
                <path d="M20 13H4v-2h16v2z" />
              </svg>
            </div>
          </div>
        </div>
        <span className={styles.switchFocusWrapMDA}>
          <div className={styles.switchFocusRingMDA}></div>
        </span>
      </button>
    </div>
  );
};

export default Switch;
