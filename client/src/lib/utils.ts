import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string, currency: string = 'INR'): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Currency-specific formatting
  const currencyConfig = {
    'INR': { locale: 'en-IN', currency: 'INR' },
    'USD': { locale: 'en-US', currency: 'USD' },
    'EUR': { locale: 'en-EU', currency: 'EUR' },
    'GBP': { locale: 'en-GB', currency: 'GBP' }
  };
  
  const config = currencyConfig[currency as keyof typeof currencyConfig] || currencyConfig.INR;
  
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
  }).format(numAmount);
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
