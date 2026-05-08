import type {
  $ZodErrorMap,
  $ZodStringFormatIssues,
  $ZodStringFormats,
} from "zod/v4/core";
import { util } from "zod/v4/core";

function getEnglishPlural(
  count: number,
  one: string,
  many: string,
): string {
  return Math.abs(count) === 1 ? one : many;
}

interface EnglishSizable {
  unit: {
    one: string;
    many: string;
  };
}

const error: () => $ZodErrorMap = () => {
  const Sizable: Record<string, EnglishSizable> = {
    string: {
      unit: {
        one: "character",
        many: "characters",
      },
    },
    file: {
      unit: {
        one: "byte",
        many: "bytes",
      },
    },
    array: {
      unit: {
        one: "element",
        many: "elements",
      },
    },
    set: {
      unit: {
        one: "element",
        many: "elements",
      },
    },
  };

  const OriginNames: Record<string, string> = {
    string: "text",
    array: "array",
    file: "file",
    set: "set",
    number: "number",
  };

  function getSizing(origin?: string): EnglishSizable | null {
    if (!origin) return null;
    return Sizable[origin] ?? null;
  }

  const parsedType = (data: unknown): string => {
    const t = typeof data;

    switch (t) {
      case "number":
        return Number.isNaN(data) ? "NaN" : "number";
      case "string":
        return "string";
      case "boolean":
        return "boolean";
      case "object":
        if (data === null) return "null";
        if (Array.isArray(data)) return "array";
        if (
          Object.getPrototypeOf(data) !== Object.prototype &&
          (data as any).constructor
        ) {
          return (data as any).constructor.name;
        }
        return "object";
      default:
        return t;
    }
  };

  const Nouns: {
    [k in $ZodStringFormats | (string & {})]?: string;
  } = {
    regex: "value",
    email: "email address",
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
    datetime: "ISO datetime",
    date: "ISO date",
    time: "ISO time",
    duration: "ISO duration",
    ipv4: "IPv4 address",
    ipv6: "IPv6 address",
    cidrv4: "IPv4 range",
    cidrv6: "IPv6 range",
    base64: "base64 string",
    base64url: "base64url string",
    json_string: "JSON string",
    e164: "E.164 number",
    jwt: "JWT",
    template_literal: "value",
  };

  return (issue) => {
    const subject =
      typeof issue.origin === "string" ? OriginNames[issue.origin] ?? "value" : "value";

    switch (issue.code) {
      case "invalid_type":
        return `Invalid type: expected ${issue.expected}, received ${parsedType(
          issue.input,
        )}`;

      case "invalid_value":
        if (issue.values.length === 1) {
          return `Invalid value: expected ${util.stringifyPrimitive(
            issue.values[0],
          )}`;
        }
        return `Invalid value: expected one of ${util.joinValues(
          issue.values,
          " | ",
        )}`;

      case "too_big": {
        const adj = issue.inclusive ? "<=" : "<";
        const sizing = getSizing(issue.origin);
        if (sizing) {
          const max = Number(issue.maximum);
          const unit = getEnglishPlural(
            max,
            sizing.unit.one,
            sizing.unit.many,
          );
          return `Value is too large: expected ${subject} ${adj}${max} ${unit}`;
        }
        return `Value is too large: expected ${subject} ${adj}${issue.maximum}`;
      }

      case "too_small": {
        const adj = issue.inclusive ? ">=" : ">";
        const sizing = getSizing(issue.origin);
        if (sizing) {
          const min = Number(issue.minimum);
          const unit = getEnglishPlural(
            min,
            sizing.unit.one,
            sizing.unit.many,
          );
          return `Value is too small: expected ${subject} ${adj}${min} ${unit}`;
        }
        return `Value is too small: expected ${subject} ${adj}${issue.minimum}`;
      }

      case "invalid_format": {
        const _issue = issue as $ZodStringFormatIssues;
        if (_issue.format === "starts_with") {
          return `Invalid string: must start with "${_issue.prefix}"`;
        }
        if (_issue.format === "ends_with") {
          return `Invalid string: must end with "${_issue.suffix}"`;
        }
        if (_issue.format === "includes") {
          return `Invalid string: must include "${_issue.includes}"`;
        }
        if (_issue.format === "regex") {
          return `Invalid string: must match pattern ${_issue.pattern}`;
        }
        return `Invalid format: ${Nouns[_issue.format] ?? issue.format}`;
      }

      case "not_multiple_of":
        return `Number must be a multiple of ${issue.divisor}`;

      case "unrecognized_keys":
        return `Unrecognized key${
          issue.keys.length > 1 ? "s" : ""
        }: ${util.joinValues(issue.keys, ", ")}`;

      case "invalid_key":
        return `Invalid key in ${issue.origin}`;

      case "invalid_union":
        return "Invalid input";

      case "invalid_element":
        return `Invalid value in ${issue.origin}`;

      default:
        return "Invalid input";
    }
  };
};

export default function (): { localeError: $ZodErrorMap } {
  return {
    localeError: error(),
  };
}