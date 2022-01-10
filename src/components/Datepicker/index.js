import React, { useState } from "react";
import PropTypes from "prop-types";
import Calendar from "../Calendar";
import * as Styled from "./styles";
import { isDate, getDateISO } from "../../helpers/calendar";
import { useEffect } from "react/cjs/react.development";
export default function Datepicker(props) {
  const [dateState, setDateState] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { label } = props;

  const toggleCalendar = () => setCalendarOpen(!calendarOpen);
  const handleChange = (evt) => evt.preventDefault();
  const handleDateChange = (date) => {
    const newDate = date ? getDateISO(date) : null;
    dateState !== newDate &&
      setDateState(newDate) &&
      setCalendarOpen(false) &&
      props.onDateChanged(dateState);
  };
  useEffect(() => {
    const newDate = props.value && new Date(props.value);
    isDate(newDate) && setDateState(getDateISO(newDate));
  }, []);

  useEffect(() => {
    const dateISO = getDateISO(new Date(dateState));
    setDateState(dateISO);
  }, [props]);

  return (
    <Styled.DatePickerContainer>
      <Styled.DatePickerFormGroup>
        <Styled.DatePickerLabel>{label || "Enter Date"}</Styled.DatePickerLabel>

        <Styled.DatePickerInput
          type="text"
          value={dateState ? dateState.split("-").join(" / ") : ""}
          onChange={handleChange}
          readOnly="readonly"
          placeholder="YYYY / MM / DD"
        />
      </Styled.DatePickerFormGroup>
      <Styled.DatePickerDropdown isOpen={calendarOpen} toggle={toggleCalendar}>
        <Styled.DatePickerDropdownToggle color="transparent" />
        <Styled.DatePickerDropdownMenu>
          {calendarOpen && (
            <Calendar
              date={dateState && new Date(dateState)}
              onDateChanged={handleDateChange}
            />
          )}
        </Styled.DatePickerDropdownMenu>
      </Styled.DatePickerDropdown>
    </Styled.DatePickerContainer>
  );
}
Datepicker.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onDateChanged: PropTypes.func,
};
