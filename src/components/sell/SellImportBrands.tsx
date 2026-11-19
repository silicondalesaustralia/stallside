import Image from "next/image";
import { HOME_IMPORT_SOURCES } from "@/lib/home-page-copy";

/** Same platform marks as the social-kit home import strip. */
export default function SellImportBrands() {
  return (
    <ul className="brands" aria-label="Supported import sources">
      {HOME_IMPORT_SOURCES.map(({ name, icon }) => (
        <li key={name}>
          <Image
            src={icon}
            alt=""
            aria-hidden
            width={22}
            height={22}
            className="brand-mark"
          />
          <span>{name}</span>
        </li>
      ))}
    </ul>
  );
}
