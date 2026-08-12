import { DatePicker, Input, InputNumber } from "antd";
import dayjs from "dayjs";
import { Controller, useFormContext } from "react-hook-form";

import FormField from "@/components/form-field";
import {
  PHONE_INVALID_MESSAGE,
  PHONE_PATTERN,
  PHONE_REQUIRED_MESSAGE,
} from "@/lib/phone";

import type { BookingForm } from "../../../../shared/booking";

import styles from "./index.module.scss";

const MAX_NIGHTS = 30;
const MAX_ROOMS = 9;

export default function BookingFields() {
  const { control, formState } = useFormContext<BookingForm>();
  const { errors } = formState;

  return (
    <div className={styles.fields}>
      <FormField
        label="入住人"
        htmlFor="guestName"
        error={errors.guestName?.message}
        className={styles.fieldWide}
      >
        <Controller
          name="guestName"
          control={control}
          rules={{ required: "请填写入住人" }}
          render={(renderProps) => (
            <Input
              id="guestName"
              placeholder="请输入入住人姓名"
              status={errors.guestName ? "error" : undefined}
              {...renderProps.field}
            />
          )}
        />
      </FormField>

      <FormField
        label="手机号"
        htmlFor="phone"
        error={errors.phone?.message}
        className={styles.fieldWide}
      >
        <Controller
          name="phone"
          control={control}
          rules={{
            required: PHONE_REQUIRED_MESSAGE,
            pattern: { value: PHONE_PATTERN, message: PHONE_INVALID_MESSAGE },
          }}
          render={(renderProps) => (
            <Input
              id="phone"
              placeholder="请输入手机号"
              status={errors.phone ? "error" : undefined}
              {...renderProps.field}
            />
          )}
        />
      </FormField>

      <FormField
        label="入住日期"
        htmlFor="checkInDate"
        error={errors.checkInDate?.message}
        className={styles.field}
      >
        <Controller
          name="checkInDate"
          control={control}
          rules={{ required: "请选择入住日期" }}
          render={(renderProps) => {
            const { value, onBlur, onChange } = renderProps.field;

            return (
              <DatePicker
                id="checkInDate"
                placeholder="请选择入住日期"
                inputReadOnly
                value={value === "" ? null : dayjs(value)}
                onChange={(_, dateString) =>
                  onChange(typeof dateString === "string" ? dateString : "")
                }
                onBlur={onBlur}
                status={errors.checkInDate ? "error" : undefined}
              />
            );
          }}
        />
      </FormField>

      <FormField
        label="入住晚数"
        htmlFor="nights"
        error={errors.nights?.message}
        className={styles.field}
      >
        <Controller
          name="nights"
          control={control}
          rules={{
            required: "请填写入住晚数",
            min: { value: 1, message: "至少 1 晚" },
            max: {
              value: MAX_NIGHTS,
              message: `单次预订最多 ${MAX_NIGHTS} 晚`,
            },
          }}
          render={(renderProps) => (
            <InputNumber
              id="nights"
              min={1}
              max={MAX_NIGHTS}
              status={errors.nights ? "error" : undefined}
              {...renderProps.field}
            />
          )}
        />
      </FormField>

      <FormField
        label="房间数"
        htmlFor="rooms"
        error={errors.rooms?.message}
        className={styles.field}
      >
        <Controller
          name="rooms"
          control={control}
          rules={{
            required: "请填写房间数",
            min: { value: 1, message: "至少 1 间" },
            max: { value: MAX_ROOMS, message: `单次预订最多 ${MAX_ROOMS} 间` },
          }}
          render={(renderProps) => (
            <InputNumber
              id="rooms"
              min={1}
              max={MAX_ROOMS}
              status={errors.rooms ? "error" : undefined}
              {...renderProps.field}
            />
          )}
        />
      </FormField>
    </div>
  );
}
