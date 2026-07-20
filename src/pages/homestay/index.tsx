import { FormProvider, useForm } from "react-hook-form";

import { useRegisterLive } from "@/lib/live";

import { usePageEffects } from "./effects";
import InquiryFields from "./modules/inquiry-fields";
import InquirySubmit from "./modules/inquiry-submit";
import ListingList from "./modules/listing-list";
import type { InquiryForm } from "./shared/types";
import { PageStore } from "./store";

import styles from "./index.module.scss";

/** 询价表单默认值：活对象承载的纯值形状（InquiryForm） */
const DEFAULT_INQUIRY: InquiryForm = {
  guestName: "",
  phone: "",
  checkInDate: "",
  nights: 1,
  message: "",
};

// 渲染隔离：effects 放在返回 null 的独立组件里，且置于 Provider 内层
// （usePageEffects 依赖 usePageActions → 需消费 PageStore Container）。
function PageEffectsRunner() {
  usePageEffects();
  return null;
}

export default function HomestayPage() {
  // 建立询价表单的 useForm 实例（活对象）。mode: onTouched 让 errors 及时响应
  const methods = useForm<InquiryForm>({
    defaultValues: DEFAULT_INQUIRY,
    mode: "onTouched",
  });

  // 登记进 liveStore：供 inquiry-submit 的 action 命令式回写（reset / setError），挂载登记、卸载注销
  useRegisterLive("inquiryForm", methods);

  return (
    // Provider 层级：PageStore.Provider 最外层 → 模块 Model.Provider 内层（见 listing-list/index.tsx）
    <PageStore.Provider>
      <PageEffectsRunner />
      <div className={styles.page}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>民宿 · HOMESTAY</p>
          <h1 className={styles.heroTitle}>住进当地人的家</h1>
        </header>

        <ListingList />

        {/* FormProvider 包裹需响应式共享同一表单实例的两模块，两模块经 useFormContext 消费、互不 import（§4.2） */}
        <FormProvider {...methods}>
          <section className={styles.inquiry}>
            <span className={styles.notch} data-side="left" />
            <span className={styles.notch} data-side="right" />
            <div className={styles.inquiryHead}>
              <h2 className={styles.inquiryTitle}>发起询价</h2>
              <span className={styles.inquiryCode}>INQUIRY</span>
            </div>
            <InquiryFields />
            <InquirySubmit />
          </section>
        </FormProvider>
      </div>
    </PageStore.Provider>
  );
}
