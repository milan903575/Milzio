import dayjs from 'https://cdn.jsdelivr.net/npm/dayjs@1.11.13/+esm';

export const deliveryOptions = [
  { id: '1', deliveryDays: 7, priceCents: 0 },
  { id: '2', deliveryDays: 3, priceCents: 5000 },
  { id: '3', deliveryDays: 1, priceCents: 10000 },
];

export function getDeliveryOption(deliveryOptionId) {
  return (
    deliveryOptions.find((option) => option.id === deliveryOptionId) ||
    deliveryOptions[0]
  );
}

export function calculateDeliveryDate(deliveryOption) {
  const deliveryDate = dayjs().add(deliveryOption.deliveryDays, 'days');
  return deliveryDate.format('dddd, MMMM D');
}