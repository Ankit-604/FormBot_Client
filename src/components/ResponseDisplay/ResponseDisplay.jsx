import styles from "./responsedisplay.module.css";
import { useUserContext } from "../../Contexts/UserContext";
import { useEffect, useState } from "react";
import { api } from "../../api/api";
import { PieChart } from "react-minimal-pie-chart";
const ResponseDisplay = () => {
  const { flowData, userData, selectedFolder, selectedForm } = useUserContext();
  const [responses, setResponses] = useState([]);
  const [analytics, setAnalytics] = useState({
    views: 0,
    starts: 0,
    completions: 0,
  });
  const label = {
    TextInput: "Input Text",
    Number: "Input Number",
    Email: "Input Email",
    Phone: "Input Phone",
    Date: "Input Date",
    Rating: "Input Rating",
    TextBubble: "Text",
    Image: "Image",
    Video: "Video",
    Gif: "GIF",
    Time: "Input Time",
    Button: "Button",
  };

  const getAnalytics = async () => {
    try {
      let userId;
      if (sessionStorage.getItem("selectedWorkspace")) {
        userId = JSON.parse(sessionStorage.getItem("selectedWorkspace"))._id;
      } else {
        userId = userData._id;
      }
      const response = await api.get(`/analytics/${userId}`, {
        params: {
          folderName: selectedFolder,
          formName: selectedForm,
        },
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    }
  };

  const getFormResponses = async () => {
    try {
      let userId;
      if (sessionStorage.getItem("selectedWorkspace")) {
        userId = JSON.parse(sessionStorage.getItem("selectedWorkspace"))._id;
      } else {
        userId = userData._id;
      }
      const response = await api.get(`/form/response/${userId}`, {
        params: {
          folderName: selectedFolder,
          formName: selectedForm,
        },
      });
      console.log(response.data);
      setResponses(response.data.responses);
    } catch (error) {
      setResponses([]);
      console.error("Error fetching form responses:", error);
    }
  };

  useEffect(() => {
    getFormResponses();
    getAnalytics();
  }, [flowData]);

  const getResponseForButton = (user, buttonType, order) => {
    console.log(user, buttonType, order);
    const response = responses.find(
      (res) =>
        res.user === user &&
        res.buttonType === buttonType &&
        res.order === order
    );
    if (response) {
      if (response.response) {
        return response.response;
      } else if (response.content) {
        return response.content;
      } else {
        return "Finish";
      }
    }
  };

  return (
    <section className={styles.responseDisplay}>
      {responses.length === 0 && (
        <div className={styles.noResWin}>
          <h1 className={styles.noRes}>No Responses Yet</h1>
        </div>
      )}
      {responses.length > 0 && (
        <>
          <div className={styles.containerView}>
            <div className={styles.views}>
              <h1>Views</h1>
              <p>{analytics.view}</p>
            </div>
            <div className={styles.views}>
              <h1>Start</h1>
              <p>{analytics.start}</p>
            </div>
          </div>
          <div className={styles.containerTable}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Timestamp</th>{" "}
                  {flowData.map((item, index) => (
                    <th key={index}>{label[item.buttonType]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {responses
                  .filter(
                    (res, index, self) =>
                      self.findIndex((t) => t.user === res.user) === index
                  )
                  .map((response, rowIndex) => (
                    <tr key={rowIndex}>
                      <td>{new Date(response.timestamp).toLocaleString()}</td>{" "}
                      {flowData.map((item, colIndex) => (
                        <td key={colIndex}>
                          {getResponseForButton(
                            rowIndex + 1,
                            item.buttonType,
                            item.order
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className={styles.ContainerAnalytics}>
            <div className={styles.pieChart}>
              <PieChart
                data={[
                  {
                    title: "",
                    value: analytics.start - analytics.completed,
                    color: `#909090`,
                  },
                  {
                    title: "Completed",
                    value: analytics.completed,
                    color: ` #3B82F6`,
                  },
                ]}
                lineWidth={15}
                startAngle={0}
                animate
              />
              <h1>Completed</h1>
              <p>{analytics.completed}</p>
            </div>
            <div className={styles.completingRate}>
              <h1>Completion Rate</h1>
              <p>
                {Math.round((analytics.completed / analytics.start) * 100)}%
              </p>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default ResponseDisplay;
