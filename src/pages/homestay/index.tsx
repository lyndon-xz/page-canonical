import { FormProvider, useForm } from "react-hook-form";
import { Provider } from "react-redux";

import { usePageEffects } from "./effects";
import { useRegisterLive } from "./live";
import ConfirmDialog from "./modules/confirm-dialog";
import InquiryFields from "./modules/inquiry-fields";
import InquirySubmit from "./modules/inquiry-submit";
import ListingDetail from "./modules/listing-detail";
import ListingList from "./modules/listing-list";
import type { InquiryForm } from "./shared/inquiry";
import { store } from "./store";

import styles from "./index.module.scss";

// 单独成组件并挂在 Provider 内层：effects 要订阅状态时，重渲染只落在这个空组件上
function EffectsRunner() {
  usePageEffects();
  return null;
}

export default function HomestayPage() {
  const methods = useForm<InquiryForm>({
    // useForm 的泛型不要求 defaultValues 写全，satisfies 才校验字段完整
    defaultValues: {
      guestName: "",
      phone: "",
      checkInDate: "",
      nights: 1,
      message: "",
    } satisfies InquiryForm,
    mode: "onTouched",
  });

  useRegisterLive("inquiryForm", methods);

  return (
    <Provider store={store}>
      <div className={styles.page}>
        <EffectsRunner />
        <header className={styles.hero}>
          <p className={styles.eyebrow}>民宿 · HOMESTAY</p>
          <h1 className={styles.heroTitle}>住进当地人的家</h1>
        </header>

        <ListingList />
        <ListingDetail />

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

        {/* 挂页面层：列表卡片与详情抽屉都能触发它 */}
        <ConfirmDialog />
      </div>
    </Provider>
  );
}
