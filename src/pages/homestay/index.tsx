import { FormProvider, useForm } from "react-hook-form";

import { useRegisterLive } from "@/lib/live";

import { usePageEffects } from "./effects";
import InquiryFields from "./modules/inquiry-fields";
import InquirySubmit from "./modules/inquiry-submit";
import ListingList from "./modules/listing-list";
import type { InquiryForm } from "./shared/types";
import { PageStore } from "./store";

import styles from "./index.module.scss";

const DEFAULT_INQUIRY: InquiryForm = {
  guestName: "",
  phone: "",
  checkInDate: "",
  nights: 1,
  message: "",
};

// 单独成组件：effects 内部订阅状态引起的重渲染只落在这个空组件上，不波及子树。
// 必须挂在 PageStore.Provider 内层，否则 usePageActions 取不到 Container。
function PageEffectsRunner() {
  usePageEffects();
  return null;
}

export default function HomestayPage() {
  const methods = useForm<InquiryForm>({
    defaultValues: DEFAULT_INQUIRY,
    mode: "onTouched",
  });

  // 经 liveStore 交给 inquiry-submit 的 action 回写（reset / setError）
  useRegisterLive("inquiryForm", methods);

  return (
    <PageStore.Provider>
      <PageEffectsRunner />
      <div className={styles.page}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>民宿 · HOMESTAY</p>
          <h1 className={styles.heroTitle}>住进当地人的家</h1>
        </header>

        <ListingList />

        {/* 让下面两个模块经 useFormContext 共享同一表单实例，避免两模块互相 import */}
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
