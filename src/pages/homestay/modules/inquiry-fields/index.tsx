import { DatePicker, Input } from "antd";
import dayjs from "dayjs";
import { Controller } from "react-hook-form";

import FormField from "@/components/form-field";
import {
  PHONE_INVALID_MESSAGE,
  PHONE_PATTERN,
  PHONE_REQUIRED_MESSAGE,
} from "@/lib/phone";

import type { Listing } from "../../shared/listing";

import { useInquiryFieldsModel } from "./model";

import styles from "./index.module.scss";

const { TextArea } = Input;

const GUEST_NAME_MAX_LENGTH = 20;
const MAX_NIGHTS = 30;
const MESSAGE_MAX_LENGTH = 200;

function buildTargetText(
  listing: Listing | null,
  hasSubmittedInquiry: boolean,
) {
  if (listing) {
    return `为「${listing.title}」询价 · ¥${listing.pricePerNight} / 晚`;
  }

  if (hasSubmittedInquiry) {
    return "本次询价已提交，撤回后可重新选择房源";
  }

  return "请先在上方选择要询价的房源";
}

export default function InquiryFields() {
  const { control, errors, listing, hasSubmittedInquiry } =
    useInquiryFieldsModel();

  return (
    <>
      <p className={styles.target} data-selected={!!listing}>
        {buildTargetText(listing, hasSubmittedInquiry)}
      </p>

      <div className={styles.fields}>
        <FormField
          label="入住人"
          htmlFor="guestName"
          error={errors.guestName?.message}
        >
          <Controller
            name="guestName"
            control={control}
            rules={{
              required: "请填写入住人",
              maxLength: {
                value: GUEST_NAME_MAX_LENGTH,
                message: `入住人姓名不超过 ${GUEST_NAME_MAX_LENGTH} 字`,
              },
            }}
            render={(renderProps) => (
              <Input
                id="guestName"
                placeholder="请输入入住人姓名"
                maxLength={GUEST_NAME_MAX_LENGTH}
                status={errors.guestName ? "error" : undefined}
                {...renderProps.field}
              />
            )}
          />
        </FormField>

        <FormField label="手机号" htmlFor="phone" error={errors.phone?.message}>
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
                  disabledDate={(current) => current.isBefore(dayjs(), "day")}
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
        >
          <Controller
            name="nights"
            control={control}
            rules={{
              required: "请填写入住晚数",
              min: { value: 1, message: "至少 1 晚" },
              max: {
                value: MAX_NIGHTS,
                message: `单次询价最多 ${MAX_NIGHTS} 晚`,
              },
              validate: (value) =>
                Number.isInteger(value) || "入住晚数须为整数",
            }}
            render={(renderProps) => {
              const { name, ref, value, onBlur, onChange } = renderProps.field;

              return (
                <Input
                  id="nights"
                  type="number"
                  min={1}
                  max={MAX_NIGHTS}
                  step={1}
                  status={errors.nights ? "error" : undefined}
                  name={name}
                  ref={ref}
                  value={value}
                  onBlur={onBlur}
                  onChange={(e) =>
                    onChange(
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                    )
                  }
                />
              );
            }}
          />
        </FormField>

        <FormField
          label="备注"
          htmlFor="message"
          error={errors.message?.message}
          className={styles.fieldWide}
        >
          <Controller
            name="message"
            control={control}
            rules={{
              maxLength: {
                value: MESSAGE_MAX_LENGTH,
                message: `备注不超过 ${MESSAGE_MAX_LENGTH} 字`,
              },
            }}
            render={(renderProps) => (
              <TextArea
                id="message"
                rows={3}
                placeholder="补充你的入住需求（选填）"
                maxLength={MESSAGE_MAX_LENGTH}
                showCount
                status={errors.message ? "error" : undefined}
                {...renderProps.field}
              />
            )}
          />
        </FormField>
      </div>
    </>
  );
}
