export const validateHours = (event: InputEvent) => {
  const inputElement = event.target as HTMLInputElement
  const inputValue = inputElement.value

  const validHoursRegex = /^(0[0-9]|1[0-9]|2[0-3])$/
  if (!validHoursRegex.test(inputValue)) {
    inputElement.setCustomValidity('Invalid hours. Please enter a valid value (00 to 24).')
  } else {
    inputElement.setCustomValidity('')
  }
}

export const getDaysBetweenDates = (startDate: Date, endDate: Date) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const dayList = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayOfWeek = []

  for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
    const dayName = dayList[date.getDay()]
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const formattedDate = `${dayName} (${date.getDate().toString().padStart(2, '0')}-${month})`
    dayOfWeek.push(formattedDate)
  }

  return dayOfWeek
}
