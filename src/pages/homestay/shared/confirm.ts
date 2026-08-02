import { ConfirmScene } from "./types";

interface ConfirmCopy {
  title: string;
  okText: string;
  /** 无补充说明的场景省略，UI 据此决定是否渲染说明段 */
  desc?: string;
}

/**
 * 场景 → 文案。放 shared/ 而非确认弹窗模块内，是因为触发方（列表卡片、详情抽屉）
 * 也要用它渲染入口按钮的措辞，两处必须同源，否则按钮说「移除」弹窗说「删除」。
 */
export function resolveConfirmCopy(scene: ConfirmScene): ConfirmCopy {
  if (scene === ConfirmScene.RemoveFavorite) {
    return {
      title: "确认取消收藏？",
      okText: "取消收藏",
    };
  }

  return {
    title: "确认撤回询价？",
    desc: "撤回后房东将不再看到这条询价，已填写的信息会被清空。",
    okText: "撤回询价",
  };
}
