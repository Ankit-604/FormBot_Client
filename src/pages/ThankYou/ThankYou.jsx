import styles from "./thankyou.module.css";

const ThankYou = () => {
  return (
    <div className={styles.thankYouContainer}>
      <div className={styles.overlay}>
        <h1>Thank You for your response</h1>
        <p>Your feedback helps us improve and grow. We truly appreciate it!</p>
        <img
          className={styles.image}
          src="https://www.freepik.com/free-vector/thank-you-background-with-lettering-watercolor-stain_2390314.htm#fromView=keyword&page=1&position=34&uuid=f95649b0-845f-42da-9ec3-37f985df8e8e&new_detail=true"
          alt=""
        />
      </div>
    </div>
  );
};

export default ThankYou;
