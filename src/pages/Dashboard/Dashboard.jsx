import { useState, useEffect } from "react";
import styles from "./dashboard.module.css";
import Switch from "../../components/Switch/Switch";
import { useUserContext } from "../../Contexts/UserContext";
import useAuth from "../../customHooks/useAuth";
import {
  createFolder,
  deleteFolder,
  createForm,
  deleteForm,
} from "../../api/api";
import useFetchFolders from "../../customHooks/useFetchFolders";
import { useNavigate } from "react-router-dom";
import { fetchUserData } from "../../api/api";
import Settings from "../../components/Settings/Settings";
import ShareModal from "./components/ShareModal";
import useFetchAccessibleWorkpaces from "../../customHooks/useFetchAccessibleWorkspaces";
const Dashboard = () => {
  useAuth();

  const navigate = useNavigate();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState("");
  const [folderName, setFolderName] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isFormDeleteModalOpen, setIsFormDeleteModalOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState("");
  const [formName, setFormName] = useState("");
  const {
    folders,
    setFolders,
    setSelectedForm,
    selectedFolder,
    setSelectedFolder,
    workspaces,
    theme,
    permission,
    setPermission,
  } = useUserContext();

  const [forms, setForms] = useState([]);
  const [error, setError] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState("");
  const [workspaceList, setWorkspaceList] = useState(workspaces || []);

  useFetchAccessibleWorkpaces(setSelectedWorkspace);
  useFetchFolders();
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {}, [forms]);

  useEffect(() => {}, [selectedWorkspace]);

  useEffect(() => {}, [permission]);

  useEffect(() => {}, [selectedWorkspace]);

  const handleWorkspaceClick = async (workspaceId) => {
    try {
      const workspaceData = await fetchUserData(workspaceId);
      if (workspaceData) {
        setSelectedWorkspace(workspaceData);
        sessionStorage.setItem(
          "selectedWorkspace",
          JSON.stringify(workspaceData)
        );
        const reorderedWorkspaces = workspaces.filter(
          (id) => id !== workspaceId
        );
        setWorkspaceList([workspaces, ...reorderedWorkspaces]);

        const folderForms =
          JSON.parse(localStorage.getItem("folderForms")) || {};
        const folderNamesArray = Object.keys(folderForms);
        setFolders(folderNamesArray);
        setForms([]);
        setSelectedFolder("");

        const workspacesAvailable = workspaces;
        const matchingWorkspace = workspacesAvailable.find(
          (workspace) => workspace.userId === workspaceId
        );

        if (matchingWorkspace) {
          setPermission(matchingWorkspace.permission);
        }
      }
    } catch (error) {
      console.error("Error fetching workspace data:", error);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownVisible((prev) => !prev);
  };

  const handleCreateFolderClick = () => {
    setIsFolderModalOpen(true);
  };

  const handleFolderClick = (folderName) => {
    if (selectedFolder === folderName) {
      setSelectedFolder("");
      sessionStorage.removeItem("selectedFolder");
      return;
    } else {
      setSelectedFolder(folderName);
      sessionStorage.setItem("selectedFolder", folderName);
    }

    const allForms = JSON.parse(localStorage.getItem("folderForms")) || [];
    if (allForms[folderName]) {
      setForms(allForms[folderName]);
    } else {
      setForms([]);
    }
  };

  const handleCloseModal = () => {
    setError("");
    setIsFolderModalOpen(false);
    setFolderName("");
  };

  const handleFolderDone = async () => {
    if (folderName.trim()) {
      try {
        if (folders.some((folder) => folder === folderName)) {
          setError("Folder with this name already exists");
          return;
        }

        const currentFolderData = await createFolder(folderName);
        if (currentFolderData === "UserId not found") {
          navigate("/login");
          return;
        }
        fetchUserData();
        setFolders(currentFolderData);

        handleCloseModal();
      } catch (error) {
        console.error("Error creating folder:", error);
        alert("Failed to create folder. Please try again.");
      }
    } else {
      alert("Please enter a folder name");
    }
  };

  const confirmDeleteFolder = (folderName) => {
    setFolderToDelete(folderName);
    setIsDeleteModalOpen(true);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setFolderToDelete("");
  };

  const handleDeleteFolder = async () => {
    try {
      const currentFolderData = await deleteFolder(folderToDelete);
      if (currentFolderData === "UserId not found") {
        navigate("/login");
        return;
      }

      setFolders(currentFolderData.folders);
      setIsDeleteModalOpen(false);
      setFolderToDelete("");
      fetchUserData();
    } catch (error) {
      console.error("Error deleting folder:", error);
      alert("Failed to delete folder. Please try again.");
    }
  };

  const handleCreateFormClick = () => {
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setFormName("");
    setError("");
  };

  const handleFormDone = async () => {
    if (selectedFolder.trim()) {
      try {
        const folderForms =
          JSON.parse(localStorage.getItem("folderForms")) || {};

        if (folderForms[selectedFolder]?.includes(formName)) {
          console.log(
            "Form with this name already exists in the selected folder"
          );
          setError("Form with this name already exists in the selected folder");
          return;
        }

        const currentFormData = await createForm(formName, selectedFolder);

        if (currentFormData === "UserId not found") {
          navigate("/login");
          return;
        }

        if (currentFormData === "Form already exists") {
          setError("Form already exists");
          return;
        }

        setForms(currentFormData[selectedFolder]);

        fetchUserData();

        handleCloseFormModal();
      } catch (error) {
        console.error("Error creating form:", error);
        alert("Failed to create form. Please try again.");
      }
    } else {
      alert("Please select a folder");
      handleCloseFormModal();
    }
  };

  const confirmDeleteForm = (formName) => {
    setFormToDelete(formName);
    setIsFormDeleteModalOpen(true);
  };

  const handleCancelFormDelete = () => {
    setIsFormDeleteModalOpen(false);
    setFormToDelete("");
  };

  const handleDeleteForm = async () => {
    try {
      const currentFormData = await deleteForm(formToDelete, selectedFolder);
      if (currentFormData === "Form not found") {
        alert("Form not found. Please try again.");
        return;
      }

      if (Object.keys(currentFormData).length === 0) {
        console.log("currentFormData", currentFormData);
        setForms([]);
        setIsFormDeleteModalOpen(false);
        setFormToDelete("");
        fetchUserData();
        return;
      }

      setForms(currentFormData[selectedFolder]);
      setIsFormDeleteModalOpen(false);
      setFormToDelete("");
      fetchUserData();
    } catch (error) {
      console.error("Error deleting form:", error);
      alert("Failed to delete form. Please try again.");
    }
  };

  const handleFormClick = (formName) => {
    setSelectedForm(formName);
    sessionStorage.setItem("selectedForm", formName);
    navigate("/editor");
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <>
      {isSettingsOpen ? (
        <Settings setIsSettingsOpen={setIsSettingsOpen} />
      ) : (
        <section className={styles.dashboard}>
          <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
          />
          <nav className={styles.navBar}>
            <div className={styles.ContainerLeft}>
              {!isDropdownVisible && (
                <div
                  role="button"
                  onClick={toggleDropdown}
                  className={styles.SelectorWorkSpace}
                >
                  <h1>{`${selectedWorkspace.username}'s workspace`}</h1>
                  <img
                    className={styles.downArrow}
                    src={
                      theme === "light"
                        ? "https://res.cloudinary.com/dtu64orvo/image/upload/v1734862852/arrow-down-sign-to-navigate_pfxwn8.png"
                        : "https://res.cloudinary.com/dtu64orvo/image/upload/v1734852265/options_ffofkm.png"
                    }
                    alt="options"
                  />
                </div>
              )}
              {isDropdownVisible && (
                <div
                  role="button"
                  onClick={toggleDropdown}
                  className={styles.dropdown}
                >
                  <ul>
                    {workspaces &&
                      workspaces.map((workspace) => (
                        <li
                          key={workspace.userId}
                          onClick={() => handleWorkspaceClick(workspace.userId)}
                        >
                          <p>{`${workspace.username}'s workspace`}</p>
                        </li>
                      ))}
                    <li onClick={() => setIsSettingsOpen(true)}>Settings</li>
                    <li onClick={handleLogout}>Log Out</li>
                  </ul>
                </div>
              )}
            </div>
            <div className={styles.ContainerRight}>
              <div className={styles.SelectorTheme}>
                <label htmlFor="basic-switch">Light</label>
                <Switch />
                <label htmlFor="basic-switch">Dark</label>
              </div>
              {permission === "edit" && (
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className={styles.share}
                >
                  Share
                </button>
              )}
            </div>
          </nav>
          <div className={styles.workspace}>
            <div className={styles.content}>
              <div className={styles.NavbarFolder}>
                <ul>
                  {permission === "edit" && (
                    <li role="button" onClick={handleCreateFolderClick}>
                      <img
                        className={styles.createFolder}
                        src={
                          theme === "light"
                            ? "https://res.cloudinary.com/dtu64orvo/image/upload/v1734924297/add-folder_w0os8e.png"
                            : "https://res.cloudinary.com/dtu64orvo/image/upload/v1734865182/SVG_3_fawuu1.png"
                        }
                        alt="create folder"
                      />
                      Create a folder
                    </li>
                  )}

                  {folders.map((folder, index) => (
                    <li
                      onClick={() => handleFolderClick(folder)}
                      className={folder === selectedFolder ? styles.active : ""}
                      key={index}
                    >
                      {folder}
                      {permission === "edit" && (
                        <img
                          role="button"
                          onClick={() => confirmDeleteFolder(folder)}
                          className={styles.deleteFolder}
                          src="https://res.cloudinary.com/dtu64orvo/image/upload/v1734865860/delete_obpnmw.png"
                          alt="delete folder"
                        />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={styles.AreaForm}>
                <ul>
                  {permission === "edit" && (
                    <li
                      className={styles.create}
                      role="button"
                      onClick={handleCreateFormClick}
                    >
                      <img
                        src="https://res.cloudinary.com/dtu64orvo/image/upload/v1734893036/SVG_4_zwan4q.png"
                        alt="add"
                      />
                      <h3>Create a typebot</h3>
                    </li>
                  )}

                  {selectedFolder &&
                    forms.map((form, index) => (
                      <li onClick={() => handleFormClick(form)} key={index}>
                        {form}
                        {permission === "edit" && (
                          <img
                            role="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              confirmDeleteForm(form);
                            }}
                            className={styles.deleteButton}
                            src="https://res.cloudinary.com/dtu64orvo/image/upload/v1734893849/delete_dvkcex.svg"
                            alt="delete"
                          />
                        )}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>

          {isFolderModalOpen && (
            <div className={styles.Modal}>
              <div className={styles.ModalContent}>
                <h3>Create New Folder</h3>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="Enter folder name"
                  className={styles.InputModal}
                />
                <p className={styles.error}>{error}</p>
                <div className={styles.modalActions}>
                  <div className={styles.leftSide}>
                    <button
                      onClick={handleFolderDone}
                      className={styles.ButtonDone}
                    >
                      Done
                    </button>
                  </div>
                  <div className={styles.rightSide}>
                    <button
                      onClick={handleCloseModal}
                      className={styles.ButtonCancel}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isDeleteModalOpen && (
            <div className={styles.deleteModal}>
              <div className={styles.ModalContent}>
                <h3>Are you sure you want to delete this folder?</h3>
                <div className={styles.modalActions}>
                  <button
                    onClick={handleDeleteFolder}
                    className={styles.ButtonDone}
                  >
                    Yes
                  </button>
                  <button
                    onClick={handleCancelDelete}
                    className={styles.ButtonCancel}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}
          {isFormModalOpen && (
            <div className={styles.Modal}>
              <div className={styles.ModalContent}>
                <h3>Create New Form</h3>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Enter form name"
                  className={styles.InputModal}
                />
                <p className={styles.error}>{error}</p>
                <div className={styles.modalActions}>
                  <div className={styles.leftSide}>
                    <button
                      onClick={handleFormDone}
                      className={styles.ButtonDone}
                    >
                      Done
                    </button>
                  </div>
                  <div className={styles.rightSide}>
                    <button
                      onClick={handleCloseFormModal}
                      className={styles.ButtonCancel}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isFormDeleteModalOpen && (
            <div className={styles.deleteModal}>
              <div className={styles.ModalContent}>
                <h3>Are you sure you want to delete this form?</h3>
                <div className={styles.modalActions}>
                  <button
                    onClick={handleDeleteForm}
                    className={styles.ButtonDone}
                  >
                    Yes
                  </button>
                  <button
                    onClick={handleCancelFormDelete}
                    className={styles.ButtonCancel}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </>
  );
};

export default Dashboard;
