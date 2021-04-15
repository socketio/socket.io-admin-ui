import { findIndex } from "lodash-es";

const testLocalStorage = () => {
  const test = "test";
  try {
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

export const isLocalStorageAvailable = testLocalStorage();

export function formatDuration(duration) {
  const d = Math.ceil(Math.max(duration, 0));
  const days = Math.floor(d / 86400);
  const hours = Math.floor((d - days * 86400) / 3600);
  const minutes = Math.floor((d - days * 86400 - hours * 3600) / 60);
  const seconds = Math.ceil(d) - days * 86400 - hours * 3600 - minutes * 60;

  const output = [];
  if (days > 0) {
    output.push(days + "d");
  }
  if (days > 0 || hours > 0) {
    output.push(hours + "h");
  }
  if (days > 0 || hours > 0 || minutes > 0) {
    output.push(minutes + "m");
  }
  output.push(seconds + "s");
  return output.join(" ");
}

/**
 * lodash remove() does not play well with Vue.js
 */
export function remove(array, predicate) {
  const index =
    typeof predicate === "object"
      ? findIndex(array, predicate)
      : array.indexOf(predicate);
  return index === -1 ? [] : array.splice(index, 1);
}

export function pushUniq(array, elem) {
  if (!array.includes(elem)) {
    array.push(elem);
  }
}

export function percentage(value, total) {
  return total === 0 ? 0 : ((value / total) * 100).toFixed(1);
}
