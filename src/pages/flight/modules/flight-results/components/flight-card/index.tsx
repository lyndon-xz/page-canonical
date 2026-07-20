import { flightResultsActions } from "../../actions";
import type { Flight } from "../../../../shared/types";

import styles from "./index.module.scss";

interface FlightCardProps {
  flight: Flight;
  selected: boolean;
}

export default function FlightCard(props: FlightCardProps) {
  const { flight, selected } = props;

  return (
    <article
      className={styles.card}
      data-selected={selected}
      onClick={() => flightResultsActions.selectFlight(flight.id)}
    >
      <div className={styles.head}>
        <h3 className={styles.airline}>{flight.airline}</h3>
        <span className={styles.flightNo}>{flight.flightNo}</span>
      </div>

      <div className={styles.route}>
        <div className={styles.point}>
          <div className={styles.time}>{flight.departTime}</div>
          <div className={styles.city}>{flight.from}</div>
        </div>
        <div className={styles.line} />
        <div className={styles.point}>
          <div className={styles.time}>{flight.arriveTime}</div>
          <div className={styles.city}>{flight.to}</div>
        </div>
      </div>

      <div className={styles.foot}>
        <span className={styles.cabin}>{flight.cabin}</span>
        <span className={styles.price}>¥{flight.price}</span>
      </div>
    </article>
  );
}
