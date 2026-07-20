import { usePageActions } from "../../actions";
import { getLive } from "../../live";
import { InquirySubmitError } from "../../services";
import type { InquiryForm } from "../../shared/types";

/**
 * 模块 actions：unstated-next 下是 hook（需消费 global actions hook）。
 * submit 只接收 handleSubmit 校验后的纯值，编排提交：
 * 成功 → 经 getLive('inquiryForm') 命令式 reset 回写；
 * 失败 → 经 getLive 取实例、把服务端字段错误映射回 setError。
 * 回写 / 映射逻辑全在 action，不进 UI（§0.4 交接传纯值、回写走 getLive）。
 */
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
