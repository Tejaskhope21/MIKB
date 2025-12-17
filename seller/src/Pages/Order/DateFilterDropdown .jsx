const DateFilterDropdown = ({ label, dateRange, onDateChange, onApply }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateDates = () => {
    if (dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      if (start > end) {
        setError('Start date cannot be after end date');
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleApply = () => {
    if (validateDates()) {
      onApply();
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    onDateChange({ start: '', end: '' });
    setError('');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="bg-white border border-gray-300 hover:border-gray-400 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Toggle ${label} date filter`}
        aria-expanded={isOpen}
      >
        <i className="far fa-calendar-alt mr-2 text-gray-400"></i>
        {label}
        {(dateRange.start || dateRange.end) && (
          <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-72 transition-all duration-200 ease-out opacity-0 translate-y-2 animate-dropdown">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Start Date
            </label>
            <input
              type="date"
              className={`w-full p-2.5 border rounded-lg text-sm ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
              value={dateRange.start || ''}
              onChange={(e) => onDateChange({ ...dateRange, start: e.target.value })}
              aria-label={`${label} start date`}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              End Date
            </label>
            <input
              type="date"
              className={`w-full p-2.5 border rounded-lg text-sm ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
              value={dateRange.end || ''}
              onChange={(e) => onDateChange({ ...dateRange, end: e.target.value })}
              aria-label={`${label} end date`}
            />
          </div>
          
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-600 flex items-center">
                <i className="fas fa-exclamation-circle mr-1.5"></i>
                {error}
              </p>
            </div>
          )}
          
          <div className="flex gap-2">
            <button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleApply}
              disabled={!!error}
              aria-label={`Apply ${label} date filter`}
            >
              Apply Filter
            </button>
            <button
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              onClick={handleClear}
              aria-label={`Clear ${label} date filter`}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes dropdownFade {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-dropdown {
          animation: dropdownFade 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default DateFilterDropdown;