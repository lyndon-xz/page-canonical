import { Alert, Modal } from "antd";

import { confirmDialogActions } from "./actions";
import { CONFIRM_COPY } from "./copy";
import { useConfirmDialogModel } from "./model";

import styles from "./index.module.scss";

export default function ConfirmDialog() {
  const { scene, isConfirming, confirmError } = useConfirmDialogModel();

  // scene 为 null 即关闭，省掉一个必须与场景同步变更的 isOpen
  if (!scene) {
    return null;
  }

  const { title, desc, okText } = CONFIRM_COPY[scene];

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
