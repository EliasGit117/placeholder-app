import type {
  $ZodStringFormats,
  $ZodErrorMap,
  $ZodStringFormatIssues,
} from "zod/v4/core";
import { util } from "zod/v4/core";

function getRomanianPlural(
  count: number,
  one: string,
  few: string,
  many: string,
): string {
  const absCount = Math.abs(count);

  if (absCount === 1) {
    return one;
  }

  if (absCount === 0 || (absCount % 100 >= 1 && absCount % 100 <= 19)) {
    return few;
  }

  return many;
}

interface RomanianSizable {
  unit: {
    one: string;
    few: string;
    many: string;
  };
  verb: string;
}

const error: () => $ZodErrorMap = () => {
  const Sizable: Record<string, RomanianSizable> = {
    string: {
      unit: {
        one: "caracter",
        few: "caractere",
        many: "de caractere",
      },
      verb: "a avea",
    },
    file: {
      unit: {
        one: "octet",
        few: "octeți",
        many: "de octeți",
      },
      verb: "a avea",
    },
    array: {
      unit: {
        one: "element",
        few: "elemente",
        many: "de elemente",
      },
      verb: "a avea",
    },
    set: {
      unit: {
        one: "element",
        few: "elemente",
        many: "de elemente",
      },
      verb: "a avea",
    },
  };

  const OriginNames: Record<string, string> = {
    string: "text",
    array: "listă",
    file: "fișier",
    set: "set",
    number: "număr",
  };

  function getSizing(origin?: string): RomanianSizable | null {
    if (!origin) return null;
    return Sizable[origin] ?? null;
  }

  const parsedType = (data: unknown): string => {
    const t = typeof data;

    switch (t) {
      case "number":
        return Number.isNaN(data) ? "NaN" : "număr";
      case "object":
        if (Array.isArray(data)) return "listă";
        if (data === null) return "null";
        if (
          Object.getPrototypeOf(data) !== Object.prototype &&
          (data as any).constructor
        ) {
          return (data as any).constructor.name;
        }
        return "obiect";
      case "string":
        return "șir";
      case "boolean":
        return "boolean";
      default:
        return t;
    }
  };

  const Nouns: {
    [k in $ZodStringFormats | (string & {})]?: string;
  } = {
    regex: "valoare",
    email: "adresă email",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "dată și oră ISO",
    date: "dată ISO",
    time: "oră ISO",
    duration: "durată ISO",
    ipv4: "adresă IPv4",
    ipv6: "adresă IPv6",
    cidrv4: "interval IPv4",
    cidrv6: "interval IPv6",
    base64: "șir în format base64",
    base64url: "șir în format base64url",
    json_string: "șir JSON",
    e164: "număr E.164",
    jwt: "JWT",
    template_literal: "valoare",
  };

  return (issue) => {
    const subject =
      typeof issue.origin === "string"
        ? OriginNames[issue.origin] ?? "valoarea"
        : "valoarea";

    switch (issue.code) {
      case "invalid_type":
        return `Tip de date invalid: se aștepta ${issue.expected}, dar s-a primit ${parsedType(
          issue.input,
        )}`;

      case "invalid_value":
        if (issue.values.length === 1) {
          return `Valoare invalidă: se aștepta ${util.stringifyPrimitive(
            issue.values[0],
          )}`;
        }
        return `Valoare invalidă: se aștepta una dintre ${util.joinValues(
          issue.values,
          " | ",
        )}`;

      case "too_big": {
        const adj = issue.inclusive ? "<=" : "<";
        const sizing = getSizing(issue.origin);
        if (sizing) {
          const max = Number(issue.maximum);
          const unit = getRomanianPlural(
            max,
            sizing.unit.one,
            sizing.unit.few,
            sizing.unit.many,
          );
          return `Valoare prea mare: se aștepta ca ${subject} să fie ${adj}${issue.maximum.toString()} ${unit}`;
        }
        return `Valoare prea mare: se aștepta ca ${subject} să fie ${adj}${issue.maximum.toString()}`;
      }

      case "too_small": {
        const adj = issue.inclusive ? ">=" : ">";
        const sizing = getSizing(issue.origin);
        if (sizing) {
          const min = Number(issue.minimum);
          const unit = getRomanianPlural(
            min,
            sizing.unit.one,
            sizing.unit.few,
            sizing.unit.many,
          );
          return `Valoare prea mică: se aștepta ca ${subject} să fie ${adj}${issue.minimum.toString()} ${unit}`;
        }
        return `Valoare prea mică: se aștepta ca ${subject} să fie ${adj}${issue.minimum.toString()}`;
      }

      case "invalid_format": {
        const _issue = issue as $ZodStringFormatIssues;
        if (_issue.format === "starts_with") {
          return `Șir invalid: trebuie să înceapă cu "${_issue.prefix}"`;
        }
        if (_issue.format === "ends_with") {
          return `Șir invalid: trebuie să se termine cu "${_issue.suffix}"`;
        }
        if (_issue.format === "includes") {
          return `Șir invalid: trebuie să conțină "${_issue.includes}"`;
        }
        if (_issue.format === "regex") {
          return `Șir invalid: trebuie să respecte expresia ${_issue.pattern}`;
        }
        return `Format invalid: ${Nouns[_issue.format] ?? issue.format}`;
      }

      case "not_multiple_of":
        return `Număr invalid: trebuie să fie multiplu de ${issue.divisor}`;

      case "unrecognized_keys":
        return `Che${issue.keys.length > 1 ? "i" : "ie"} necunoscut${issue.keys.length > 1 ? "e" : "ă"}: ${util.joinValues(
          issue.keys,
          ", ",
        )}`;

      case "invalid_key":
        return `Cheie invalidă în ${issue.origin}`;

      case "invalid_union":
        return "Date de intrare invalide";

      case "invalid_element":
        return `Valoare invalidă în ${issue.origin}`;

      default:
        return "Date de intrare invalide";
    }
  };
};

export default function (): { localeError: $ZodErrorMap } {
  return {
    localeError: error(),
  };
}