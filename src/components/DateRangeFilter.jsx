import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarDays, X } from 'lucide-react';

const DateRangeFilter = ({ fromDate, toDate, onChange }) => {
  const hasFilter = fromDate || toDate;

  // Since the input value can be YYYY-MM-DD strings, we need to create Date objects
  // The DatePicker expects local time, so parsing 'YYYY-MM-DD' should ideally be done carefully
  // but new Date(string) is fine here
  const startDate = fromDate ? new Date(fromDate + 'T00:00:00') : null;
  const endDate = toDate ? new Date(toDate + 'T00:00:00') : null;

  const handleClear = () => {
    onChange({ from_date: '', to_date: '' });
  };

  const handleChange = (dates) => {
    const [start, end] = dates;
    
    const formatDate = (date) => {
      if (!date) return '';
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${year}-${month}-${day}`;
    };

    onChange({
      from_date: formatDate(start),
      to_date: formatDate(end)
    });
  };

  return (
    <div className="chat-date-range">
      <span className="chat-date-range__icon">
        <CalendarDays size={15} />
      </span>

      <div className="chat-date-range__field">
        <DatePicker
          selectsRange={true}
          startDate={startDate}
          endDate={endDate}
          onChange={handleChange}
          placeholderText="Select dates"
          className="chat-date-range__input"
          dateFormat="MMM d, yyyy"
        />
      </div>

      {hasFilter && (
        <button
          type="button"
          className="chat-date-range__clear"
          onClick={handleClear}
          title="Clear date filter"
        >
          <X size={13} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
};

export default DateRangeFilter;
