import React, { Component, Fragment, useEffect, useState } from "react";
import PropTypes from "prop-types";
import * as Styled from "./styles";
import calendar, {
  isDate,
  isSameDay,
  isSameMonth,
  getDateISO,
  getNextMonth,
  getPreviousMonth,
  WEEK_DAYS,
  CALENDAR_MONTHS,
} from "../../helpers/calendar";

export default function Calendar({ date, onDateChanged }) {
  const [dateState, setDateState] = useState({
    current: new Date(),
    month: 0,
    year: 0,
  });
  const [today, setToday] = useState(new Date());
  let pressureTimer, pressureTimeout, dayTimeout;

  useEffect(() => {
    addDateToState(date);
  }, []);

  const addDateToState = (date) => {
    // return this.resolveStateFromDate(this.props.date);
    const isDateObject = isDate(date);
    const _date = isDateObject ? date : new Date();
    setDateState({
      current: isDateObject ? date : null,
      month: +_date.getMonth() + 1,
      year: _date.getFullYear(),
    });
  };
  const getCalendarDates = () => {
    const { current, month, year } = dateState;
    console.log(typeof current);
    console.log(dateState);
    const calendarMonth = month || +current?.getMonth() + 1;
    const calendarYear = year || current?.getFullYear();
    return calendar(calendarMonth, calendarYear);
  };

  //new start

  const renderMonthAndYear = () => {
    const { month, year } = dateState;

    // Resolve the month name from the CALENDAR_MONTHS object map
    const monthname =
      Object.keys(CALENDAR_MONTHS)[Math.max(0, Math.min(month - 1, 11))];
    return (
      <Styled.CalendarHeader>
        <Styled.ArrowLeft
          onMouseDown={handlePrevious}
          onMouseUp={clearPressureTimer}
          title="Previous Month"
        />

        <Styled.CalendarMonth>
          {monthname} {year}
        </Styled.CalendarMonth>

        <Styled.ArrowRight
          onMouseDown={handleNext}
          onMouseUp={clearPressureTimer}
          title="Next Month"
        />
      </Styled.CalendarHeader>
    );
  };
  // Render the label for day of the week
  // This method is used as a map callback as seen in render()
  const renderDayLabel = (day, index) => {
    // Resolve the day of the week label from the WEEK_DAYS object map
    const daylabel = WEEK_DAYS[day].toUpperCase();

    return (
      <Styled.CalendarDay key={daylabel} index={index}>
        {daylabel}
      </Styled.CalendarDay>
    );
  };
  // Render a calendar date as returned from the calendar builder function
  // This method is used as a map callback as seen in render()
  const renderCalendarDate = (date, index) => {
    const { current, month, year } = dateState;
    const _date = new Date(date.join("-"));
    // Check if calendar date is same day as today
    const isToday = isSameDay(_date, today);

    // Check if calendar date is same day as currently selected date
    const isCurrent = current && isSameDay(_date, current);

    // Check if calendar date is in the same month as the state month and year
    const inMonth =
      month && year && isSameMonth(_date, new Date([year, month, 1].join("-")));
    // The click handler
    const onClick = gotoDate(_date);
    const props = { index, inMonth, onClick, title: _date.toDateString() };
    // Conditionally render a styled date component
    const DateComponent = isCurrent
      ? Styled.HighlightedCalendarDate
      : isToday
      ? Styled.TodayCalendarDate
      : Styled.CalendarDate;
    return (
      <DateComponent key={getDateISO(_date)} {...props}>
        {_date.getDate()}
      </DateComponent>
    );
  };

  // new 2

  const gotoDate = (date) => (evt) => {
    evt && evt.preventDefault();
    const { current } = dateState;

    !(current && isSameDay(date, current)) && addDateToState(date);
    onDateChanged(date);
  };
  const gotoPreviousMonth = () => {
    const { month, year } = dateState;
    // this.setState(getPreviousMonth(month, year));
    const previousMonth = getPreviousMonth(month, year);
    setDateState({
      month: previousMonth.month,
      year: previousMonth.year,
      current: dateState.current,
    });
  };
  const gotoNextMonth = () => {
    const { month, year } = dateState;
    //this.setState(getNextMonth(month, year));
    const nextMonth = getNextMonth(month, year);
    setDateState({
      month: nextMonth.month,
      year: nextMonth.year,
      current: dateState.current,
    });
  };
  const gotoPreviousYear = () => {
    const { year } = dateState;
    setDateState({
      month: dateState.month,
      year: year - 1,
      current: dateState.current,
    });
  };
  const gotoNextYear = () => {
    const { year } = dateState;
    setDateState({
      month: dateState.month,
      year: year + 1,
      current: dateState.current,
    });
  };
  const handlePressure = (fn) => {
    if (typeof fn === "function") {
      fn();
      pressureTimeout = setTimeout(() => {
        pressureTimer = setInterval(fn, 100);
      }, 500);
    }
  };
  const clearPressureTimer = () => {
    pressureTimer && clearInterval(pressureTimer);
    pressureTimeout && clearTimeout(pressureTimeout);
  };
  const handlePrevious = (evt) => {
    evt && evt.preventDefault();
    const fn = evt.shiftKey ? gotoPreviousYear : gotoPreviousMonth;
    handlePressure(fn);
  };
  const handleNext = (evt) => {
    evt && evt.preventDefault();
    const fn = evt.shiftKey ? gotoNextYear : gotoNextMonth;
    handlePressure(fn);
  };

  // lifecycle methods
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000;
    const ms = tomorrow - now;
    dayTimeout = setTimeout(() => {
      setToday(new Date());
      clearDayTimeout();
    }, ms);
    return () => {
      clearPressureTimer();
      clearDayTimeout();
    };
  }, []);

  // componentDidUpdate(prevProps) {
  //   const { date, onDateChanged } = this.props;
  //   const { date: prevDate } = prevProps;
  //   const dateMatch = date == prevDate || isSameDay(date, prevDate);
  //   !dateMatch &&
  //     this.setState(this.resolveStateFromDate(date), () => {
  //       typeof onDateChanged === "function" && onDateChanged(date);
  //     });
  // }

  const clearDayTimeout = () => {
    dayTimeout && clearTimeout(dayTimeout);
  };

  return (
    <Styled.CalendarContainer>
      {renderMonthAndYear()}
      <Styled.CalendarGrid>
        <Fragment>{Object.keys(WEEK_DAYS).map(renderDayLabel)}</Fragment>
        <Fragment>{getCalendarDates().map(renderCalendarDate)}</Fragment>
      </Styled.CalendarGrid>
    </Styled.CalendarContainer>
  );
}

Calendar.propTypes = {
  date: PropTypes.instanceOf(Date),
  onDateChanged: PropTypes.func,
};
