// TODO: Implement loading skeleton component

const LoadingSkeleton = ({ variant = 'default' }) => {
  return (
    <div className={`loading-skeleton loading-skeleton--${variant}`} aria-busy="true">
      {/* TODO: Render skeleton placeholders based on variant (card, table, form) */}
      <p>Loading...</p>
    </div>
  );
};

export default LoadingSkeleton;
