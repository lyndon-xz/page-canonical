import { DatePicker, Input } from "antd";
import dayjs from "dayjs";
import { Controller } from "react-hook-form";

import { useInquiryFieldsModel } from "./model";

import styles from "./index.module.scss";

const { TextArea } = Input;

export default function InquiryFields() {
  const { control, errors, listing } = useInquiryFieldsModel();

  return (
    <>
      {/* 询价挂在哪套房上必须写在表单里：房源不是可填字段，用户只能从这里确认 */}
      <p className={styles.target} data-selected={!!listing}>
        {listing
          ? `为「${listing.title}」询价 · ¥${listing.pricePerNight} / 晚`
          : "请先在上方选择要询价的房源"}
      </p>

      <div className={styles.fields}>
        <div className={styles.field}>
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
            render={({ field }) => {
              const { name, ref, value, onBlur, onChange } = field;

              return (
                <Input
                  id="nights"
                  type="number"
                  min={1}
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
            render={({ field }) => (
              <TextArea
                id="message"
                rows={3}
                placeholder="补充你的入住需求（选填）"
                {...field}
              />
            )}
          />
        </div>
      </div>
    </>
  );
}
