/**
 * Utility functions for formatting data in the admin panel
 */

/**
 * Format a date string to a readable format
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    return "Invalid Date";
  }
};

/**
 * Format a phone number for display
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  // Check if it's a valid US phone number
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === "1") {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  // Return original if not a standard format
  return phone;
};

/**
 * Truncate text to a specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

/**
 * Format address into a single line
 */
export const formatAddress = (address: string, city: string, state: string, zipCode: string): string => {
  return `${address}, ${city}, ${state} ${zipCode}`;
};

/**
 * Get verification status badge props
 */
export const getVerificationBadge = (isVerified: boolean) => {
  if (isVerified) {
    return {
      className: "bg-green-100 text-green-800",
      text: "Verified",
      icon: "CheckCircle",
    };
  } else {
    return {
      className: "bg-yellow-100 text-yellow-800",
      text: "Pending",
      icon: "Clock",
    };
  }
};

/**
 * Get active status badge props
 */
export const getActiveBadge = (isActive: boolean) => {
  if (isActive) {
    return {
      className: "bg-blue-100 text-blue-800",
      text: "Active",
      icon: "CheckCircle",
    };
  } else {
    return {
      className: "bg-gray-100 text-gray-800",
      text: "Inactive",
      icon: "XCircle",
    };
  }
};

/**
 * Debounce function for search inputs
 */
export const debounce = <T extends (...args: any[]) => any>(func: T, delay: number): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function to limit function calls to once per specified interval
 */
export const throttle = <T extends (...args: any[]) => any>(func: T, interval: number): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= interval) {
      lastCall = now;
      func(...args);
    }
  };
};

/**
 * Parse specialties array into a readable string
 */
export const formatSpecialties = (specialties: string[] | undefined): string => {
  if (!specialties || specialties.length === 0) {
    return "General Dentistry";
  }

  if (specialties.length === 1) {
    return specialties[0];
  }

  if (specialties.length <= 3) {
    return specialties.join(", ");
  }

  return `${specialties.slice(0, 2).join(", ")} and ${specialties.length - 2} more`;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length === 10 || (cleaned.length === 11 && cleaned[0] === "1");
};

/**
 * Generate a safe confirmation message for delete operations
 */
export const getDeleteConfirmationMessage = (itemName: string, itemType: string): string => {
  return `Are you sure you want to delete "${itemName}"? This will permanently remove this ${itemType} and all associated data. This action cannot be undone.`;
};
