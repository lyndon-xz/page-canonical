import { usePageActions } from "../../actions";
import { getLive } from "../../live";
import { InquirySubmitError } from "../../services";
import type { InquiryForm } from "../../shared/types";

/** 只接收校验后的纯值；表单实例经 getLive 取，不从参数传入 */
export function useInquirySubmitActions() {
  const { submitInquiry } = usePageActions();

  const submit = async (values: InquiryForm) => {
    try {
      await submitInquiry(values);
      getLive("inquiryForm")?.reset();
    } catch (error) {
      const form = getLive("inquiryForm");
      if (error instanceof InquirySubmitError) {
        error.fieldErrors.forEach((fieldError) => {
          form?.setError(fieldError.field, { message: fieldError.message });
        });
      }
    }
  };

  return { submit };
}
