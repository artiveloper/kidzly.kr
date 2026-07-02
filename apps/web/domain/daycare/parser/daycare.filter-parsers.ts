import { parseAsArrayOf, parseAsBoolean, parseAsString } from 'nuqs/server';

export const daycareFilterParsers = {
    type: parseAsArrayOf(parseAsString).withDefault([]),
    vehicle: parseAsBoolean.withDefault(false),
    services: parseAsArrayOf(parseAsString).withDefault([]),
    age: parseAsString,
};
