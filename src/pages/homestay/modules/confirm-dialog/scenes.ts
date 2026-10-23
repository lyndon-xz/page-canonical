import { ConfirmScene } from '../../shared/confirm';
import { UNFAVORITE_LABEL } from '../../shared/favorite';

interface SceneCopy {
  title: string;
  desc?: string;
  okText: string;
}

export const SCENE_COPY: Record<ConfirmScene, SceneCopy> = {
  [ConfirmScene.RemoveFavorite]: {
    title: '确认取消收藏？',
    okText: UNFAVORITE_LABEL,
  },
  [ConfirmScene.CancelInquiry]: {
    title: '确认撤回询价？',
    desc: '撤回后房东将不再看到这条询价，这次的报价同时失效。',
    okText: '撤回询价',
  },
};
