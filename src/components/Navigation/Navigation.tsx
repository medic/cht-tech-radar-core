import Link from "next/link";

import styles from "./Navigation.module.css";

import IconFilter from "@/components/Icons/Filter";
import IconOverview from "@/components/Icons/Overview";
import IconQuestion from "@/components/Icons/Question";
import IconSearch from "@/components/Icons/Search";
import { getAppName } from "@/lib/data";

export function Navigation() {
  return (
    <nav className={styles.nav}>
      <ul className={styles.list}>
        <li className={styles.item}>
          <Link href="/help-and-about-tech-radar">
            <IconQuestion className={styles.icon} />
            <span className={styles.label}>How to use {getAppName()}?</span>
          </Link>
        </li>
        <li className={styles.item}>
          <IconFilter className={styles.icon} />
          <span className={styles.label}>Filter</span>
        </li>
        <li className={styles.item}>
          <Link href="/overview">
            <IconOverview className={styles.icon} />
            <span className={styles.label}>Technologies Overview</span>
          </Link>
        </li>
        <li className={styles.item}>
          <IconSearch className={styles.icon} />
          <span className={styles.label}>Search</span>
        </li>
      </ul>
    </nav>
  );
}