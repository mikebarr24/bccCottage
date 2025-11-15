const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function toDate(value: Date | string) {
  return typeof value === 'string' ? new Date(value) : value;
}

export function formatDate(value: Date | string) {
  return dateFormatter.format(toDate(value));
}

export function formatDateTime(value: Date | string) {
  return dateTimeFormatter.format(toDate(value));
}

