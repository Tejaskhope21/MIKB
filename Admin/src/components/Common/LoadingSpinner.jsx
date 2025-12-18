import React from "react";

const LoadingSpinner = ({
  size = "md",
  color = "primary",
  variant = "spinner",
  label = "Loading...",
  showLabel = false,
  fullScreen = false,
  className = "",
  overlay = false,
}) => {
  // Size configurations
  const sizeConfig = {
    xs: {
      spinner: "h-3 w-3 border-2",
      dots: "h-1 w-1 mx-0.5",
      ring: "h-3 w-3",
      bars: "h-2 w-0.5",
      pulse: "h-3 w-3",
    },
    sm: {
      spinner: "h-4 w-4 border-2",
      dots: "h-1.5 w-1.5 mx-0.5",
      ring: "h-4 w-4",
      bars: "h-3 w-1",
      pulse: "h-4 w-4",
    },
    md: {
      spinner: "h-6 w-6 border-2",
      dots: "h-2 w-2 mx-1",
      ring: "h-6 w-6",
      bars: "h-4 w-1.5",
      pulse: "h-6 w-6",
    },
    lg: {
      spinner: "h-8 w-8 border-3",
      dots: "h-3 w-3 mx-1.5",
      ring: "h-8 w-8",
      bars: "h-6 w-2",
      pulse: "h-8 w-8",
    },
    xl: {
      spinner: "h-12 w-12 border-4",
      dots: "h-4 w-4 mx-2",
      ring: "h-12 w-12",
      bars: "h-8 w-3",
      pulse: "h-12 w-12",
    },
  };

  // Color configurations
  const colorConfig = {
    primary: {
      spinner: "border-blue-500 border-t-transparent",
      dots: "bg-blue-500",
      ring: "text-blue-500",
      bars: "bg-blue-500",
      pulse: "bg-blue-500",
      text: "text-blue-600",
    },
    secondary: {
      spinner: "border-gray-500 border-t-transparent",
      dots: "bg-gray-500",
      ring: "text-gray-500",
      bars: "bg-gray-500",
      pulse: "bg-gray-500",
      text: "text-gray-600",
    },
    success: {
      spinner: "border-green-500 border-t-transparent",
      dots: "bg-green-500",
      ring: "text-green-500",
      bars: "bg-green-500",
      pulse: "bg-green-500",
      text: "text-green-600",
    },
    warning: {
      spinner: "border-yellow-500 border-t-transparent",
      dots: "bg-yellow-500",
      ring: "text-yellow-500",
      bars: "bg-yellow-500",
      pulse: "bg-yellow-500",
      text: "text-yellow-600",
    },
    error: {
      spinner: "border-red-500 border-t-transparent",
      dots: "bg-red-500",
      ring: "text-red-500",
      bars: "bg-red-500",
      pulse: "bg-red-500",
      text: "text-red-600",
    },
    white: {
      spinner: "border-white border-t-transparent",
      dots: "bg-white",
      ring: "text-white",
      bars: "bg-white",
      pulse: "bg-white",
      text: "text-white",
    },
    dark: {
      spinner: "border-gray-800 border-t-transparent",
      dots: "bg-gray-800",
      ring: "text-gray-800",
      bars: "bg-gray-800",
      pulse: "bg-gray-800",
      text: "text-gray-800",
    },
  };

  const colors = colorConfig[color] || colorConfig.primary;
  const sizes = sizeConfig[size] || sizeConfig.md;

  // Render different spinner variants
  const renderSpinner = () => {
    switch (variant) {
      case "dots":
        return (
          <div className="flex items-center justify-center">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${colors.dots} ${sizes.dots} rounded-full animate-bounce`}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        );

      case "ring":
        return (
          <div className="relative">
            <div className={`${sizes.ring} ${colors.ring}`}>
              <svg
                className="animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  strokeWidth="4"
                  stroke="currentColor"
                  strokeLinecap="round"
                  className="opacity-25"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          </div>
        );

      case "bars":
        return (
          <div className="flex items-center justify-center space-x-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`${colors.bars} ${sizes.bars} animate-pulse`}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: "1s",
                }}
              />
            ))}
          </div>
        );

      case "pulse":
        return (
          <div className="relative">
            <div className={`${sizes.pulse} ${colors.pulse} rounded-full animate-ping opacity-75`} />
            <div className={`${sizes.pulse} ${colors.pulse} rounded-full absolute top-0 left-0`} />
          </div>
        );

      case "spinner":
      default:
        return (
          <div
            className={`${sizes.spinner} ${colors.spinner} rounded-full animate-spin ${className}`}
          />
        );
    }
  };

  // Full screen loading
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-50/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
        {renderSpinner()}
        {showLabel && (
          <p className={`mt-4 text-lg font-medium ${colors.text}`}>{label}</p>
        )}
      </div>
    );
  }

  // With overlay
  if (overlay) {
    return (
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-lg">
        {renderSpinner()}
        {showLabel && (
          <p className={`mt-2 text-sm font-medium ${colors.text}`}>{label}</p>
        )}
      </div>
    );
  }

  // Regular spinner
  return (
    <div className="flex flex-col items-center justify-center">
      {renderSpinner()}
      {showLabel && (
        <p className={`mt-2 text-sm font-medium ${colors.text}`}>{label}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;