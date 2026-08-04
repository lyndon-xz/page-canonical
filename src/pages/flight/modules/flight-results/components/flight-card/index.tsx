import { useFlightResultsActions } from "../../actions";
import type { Flight } from "../../../../shared/types";

import styles from "./index.module.scss";

interface FlightCardProps {
  flight: Flight;
  selected: boolean;
}

export default function FlightCard(props: FlightCardProps) {
  const { flight, selected } = props;
  const { selectFlight } = useFlightResultsActions();
  const {
    id,
    airline,
    flightNo,
    departTime,
    from,
    arriveTime,
    to,
    cabin,
    price,
  } = flight;

  return (
    <article
      className={styles.card}
      data-selected={selected}
      onClick={() => selectFlight(id)}
    >
      <div className={styles.head}>
        <h3 className={styles.airline}>{airline}</h3>
        <span className={styles.flightNo}>{flightNo}</span>
      </div>

      <div className={styles.route}>
        <div className={styles.point}>
          <div className={styles.time}>{departTime}</div>
          <div className={styles.city}>{from}</div>
        </div>
        <div className={styles.line} />
        <div className={styles.point}>
          <div className={styles.time}>{arriveTime}</div>
          <div className={styles.city}>{to}</div>
        </div>
      </div>

      <div className={styles.foot}>
        <span className={styles.cabin}>{cabin}</span>
        <span className={styles.price}>¥{price}</span>
      </div>
    </article>
  );
}
