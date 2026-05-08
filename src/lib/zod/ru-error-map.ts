import type {
  $ZodErrorMap,
  $ZodStringFormatIssues,
  $ZodStringFormats,
} from "zod/v4/core";
import { util } from "zod/v4/core";

function getRussianPlural(
  count: number,
  one: string,
  few: string,
  many: string,
): string {
  const n = Math.abs(count);
  const mod10 = n % 10;
  const mod100 = n % 100;

  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

interface RussianSizable {
  unit: {
    one: string;
    few: string;
    many: string;
  };
}

const error: () => $ZodErrorMap = () => {
  const Sizable: Record<string, RussianSizable> = {
    string: {
      unit: {
        one: "символ",
        few: "символа",
        many: "символов",
      },
    },
    file: {
      unit: {
        one: "байт",
        few: "байта",
        many: "байт",
      },
    },
    array: {
      unit: {
        one: "элемент",
        few: "элемента",
        many: "элементов",
      },
    },
    set: {
      unit: {
        one: "элемент",
        few: "элемента",
        many: "элементов",
      },
    },
  };

  const OriginNames: Record<string, string> = {
    string: "текст",
    array: "массив",
    file: "файл",
    set: "набор",
    number: "число",
  };

  function getSizing(origin?: string): RussianSizable | null {
    if (!origin) return null;
    return Sizable[origin] ?? null;
  }

  const parsedType = (data: any): string => {
    const t = typeof data;

    switch (t) {
      case "number":
        return Number.isNaN(data) ? "NaN" : "число";
      case "string":
        return "строка";
      case "boolean":
        return "логическое значение";
      case "object":
        if (data === null) return "null";
        if (Array.isArray(data)) return "массив";
        if (
          Object.getPrototypeOf(data) !== Object.prototype &&
          data.constructor
        ) {
          return data.constructor.name;
        }
        return "объект";
      default:
        return t;
    }
  };

  const Nouns: {
    [k in $ZodStringFormats | (string & {})]?: string;
  } = {
    regex: "значение",
    email: "email‑адрес",
    url: "URL",
    emoji: "эмодзи",
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
    datetime: "дата и время ISO",
    date: "дата ISO",
    time: "время ISO",
    duration: "длительность ISO",
    ipv4: "IPv4‑адрес",
    ipv6: "IPv6‑адрес",
    cidrv4: "IPv4‑диапазон",
    cidrv6: "IPv6‑диапазон",
    base64: "строка в формате base64",
    base64url: "строка в формате base64url",
    json_string: "JSON‑строка",
    e164: "номер E.164",
    jwt: "JWT",
    template_literal: "значение",
  };

  return (issue) => {
    const subject = typeof issue.origin === "string" ? OriginNames[issue.origin] ?? "значение" : "значение";

    switch (issue.code) {
      case "invalid_type":
        return `Неверный тип данных: ожидался ${issue.expected}, получен ${parsedType(
          issue.input,
        )}`;

      case "invalid_value":
        if (issue.values.length === 1) {
          return `Недопустимое значение: ожидалось ${util.stringifyPrimitive(
            issue.values[0],
          )}`;
        }
        return `Недопустимое значение: ожидалось одно из ${util.joinValues(
          issue.values,
          " | ",
        )}`;

      case "too_big": {
        const adj = issue.inclusive ? "<=" : "<";
        const sizing = getSizing(issue.origin);
        if (sizing) {
          const max = Number(issue.maximum);
          const unit = getRussianPlural(
            max,
            sizing.unit.one,
            sizing.unit.few,
            sizing.unit.many,
          );
          return `Значение слишком большое: ожидается ${subject} ${adj}${max} ${unit}`;
        }
        return `Значение слишком большое: ожидается ${subject} ${adj}${issue.maximum}`;
      }

      case "too_small": {
        const adj = issue.inclusive ? ">=" : ">";
        const sizing = getSizing(issue.origin);
        if (sizing) {
          const min = Number(issue.minimum);
          const unit = getRussianPlural(
            min,
            sizing.unit.one,
            sizing.unit.few,
            sizing.unit.many,
          );
          return `Значение слишком маленькое: ожидается ${subject} ${adj}${min} ${unit}`;
        }
        return `Значение слишком маленькое: ожидается ${subject} ${adj}${issue.minimum}`;
      }

      case "invalid_format": {
        const _issue = issue as $ZodStringFormatIssues;
        if (_issue.format === "starts_with") {
          return `Недопустимая строка: должна начинаться с "${_issue.prefix}"`;
        }
        if (_issue.format === "ends_with") {
          return `Недопустимая строка: должна заканчиваться на "${_issue.suffix}"`;
        }
        if (_issue.format === "includes") {
          return `Недопустимая строка: должна содержать "${_issue.includes}"`;
        }
        if (_issue.format === "regex") {
          return `Недопустимая строка: должна соответствовать выражению ${_issue.pattern}`;
        }
        return `Неверный формат: ${Nouns[_issue.format] ?? issue.format}`;
      }

      case "not_multiple_of":
        return `Число должно быть кратно ${issue.divisor}`;

      case "unrecognized_keys":
        return `Неизвестные ключи: ${util.joinValues(issue.keys, ", ")}`;

      case "invalid_key":
        return `Недопустимый ключ в ${issue.origin}`;

      case "invalid_union":
        return "Недопустимые входные данные";

      case "invalid_element":
        return `Недопустимое значение в ${issue.origin}`;

      default:
        return "Недопустимые входные данные";
    }
  };
}

export default function (): { localeError: $ZodErrorMap } {
  return {
    localeError: error(),
  };
}