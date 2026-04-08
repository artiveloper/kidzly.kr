import { parseAsArrayOf, parseAsBoolean, parseAsString } from 'nuqs/server';

export const daycareFilterParsers = {
    type: parseAsString.withDefault('all'),
    vehicle: parseAsBoolean.withDefault(false),
    services: parseAsArrayOf(parseAsString).withDefault([]),
    age: parseAsString.withDefault(''),
};
