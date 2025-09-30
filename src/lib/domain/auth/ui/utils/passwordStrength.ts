/**
 * Password strength validation utilities
 */

export interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
  met?: boolean;
}

export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  requirements: PasswordRequirement[];
}

export interface PasswordStrengthMessages {
  tooWeak: string;
  weak: string;
  medium: string;
  strong: string;
  veryStrong: string;
  reqMinLength: string;
  reqUppercase: string;
  reqLowercase: string;
  reqNumber: string;
  reqSpecial: string;
}

/**
 * Get password requirements with i18n labels
 */
export function getPasswordRequirements(messages: PasswordStrengthMessages): PasswordRequirement[] {
  return [
    {
      label: messages.reqMinLength,
      test: (pw) => pw.length >= 8,
    },
    {
      label: messages.reqUppercase,
      test: (pw) => /[A-Z]/.test(pw),
    },
    {
      label: messages.reqLowercase,
      test: (pw) => /[a-z]/.test(pw),
    },
    {
      label: messages.reqNumber,
      test: (pw) => /[0-9]/.test(pw),
    },
    {
      label: messages.reqSpecial,
      test: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw),
    },
  ];
}

/**
 * Calculate password strength based on requirements
 */
export function calculatePasswordStrength(password: string, messages: PasswordStrengthMessages): PasswordStrength {
  const passwordRequirements = getPasswordRequirements(messages);

  if (!password) {
    return {
      score: 0,
      label: messages.tooWeak,
      color: "bg-gray-300",
      requirements: passwordRequirements.map((req) => ({ ...req, met: false })),
    };
  }

  const requirements = passwordRequirements.map((req) => ({
    ...req,
    met: req.test(password),
  }));

  const metCount = requirements.filter((r) => r.met).length;
  const score = metCount;

  let label = messages.tooWeak;
  let color = "bg-red-500";

  if (score >= 5) {
    label = messages.veryStrong;
    color = "bg-green-500";
  } else if (score >= 4) {
    label = messages.strong;
    color = "bg-green-400";
  } else if (score >= 3) {
    label = messages.medium;
    color = "bg-yellow-500";
  } else if (score >= 2) {
    label = messages.weak;
    color = "bg-orange-500";
  }

  return {
    score,
    label,
    color,
    requirements,
  };
}

/**
 * Check if password meets all requirements
 */
export function isPasswordStrong(password: string, messages: PasswordStrengthMessages): boolean {
  const passwordRequirements = getPasswordRequirements(messages);
  return passwordRequirements.every((req) => req.test(password));
}

