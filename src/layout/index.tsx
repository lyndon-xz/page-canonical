import { resolveRoute, routes } from "@/router/routes";
import { useRoute } from "@/router/useRoute";

import styles from "./index.module.scss";

function BrandMark() {
  return (
    <span className={styles.mark}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        stroke="#fff"
        strokeWidth={2.4}
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <path d="M16 5 26 10.5 16 16 6 10.5Z" />
        <path d="M6 15.5 16 21 26 15.5" />
        <path d="M6 20.5 16 26 26 20.5" />
      </svg>
    </span>
  );
}

export default function Layout() {
  const { active, navigate } = useRoute();
  const { Component } = resolveRoute(active);

  return (
    <div className={styles.app}>
      <header className={styles.rail}>
        <div className={styles.railInner}>
          <div className={styles.brand}>
            <BrandMark />
            <span className={styles.name}>行程台</span>
            <span className={styles.sub}>page-canonical</span>
          </div>
          <nav className={styles.switch}>
            {routes.map((route) => {
              const { path, name, lib } = route;

              return (
                <button
                  key={path}
                  type="button"
                  className={
                    path === active
                      ? `${styles.stub} ${styles.stubActive}`
                      : styles.stub
                  }
                  onClick={() => navigate(path)}
                >
                  {name}
                  <span className={styles.stubSub}>{lib}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>
      <main className={styles.main}>
        <Component />
      </main>
    </div>
  );
}
