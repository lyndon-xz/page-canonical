import { Drawer } from 'antd';

import { OVERLAY_WIDTH_PX } from '../../shared/overlay';

import { listingDetailActions } from './actions';
import DetailBody from './components/detail-body';
import { useListingDetailModel } from './model';

import styles from './index.module.scss';

const { closeDetailDrawer } = listingDetailActions;

export default function ListingDetail() {
  const { isVisible, listing, isDrawerOpen } = useListingDetailModel();

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <section className={styles.inlineDetail}>
        <header className={styles.header}>
          <h2 className={styles.sectionTitle}>房源详情</h2>
          <span className={styles.hint}>点选卡片切换</span>
        </header>
        <DetailBody />
      </section>

      <Drawer
        open={isDrawerOpen}
        onClose={closeDetailDrawer}
        title={listing?.title ?? '房源详情'}
        size={OVERLAY_WIDTH_PX}
        destroyOnHidden
      >
        <DetailBody isInDrawer />
      </Drawer>
    </>
  );
}
