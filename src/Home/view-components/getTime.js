export const getTime = (cur, thirtyMinSize) => {
  const thirtyMinIncrementsMultiple = 30 / thirtyMinSize;
  const numOfThirtyMinIncrements = cur * thirtyMinIncrementsMultiple;
  const hr = Math.floor(numOfThirtyMinIncrements / 60);
  const min = ((numOfThirtyMinIncrements / 30) % 2) * 30;
  return `${hr.toString().length <= 1 ? '0' + hr : hr}:${
    min === 0 ? '00' : min
  }`;
  // hr: 00-23
  // min: 00-59
};

export const getPosAndSize = (cur, thirtyMinSize) => {
  const { start_time, end_time } = cur;
  let start = String(start_time).match(/^(\d+):(\d+)$/);
  let end = String(end_time).match(/^(\d+):(\d+)$/);
  start = start === null ? ['00:00', '00', '00'] : start;
  end = end === null ? ['00:00', '00', '00'] : end;
  const startHours = parseInt(start[1], 10);
  const startMinutes = parseInt(start[2], 10);
  const endHours = parseInt(end[1], 10);
  const endMinutes = parseInt(end[2], 10);
  let pos = 0;
  let size = 0;

  if (startMinutes < 30) {
    pos = thirtyMinSize * (2 * startHours);
  } else if (startMinutes >= 30) {
    pos = thirtyMinSize * (2 * startHours + 1);
  }
  if (endMinutes < 30) {
    size = thirtyMinSize * (2 * endHours) - pos;
  } else if (endMinutes >= 30) {
    if (endMinutes === 59) {
      size = thirtyMinSize * (2 * endHours + 2) - pos;
    } else {
      size = thirtyMinSize * (2 * endHours + 1) - pos;
    }
  }

  if (size <= 0) {
    size = 0;
  }

  return { pos: pos, size: size };
};
