import { ConfirmScene } from "../../shared/confirm";

interface SceneCopy {
  title: string;
  // 无补充说明的场景省略，UI 据此决定是否渲染说明段
  desc?: string;
  okText: string;
}

/** 两个场景共用一套弹窗结构，差异全部收在这张表里 */
export const SCENE_COPY: Record<ConfirmScene, SceneCopy> = {
  [ConfirmScene.RemoveFavorite]: {
    title: "确认取消收藏？",
    okText: "取消收藏",
  },
  [ConfirmScene.CancelInquiry]: {
    title: "确认撤回询价？",
    desc: "撤回后房东将不再看到这条询价，这次的报价同时失效。",
    okText: "撤回询价",
  },
};
