import styles from "./thankyou.module.css";

const ThankYou = () => {
  return (
    <div className={styles.thankYouContainer}>
      <div className={styles.content}>
        <h1>Thank You!</h1>
        <p>
          Your response has been received. Thank you for taking the time to
          share your thoughts with us.
        </p>
      </div>
    </div>
  );
};

export default ThankYou;
