/** Domena produkcyjna — strona, aplikacja webowa i linki do kanałów. */
export const APP_DOMAIN = "impuls.app";
export const APP_URL = `https://${APP_DOMAIN}`;

/** Publiczny adres kanału twórcy, np. impuls.app/k/marta-zielinska */
export const channelPath = (slug: string) => `${APP_DOMAIN}/k/${slug}`;
