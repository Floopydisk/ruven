"use client"

import { useState } from "react"
import { formatDate } from "@/lib/date-utils"

interface SimpleCalendarProps {
  onDateSelect?: (date: Date) => void
  selectedDate?: Date
}

export function SimpleCalendar({ onDateSelect, selectedDate }: SimpleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selected, setSelected] = useState<Date | undefined>(selectedDate)

  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

  const startDate = new Date(firstDayOfMonth)
  startDate.setDate(startDate.getDate() - startDate.getDay())

  const endDate = new Date(lastDayOfMonth)
  if (endDate.getDay() < 6) {
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))
  }

  const days: Date[] = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    days.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  const handleDateClick = (date: Date) => {
    setSelected(date)
    if (onDateSelect) {
      onDateSelect(date)
    }
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth()
  }

  const isSelectedDate = (date: Date) => {
    return (
      selected &&
      date.getDate() === selected.getDate() &&
      date.getMonth() === selected.getMonth() &&
      date.getFullYear() === selected.getFullYear()
    )
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100">
          &lt;
        </button>
        <h2 className="text-lg font-semibold">
          {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h2>
        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100">
          &gt;
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((date, i) => (
          <button
            key={i}
            onClick={() => handleDateClick(date)}
            className={`
              h-10 w-10 flex items-center justify-center rounded-full text-sm
              ${isCurrentMonth(date) ? "text-gray-900" : "text-gray-400"}
              ${isSelectedDate(date) ? "bg-blue-600 text-white" : "hover:bg-gray-100"}
            `}
          >
            {date.getDate()}
          </button>
        ))}
      </div>

      {selected && <div className="mt-4 text-center text-sm text-gray-600">Selected: {formatDate(selected)}</div>}
    </div>
  )
}
