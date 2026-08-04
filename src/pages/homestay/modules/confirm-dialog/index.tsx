import { Alert, Modal } from "antd";

import { confirmDialogActions } from "./actions";
import { useConfirmDialogModel } from "./model";
import { SCENE_COPY } from "./scenes";

import styles from "./index.module.scss";

export default function ConfirmDialog() {
  const { scene, isConfirming, confirmError } = useConfirmDialogModel();

  if (!scene) {
    return null;
  }

  const { title, desc, okText } = SCENE_COPY[scene];

  return (
    <Modal
      open
      title={title}
      okText={okText}
      cancelText="取消"
      confirmLoading={isConfirming}
      onOk={confirmDialogActions.confirm}
      onCancel={confirmDialogActions.cancel}
      width={420}
    >
      {desc && <p className={styles.desc}>{desc}</p>}
      {confirmError && (
        <Alert
          type="error"
          showIcon
          message={confirmError}
          className={styles.error}
        />
      )}
    </Modal>
  );
}
