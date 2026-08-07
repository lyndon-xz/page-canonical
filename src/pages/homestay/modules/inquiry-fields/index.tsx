import { DatePicker, Input } from "antd";
import dayjs from "dayjs";
import { Controller } from "react-hook-form";

import type { Listing } from "../../shared/listing";

import { useInquiryFieldsModel } from "./model";

import styles from "./index.module.scss";

const { TextArea } = Input;

function targetText(listing: Listing | null, hasSubmittedInquiry: boolean) {
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
        {targetText(listing, hasSubmittedInquiry)}
      </p>

      <div className={styles.fields}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="guestName">
            入住人
          </label>
          <Controller
            name="guestName"
            control={control}
            rules={{
              required: "请填写入住人",
              maxLength: { value: 20, message: "入住人姓名不超过 20 字" },
            }}
            render={(renderProps) => (
              <Input
                id="guestName"
                placeholder="请输入入住人姓名"
                maxLength={20}
                status={errors.guestName ? "error" : undefined}
                {...renderProps.field}
              />
            )}
          />
          {errors.guestName && (
            <span className={styles.error}>{errors.guestName.message}</span>
          )}
        </div>

        <div className={styles.field}>
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
            render={(renderProps) => (
              <Input
                id="phone"
                placeholder="请输入手机号"
                status={errors.phone ? "error" : undefined}
                {...renderProps.field}
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
            render={(renderProps) => {
              const { value, onBlur, onChange } = renderProps.field;

              return (
                <DatePicker
                  id="checkInDate"
                  style={{ width: "100%" }}
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
              max: { value: 30, message: "单次询价最多 30 晚" },
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
                  max={30}
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
          {errors.nights && (
            <span className={styles.error}>{errors.nights.message}</span>
          )}
        </div>

        <div className={`${styles.field} ${styles.fieldWide}`}>
          <label className={styles.label} htmlFor="message">
            备注
          </label>
          <Controller
            name="message"
            control={control}
            rules={{ maxLength: { value: 200, message: "备注不超过 200 字" } }}
            render={(renderProps) => (
              <TextArea
                id="message"
                rows={3}
                placeholder="补充你的入住需求（选填）"
                maxLength={200}
                showCount
                status={errors.message ? "error" : undefined}
                {...renderProps.field}
              />
            )}
          />
          {errors.message && (
            <span className={styles.error}>{errors.message.message}</span>
          )}
        </div>
      </div>
    </>
  );
}
