import { useState } from "react";
import styles from "./sharemodal.module.css"; // Ensure to style your modal as needed.
import axios from "axios";
import { useUserContext } from "../../../Contexts/UserContext";
import { api } from "../../../api/api";
import { useEffect } from "react";
const ShareModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [action, setAction] = useState("view");
  const { userData, theme } = useUserContext();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleShare = async () => {
    try {
      if (!email) {
        alert("Please enter a valid email.");
        return;
      }

      const response = await api.post(
        `/protected/access/workspaces/${userData._id}`,
        {
          email,
          permission: action,
        }
      );
      console.log("API Response:", response.data);
      alert("Invite sent successfully!");
      onClose(); // Close modal after successful API call.
    } catch (error) {
      console.error("Error sharing workspace:", error);
      alert("Failed to send invite. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.BackdropModal}>
      <div className={styles.ModalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
        <h2 className={styles.HeadingEmail}>Invite by Email</h2>
        <div className={styles.GroupForm}>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email id"
            required
          />
        </div>
        <div className={styles.GroupForm}>
          <select
            id="action"
            value={action}
            onChange={(e) => setAction(e.target.value)}
          >
            <option value="view">View</option>
            <option value="edit">Edit</option>
          </select>
        </div>
        <button className={styles.ButtonShare} onClick={handleShare}>
          Send Invite
        </button>
        <h2 className={styles.HeadingCopyLink}>Copy link</h2>
        <button className={styles.ButtonShare}>Copy link</button>
      </div>
    </div>
  );
};

export default ShareModal;
