import { Button } from "antd";
import { FormProvider } from "react-hook-form";

import { useRegisterLive } from "../../live";

import { bookingFormActions } from "./actions";
import BookingFields from "./components/booking-fields";
import { useBookingFormEffects } from "./effects";
import { useBookingFormModel } from "./model";

import styles from "./index.module.scss";

const { submit } = bookingFormActions;

export default function BookingForm() {
  const {
    form,
    selectedHotel,
    isSubmittingBooking,
    totalPrice,
    bookingSubmitted,
  } = useBookingFormModel();
  const { handleSubmit } = form;

  useRegisterLive("bookingForm", form);
  useBookingFormEffects(form);

  return (
    <section className={styles.bookingForm}>
      <header className={styles.head}>
        <h2 className={styles.title}>预订入住</h2>
        <span className={styles.code}>BOOKING</span>
      </header>

      <p className={styles.target}>
        {selectedHotel
          ? `${selectedHotel.name} · ¥${selectedHotel.pricePerNight} / 晚`
          : "先在上方列表里选一家酒店"}
      </p>

      {/* 字段区经 useFormContext 取实例，父组件不必把 control 与 errors 逐个中转下去 */}
      <FormProvider {...form}>
        <BookingFields />
      </FormProvider>

      <div className={styles.submitBar}>
        <Button
          type="primary"
          disabled={!selectedHotel}
          loading={isSubmittingBooking}
          onClick={handleSubmit((values) => submit(values))}
        >
          提交预订
        </Button>
        {totalPrice !== null && (
          <span className={styles.total}>合计 ¥{totalPrice}</span>
        )}
        {/* 成功态留在页面上：它是「这家已订」这件事本身 */}
        {bookingSubmitted && (
          <span className={styles.feedback}>预订已提交，酒店会尽快确认</span>
        )}
      </div>
    </section>
  );
}
