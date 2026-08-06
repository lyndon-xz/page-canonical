import { DatePicker, Input, InputNumber } from "antd";
import dayjs from "dayjs";
import { Controller, useFormContext } from "react-hook-form";

import type { BookingForm } from "../../../../shared/booking";

import styles from "./index.module.scss";

export default function BookingFields() {
  const { control, formState } = useFormContext<BookingForm>();
  const { errors } = formState;

  return (
    <div className={styles.fields}>
      <div className={`${styles.field} ${styles.fieldWide}`}>
        <label className={styles.label} htmlFor="guestName">
          入住人
        </label>
        <Controller
          name="guestName"
          control={control}
          rules={{ required: "请填写入住人" }}
          render={({ field }) => (
            <Input
              id="guestName"
              placeholder="请输入入住人姓名"
              status={errors.guestName ? "error" : undefined}
              {...field}
            />
          )}
        />
        {errors.guestName && (
          <span className={styles.error}>{errors.guestName.message}</span>
        )}
      </div>

      <div className={`${styles.field} ${styles.fieldWide}`}>
        <label className={styles.label} htmlFor="phone">
          手机号
        </label>
        <Controller
          name="phone"
          control={control}
          rules={{
            required: "请填写手机号",
            pattern: { value: /^1\d{10}$/, message: "手机号格式不正确" },
          }}
          render={({ field }) => (
            <Input
              id="phone"
              placeholder="请输入手机号"
              status={errors.phone ? "error" : undefined}
              {...field}
            />
          )}
        />
        {errors.phone && (
          <span className={styles.error}>{errors.phone.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="checkInDate">
          入住日期
        </label>
        <Controller
          name="checkInDate"
          control={control}
          rules={{ required: "请选择入住日期" }}
          render={({ field }) => {
            const { value, onBlur, onChange } = field;

            return (
              <DatePicker
                id="checkInDate"
                style={{ width: "100%" }}
                placeholder="请选择入住日期"
                inputReadOnly
                value={value ? dayjs(value) : null}
                onChange={(_, dateString) =>
                  onChange(typeof dateString === "string" ? dateString : "")
                }
                onBlur={onBlur}
                status={errors.checkInDate ? "error" : undefined}
              />
            );
          }}
        />
        {errors.checkInDate && (
          <span className={styles.error}>{errors.checkInDate.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="nights">
          入住晚数
        </label>
        <Controller
          name="nights"
          control={control}
          rules={{
            required: "请填写入住晚数",
            min: { value: 1, message: "至少 1 晚" },
          }}
          render={({ field }) => (
            <InputNumber
              id="nights"
              style={{ width: "100%" }}
              min={1}
              max={30}
              status={errors.nights ? "error" : undefined}
              {...field}
            />
          )}
        />
        {errors.nights && (
          <span className={styles.error}>{errors.nights.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="rooms">
          房间数
        </label>
        <Controller
          name="rooms"
          control={control}
          rules={{
            required: "请填写房间数",
            min: { value: 1, message: "至少 1 间" },
          }}
          render={({ field }) => (
            <InputNumber
              id="rooms"
              style={{ width: "100%" }}
              min={1}
              max={9}
              status={errors.rooms ? "error" : undefined}
              {...field}
            />
          )}
        />
        {errors.rooms && (
          <span className={styles.error}>{errors.rooms.message}</span>
        )}
      </div>
    </div>
  );
}
