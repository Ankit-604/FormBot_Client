import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import styles from "./formbot.module.css";
import ClipLoader from "react-spinners/ClipLoader";
import { useRef } from "react";
import { api } from "../../api/api";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
const FormBot = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [queryParams, setQueryParams] = useState({
    userId: "",
    formName: "",
    folderName: "",
  });
  const [messages, setMessages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [showRatingInput, setShowRatingInput] = useState(false);
  const [tempRating, setTempRating] = useState(0);
  const [hasSentTextInput, setHasSentTextInput] = useState(false);
  const [hasSentDatePicker, setHasSentDatePicker] = useState(false);
  const [hasSentRatingInput, setHasSentRatingInput] = useState(false);
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const [inputPlaceholder, setInputPlaceholder] = useState(
    "Type your message..."
  );
  const [isSubmitButton, setIsSubmitButton] = useState(false);
  const [inputType, setInputType] = useState("text");
  const [responses, setResponses] = useState([]);
  const [flowData, setFlowData] = useState([]);
  const chatDisplayRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (chatDisplayRef.current) {
      chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get("userId") || "";
    const formName = params.get("formName") || "";
    const folderName = params.get("folderName") || "";

    setQueryParams({ userId, formName, folderName });
  }, [location.search]);

  useEffect(() => {
    if (queryParams.userId) {
      updateAnalytics("view");
    }
  }, [queryParams]);

  useEffect(() => {
    const fetchData = async () => {
      if (!queryParams.userId) {
        return;
      }
      try {
        const response = await api.get(`/form/${queryParams.userId}`, {
          params: {
            formName: queryParams.formName,
            folderName: queryParams.folderName,
          },
        });
        if (response.status === 200) {
          const data = response.data;
          console.log(response);

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
  }, [queryParams]);

  useEffect(() => {
    if (flowData.length > 0 && currentIndex < flowData.length) {
      processFlowData(currentIndex);
    }
  }, [flowData, currentIndex]);
  const processFlowData = (index) => {
    const currentFlow = flowData[index];

    if (!currentFlow) return;

    if (messages.some((msg) => msg.index === index)) return;

    setIsInputDisabled(true);

    const newMessage = {
      type: "bot",
      content: currentFlow.content,
      index,
    };

    switch (currentFlow.buttonType) {
      case "TextBubble":
        setInputPlaceholder("Type your message...");
        setMessages((prev) => [...prev, newMessage]);
        setTimeout(() => setCurrentIndex((prev) => prev + 1), 1000);
        break;
      case "Image":
        setMessages((prev) => [...prev, { ...newMessage, isImage: true }]);
        setTimeout(() => setCurrentIndex((prev) => prev + 1), 1000);
        break;
      case "Gif":
        setMessages((prev) => [...prev, { ...newMessage, isGif: true }]);
        setTimeout(() => setCurrentIndex((prev) => prev + 1), 1000);
        break;
      case "TextInput":
        if (!hasSentTextInput) {
          setMessages((prev) => [...prev, { type: "bot", content: " " }]);
          setHasSentTextInput(true);
          setIsInputDisabled(false);
          setInputPlaceholder("Please enter your response...");
        }
        break;
      case "Date":
        if (!hasSentDatePicker) {
          setMessages((prev) => [
            ...prev,
            { type: "bot", content: "Please select a date." },
          ]);
          setShowDatePicker(true);
          setHasSentDatePicker(true);
        }
        break;
      case "Rating":
        if (
          !hasSentRatingInput ||
          currentIndex !==
            flowData.findIndex((item) => item.buttonType === "Rating")
        ) {
          setMessages((prev) => [
            ...prev,
            {
              type: "bot",
              content: "Please provide a rating (1 to 5 stars).",
            },
          ]);
          setShowRatingInput(true);
          setHasSentRatingInput(true);
          setIsInputDisabled(false);
        }
        break;
      case "Number":
        setInputType("number");
        setInputPlaceholder("Please enter a number...");
        setMessages((prev) => [
          ...prev,
          { ...newMessage, content: "Please enter a number." },
        ]);
        setIsInputDisabled(false);
        break;
      case "Email":
        setInputType("email");
        setInputPlaceholder("Please enter your email...");
        setMessages((prev) => [
          ...prev,
          { ...newMessage, content: "Please enter your email." },
        ]);
        setIsInputDisabled(false);
        break;
      case "Phone":
        setInputType("phone");
        setInputPlaceholder("Please enter your phone number...");
        setMessages((prev) => [
          ...prev,
          { ...newMessage, content: "Please enter your phone number." },
        ]);
        setIsInputDisabled(false);
        break;
      case "Button":
        setMessages((prev) => [
          ...prev,
          { ...newMessage, content: "Please press the Submit Button" },
        ]);
        setHasSentTextInput(false);
        setInputPlaceholder("");
        setIsSubmitButton(true);
        break;
      default:
        break;
    }
  };

  const handleUserInput = () => {
    console.log("tempDate", tempDate);

    if (showDatePicker && tempDate) {
      const response = {
        buttonType: "Date",
        order: currentIndex,
        response: tempDate,
      };

      if (responses.length === 0) {
        updateAnalytics("start");
      }

      setMessages((prev) => [
        ...prev,
        { type: "user", content: tempDate.toLocaleDateString() },
      ]);

      setResponses((prev) => [...prev, response]);
      setTempDate(null);
      setShowDatePicker(false);
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    if (!isInputDisabled && userInput.trim()) {
      const currentFlow = flowData[currentIndex];
      if (currentFlow && currentFlow.buttonType) {
        switch (currentFlow.buttonType) {
          case "Number":
            if (isNaN(userInput) || userInput.trim() === "") {
              alert("Please enter a valid number.");
              return;
            }
            break;

          case "Email":
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userInput)) {
              alert("Please enter a valid email address.");
              return;
            }
            break;

          case "Phone":
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(userInput)) {
              alert("Please enter a valid 10-digit phone number.");
              return;
            }
            break;

          default:
            break;
        }
      }

      const response = {
        buttonType: currentFlow.buttonType,
        order: currentIndex,
        response: userInput,
      };

      if (responses.length === 0) {
        updateAnalytics("start");
      }

      setMessages((prev) => [...prev, { type: "user", content: userInput }]);
      setResponses((prev) => [...prev, response]);
      setUserInput("");
      setCurrentIndex((prev) => prev + 1);

      if (currentFlow.buttonType === "TextInput") {
        setHasSentTextInput(false);
      }
    }
  };

  const updateAnalytics = async (type) => {
    try {
      const response = await api.put(`/analytics/${queryParams.userId}`, {
        folderName: queryParams.folderName,
        formName: queryParams.formName,
        analytics: type,
      });
      console.log(`Analytics updated with ${type}:`, response);
    } catch (error) {
      console.error("Error updating analytics with 'start':", error);
    }
  };

  const handleDateSelection = (date) => {
    console.log(date);
    setTempDate(date);
  };

  const handleRatingSelection = (rating) => {
    setTempRating(rating);
  };

  const confirmRatingSelection = () => {
    console.log(tempRating);
    if (tempRating > 0) {
      const response = {
        buttonType: "Rating",
        order: currentIndex,
        response: tempRating,
      };

      setMessages((prev) => [
        ...prev,
        {
          type: "user",
          content: `Selected Rating: ${tempRating} Stars`,
        },
      ]);
      setResponses((prev) => [...prev, response]);
      setTempRating(0);
      setShowRatingInput(false);
      setCurrentIndex((prev) => prev + 1);

      if (responses.length === 0) {
        updateAnalytics("start");
      }
    } else {
      alert("Please select a rating before confirming.");
    }
  };

  const submitFormResponses = () => {
    console.log("Responses:", responses);
    setIsLoading(true);

    const timestamp = new Date();

    const responsesWithFlowData = flowData.map((flow, index) => {
      const userResponse = responses.find(
        (response) => response.order === index
      );

      return {
        buttonType: flow.buttonType,
        content: flow.content,
        response: userResponse ? userResponse.response : null,
        order: index + 1,
        timestamp: timestamp,
      };
    });

    api
      .post(`/form/response/${queryParams.userId}`, {
        folderName: queryParams.folderName,
        formName: queryParams.formName,
        responses: responsesWithFlowData,
      })
      .then((response) => {
        console.log("Responses submitted successfully", response);
        setIsLoading(false);
        updateAnalytics("completed");
        navigate("/thankyou");
      })
      .catch((error) => {
        console.error("Error submitting responses", error);
      });
  };

  return (
    <div className={styles.container}>
      <div className={styles.chatDisplay} ref={chatDisplayRef}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={
              msg.type === "bot" ? styles.MessageBot : styles.MessageUser
            }
          >
            {msg.isImage || msg.isGif ? (
              <img src={msg.content} alt="Media" />
            ) : (
              msg.content
            )}
          </div>
        ))}
      </div>

      {/* Show rating input if requested */}
      {showRatingInput && (
        <div className={styles.InputSectionText}>
          <div className={`${styles.BoxRating} `}>
            <div className={styles.BubblesRating}>
              {[1, 2, 3, 4, 5].map((number) => (
                <div
                  key={number}
                  className={`${styles.bubble} ${
                    tempRating >= number ? styles.bubbleSelected : ""
                  }`}
                  onClick={() => handleRatingSelection(number)}
                >
                  {number}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={confirmRatingSelection}
            className={styles.confirmButton}
          >
            <img
              src="https://res.cloudinary.com/dtu64orvo/image/upload/v1735151031/send.svg"
              alt="Send"
            />
          </button>
        </div>
      )}

      {/* Input section, shown only when 'Rating' type is not active */}
      {!isSubmitButton && !showRatingInput && (
        <div className={`${styles.InputSectionText} `}>
          {!showDatePicker && (
            <input
              className={`${isInputDisabled ? "disabledInput" : ""}`}
              disabled={isInputDisabled}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={inputPlaceholder}
            />
          )}

          {showDatePicker && (
            <DatePicker
              selected={tempDate}
              onChange={(date) => handleDateSelection(date)}
              dateFormat="yyyy/MM/dd"
              className={styles.datePicker}
              placeholderText="Select date and time"
            />
          )}
          {showDatePicker ? (
            <button
              disabled={showDatePicker && !tempDate}
              onClick={handleUserInput}
              className={`${styles.submitButton} ${
                isInputDisabled ? styles.disabledInput : ""
              }`}
            >
              <img
                src="https://res.cloudinary.com/dtu64orvo/image/upload/v1735151031/send.svg"
                alt="Send"
              />
            </button>
          ) : (
            <button
              disabled={isInputDisabled}
              onClick={handleUserInput}
              className={`${styles.submitButton} ${
                isInputDisabled ? styles.disabledInput : ""
              }`}
            >
              <img
                src="https://res.cloudinary.com/dtu64orvo/image/upload/v1735151031/send.svg"
                alt="Send"
              />
            </button>
          )}
        </div>
      )}
      {isSubmitButton && (
        <div className={styles.ButtonSubmitContainer}>
          <button
            onClick={submitFormResponses}
            className={`${styles.submitButton} ${styles.final}`}
          >
            {isLoading ? <ClipLoader color="white" size={25} /> : "Submit"}
          </button>
        </div>
      )}
    </div>
  );
};

export default FormBot;
