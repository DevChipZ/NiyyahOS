export const TARGET_PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export const formatTo12Hour = (time24) => {
  const [hours, minutes] = time24.split(':');
  let h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${minutes} ${ampm}`;
};

export const getPrayerDateObject = (time24) => {
  const [hours, minutes] = time24.split(':');
  const date = new Date();
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  return date;
};

export const scheduleLocalNotifications = (prayers) => {
  if (!('Notification' in window)) return;

  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      const now = new Date();
      TARGET_PRAYERS.forEach((prayerName) => {
        const prayerTime = prayers[prayerName];
        if (!prayerTime) return;

        // Clean Aladhan time string (e.g., "05:30 (IST)" -> "05:30")
        const cleanTime = prayerTime.split(' ')[0];
        const targetDate = getPrayerDateObject(cleanTime);
        const timeUntil = targetDate.getTime() - now.getTime();

        // Schedule only if the prayer is in the future (today)
        if (timeUntil > 0) {
          setTimeout(() => {
            new Notification(`Niyyah: Time for ${prayerName}`, {
              body: `It's time to pray ${prayerName}.`,
              icon: '/vite.svg', 
            });
          }, timeUntil);
        }
      });
    }
  });
};
