import styles from "./index.module.scss";

interface PageHeroProps {
  eyebrow: string;
  title: string;
}

export default function PageHero(props: PageHeroProps) {
  const { eyebrow, title } = props;

  return (
    <header className={styles.hero}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1 className={styles.title}>{title}</h1>
    </header>
  );
}
