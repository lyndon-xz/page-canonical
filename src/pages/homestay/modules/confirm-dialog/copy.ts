import { ConfirmScene } from "../../shared/types";

interface ConfirmCopy {
  title: string;
  /** 无补充说明的场景省略，UI 据此决定是否渲染说明段 */
  desc?: string;
  okText: string;
}

export const CONFIRM_COPY: Record<ConfirmScene, ConfirmCopy> = {
  [ConfirmScene.RemoveFavorite]: {
    title: "确认取消收藏？",
    okText: "取消收藏",
  },
  [ConfirmScene.CancelInquiry]: {
    title: "确认撤回询价？",
    desc: "撤回后房东将不再看到这条询价，已填写的信息会被清空。",
    okText: "撤回询价",
  },
};
