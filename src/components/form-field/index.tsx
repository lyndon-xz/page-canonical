import type { ReactNode } from "react";

import styles from "./index.module.scss";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  /** 由使用方补充网格定位一类的布局类 */
  className?: string;
  children: ReactNode;
}

export default function FormField(props: FormFieldProps) {
  const { label, htmlFor, error, className, children } = props;

  return (
    <div className={`${styles.field} ${className ?? ""}`.trim()}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
