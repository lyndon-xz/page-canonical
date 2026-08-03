import { Button, Input } from "antd";
import { Controller } from "react-hook-form";

import { useRegisterLive } from "../../live";

import { useBookingFormActions } from "./actions";
import { useBookingFormModel } from "./model";

import styles from "./index.module.scss";

export default function BookingForm() {
  const { form, isVisible, selectedFlight, isSubmitting, submitted } =
    useBookingFormModel();
  const { submit } = useBookingFormActions();
  useRegisterLive("bookingForm", form);

  const { control, handleSubmit, formState } = form;
  const { errors } = formState;

  if (!isVisible) {
    return null;
  }

  return (
    <section className={styles.bookingForm}>
      <span className={styles.notch} data-side="left" />
      <span className={styles.notch} data-side="right" />
      <div className={styles.head}>
        <h2 className={styles.title}>预订信息</h2>
        <span className={styles.code}>BOOKING</span>
      </div>

      {selectedFlight ? (
        <p className={styles.selected} data-status="ready">
          已选航班：{selectedFlight.airline} {selectedFlight.flightNo}（
          {selectedFlight.from} → {selectedFlight.to}）
        </p>
      ) : (
        <p className={styles.selected} data-status="empty">
          请先在航班列表中选择一个航班
        </p>
      )}

      <form
        className={styles.fields}
        onSubmit={handleSubmit((values) => submit(values))}
      >
        <div className={styles.field}>
          <label className={styles.label} htmlFor="passengerName">
            乘机人
          </label>
          <Controller
            name="passengerName"
            control={control}
            rules={{ required: "请填写乘机人" }}
            render={({ field }) => (
              <Input
                id="passengerName"
                placeholder="请输入乘机人姓名"
                status={errors.passengerName ? "error" : undefined}
                {...field}
              />
            )}
          />
          {errors.passengerName && (
            <span className={styles.error}>{errors.passengerName.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="idNumber">
            证件号
          </label>
          <Controller
            name="idNumber"
            control={control}
            rules={{ required: "请填写证件号" }}
            render={({ field }) => (
              <Input
                id="idNumber"
                placeholder="请输入证件号"
                status={errors.idNumber ? "error" : undefined}
                {...field}
              />
            )}
          />
          {errors.idNumber && (
            <span className={styles.error}>{errors.idNumber.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="contactPhone">
            联系电话
          </label>
          <Controller
            name="contactPhone"
            control={control}
            rules={{
              required: "请填写联系电话",
              pattern: { value: /^1\d{10}$/, message: "手机号格式不正确" },
            }}
            render={({ field }) => (
              <Input
                id="contactPhone"
                placeholder="请输入联系电话"
                status={errors.contactPhone ? "error" : undefined}
                {...field}
              />
            )}
          />
          {errors.contactPhone && (
            <span className={styles.error}>{errors.contactPhone.message}</span>
          )}
        </div>

        <div className={styles.actions}>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            disabled={selectedFlight === null}
          >
            提交预订
          </Button>
          {/* 成功态留在页面上：它是「已下单」这件事本身 */}
          {submitted && (
            <span className={styles.feedback} data-status="success">
              预订成功，行程确认短信将发送至你的手机
            </span>
          )}
        </div>
      </form>
    </section>
  );
}
