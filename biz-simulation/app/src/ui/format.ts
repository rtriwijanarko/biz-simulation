// One decimal at most, with the Indonesian decimal comma.
export const formatNumber = (value: number) => (Math.round(value * 10) / 10).toString().replace('.', ',')
