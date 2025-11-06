export const parseUTCDate = (dateString: string | Date | null | undefined): Date | null => {
    if (!dateString) return null;

    if (dateString instanceof Date) {
        return dateString;
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return null;
    }

    return date;
};

export const formatDateToUTC = (date: Date | null | undefined): string | null => {
    if (!date) return null;

    if (!(date instanceof Date) || isNaN(date.getTime())) {
        return null;
    }

    return date.toISOString();
};

export const parseUTCDateString = (dateString: string | null | undefined): string | null => {
    const date = parseUTCDate(dateString);
    return formatDateToUTC(date);
};

export const parseSmartDate = (dateString: string | null | undefined): Date | null => {
    if (!dateString) return null;

    const date = parseUTCDate(dateString);
    if (date) return date;

    const formattedDate = parseUTCDateString(dateString);
    if (formattedDate) return parseUTCDate(formattedDate);

    return null;
};

export const parseDatePreserveDay = (input: string | Date | null | undefined): Date | null => {
    if (!input) return null;
    if (input instanceof Date) return input;
    const s = input as string;
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
        const y = Number(m[1]);
        const mo = Number(m[2]) - 1;
        const d = Number(m[3]);
        const localDate = new Date(y, mo, d);
        if (isNaN(localDate.getTime())) return null;
        return localDate;
    }
    const date = new Date(s);
    if (isNaN(date.getTime())) return null;
    return date;
};
