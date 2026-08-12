import { FormProvider, useForm } from "react-hook-form";
import { Provider } from "react-redux";

import PageHero from "@/components/page-hero";

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

/** 挂在 Provider 内部，effects 将来要读 store 时不必改页面结构 */
function EffectsRunner() {
  usePageEffects();
  return null;
}

export default function HomestayPage() {
  const methods = useForm<InquiryForm>({
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
        <PageHero eyebrow="民宿 · HOMESTAY" title="住进当地人的家" />

        <ListingList />
        <ListingDetail />

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

        <ConfirmDialog />
      </div>
    </Provider>
  );
}
