import { useFormContext } from "react-hook-form";

import type { InquiryForm } from "../../shared/types";

/**
 * 模块 model：经 RHF useFormContext 响应式订阅共享表单实例的 control / errors。
 * 与 inquiry-submit 共享同一个 useForm 实例（页面 index 的 FormProvider 提供），两模块互不 import。
 * FormProvider / useFormContext 是表单库自带的响应式共享能力，与状态库正交（§4.2），非额外架构策略。
 * antd 表单控件是受控组件，统一经 Controller（control）接入，故此处暴露 control 而非 register。
 */
export function useInquiryFieldsModel() {
  const { control, formState } = useFormContext<InquiryForm>();

  return { control, errors: formState.errors };
}
