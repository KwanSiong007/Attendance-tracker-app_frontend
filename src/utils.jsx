import {
  format,
  parseISO,
  differenceInHours,
  differenceInMinutes,
  isWithinInterval,
  startOfDay,
  endOfDay,
  subDays,
  isEqual,
} from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { styled } from "@mui/material/styles";

const TIME_ZONE = "Asia/Singapore";

export const showDate = (isoString) => {
  const parsed = parseISO(isoString);
  return `${format(parsed, "EEE, d")}\u00A0${format(parsed, "MMM")}`;
};

export const showCurrDate = (dateObj) => {
  return format(utcToZonedTime(dateObj, TIME_ZONE), "EEE, d MMM");
};

export const showCheckInTime = (isoString) => {
  return format(parseISO(isoString), "h:mm aa");
};

export const showCheckOutTime = (checkInIso, checkOutIso, nowLoaded) => {
  if (checkOutIso) {
    return format(parseISO(checkOutIso), "h:mm aa");
  } else if (extractDate(parseISO(checkInIso)) === extractDate(nowLoaded)) {
    return "Pending";
  } else {
    return "Nil";
  }
};

export const showCheckInOutTime = (checkInIso, checkOutIso, nowLoaded) => {
  const checkInParsed = parseISO(checkInIso);
  const checkInStr = `${format(checkInParsed, "h:mm aa")}`;

  if (checkOutIso) {
    return `${checkInStr} \u2013 ${format(parseISO(checkOutIso), "h:mm aa")}`;
  } else if (extractDate(parseISO(checkInIso)) === extractDate(nowLoaded)) {
    return checkInStr;
  } else {
    return `${checkInStr} \u2013 Nil`;
  }
};

export const showTimeDiff = (checkInIso, checkOutIso, nowLoaded) => {
  if (checkOutIso) {
    const start = parseISO(checkInIso);
    const end = parseISO(checkOutIso);
    const hoursDiff = differenceInHours(end, start);
    const minsDiff = differenceInMinutes(end, start) % 60;

    const hoursStr = `${hoursDiff} h`;
    const minsStr = `${minsDiff} min`;

    if (hoursDiff === 0) {
      return minsStr;
    } else if (minsDiff === 0) {
      return hoursStr;
    } else {
      return hoursStr + " " + minsStr;
    }
  } else if (extractDate(parseISO(checkInIso)) === extractDate(nowLoaded)) {
    return "Pending";
  } else {
    return "Nil";
  }
};

export const getLastWeek = (nowLoaded) => {
  const dateLoaded = utcToZonedTime(nowLoaded, TIME_ZONE);
  let startDate = startOfDay(subDays(dateLoaded, 6));

  if (isEqual(dateLoaded, startOfDay(dateLoaded))) {
    startDate = startOfDay(subDays(dateLoaded, 7));
  }
  return [startDate, endOfDay(dateLoaded)];
};

export const isWithinLastWeek = (checkInIso, nowLoaded) => {
  const checkInDate = utcToZonedTime(parseISO(checkInIso), TIME_ZONE);
  const [startDate, endDate] = getLastWeek(nowLoaded);

  return isWithinInterval(checkInDate, { start: startDate, end: endDate });
};

const getRandomTime = (start, end) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

export const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});
