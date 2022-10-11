// META: script=/resources/test-only-api.js
// META: script=resources/pressure-helpers.js

'use strict';

pressure_test(async (t, mockPressureService) => {
  const kReadings = ['nominal', 'fair', 'serious', 'critical'];

  const kSampleRate = 4.0;
  const pressureChanges = await new Promise(async resolve => {
    const observerChanges = [];
    const observer = new PressureObserver(changes => {
      observerChanges.push(changes);
    }, {sampleRate: kSampleRate});
    observer.observe('cpu');

    mockPressureService.startPlatformCollector(kSampleRate * 2);
    let i = 0;
    // mockPressureService.updatesDelivered() does not necessarily match
    // pressureChanges.length, as system load and browser optimizations can
    // cause the actual timer used by mockPressureService to deliver readings
    // to be a bit slower or faster than requested.
    while (observerChanges.length < 4) {
      mockPressureService.setPressureUpdate(kReadings[i++ % kReadings.length]);
      await t.step_wait(
          () => mockPressureService.updatesDelivered() == i,
          `${i} readings have been delivered`);
    }
    observer.disconnect();
    resolve(observerChanges);
  });

  assert_equals(pressureChanges.length, 4);
  assert_greater_than_equal(
      pressureChanges[1][0].time - pressureChanges[0][0].time,
      (1 / kSampleRate * 1000));
  assert_greater_than_equal(
      pressureChanges[2][0].time - pressureChanges[1][0].time,
      (1 / kSampleRate * 1000));
  assert_greater_than_equal(
      pressureChanges[3][0].time - pressureChanges[2][0].time,
      (1 / kSampleRate * 1000));
}, 'Faster collector: Timestamp difference between two changes should be higher or equal to the observer sample rate');
